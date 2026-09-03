<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseProgress;
use App\Models\LessonProgress;
use App\Models\Organization;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = Course::with(['category', 'creator'])
            ->withCount(['modules', 'batches']);

        if ($authUser?->hasRole('Student')) {
            $query->whereHas('batches.enrollments', fn($q) => $q
                ->where('student_id', $authUser->id)
                ->whereIn('status', ['Pending', 'Active']));
        }

        if ($request->filled('category_uuid')) {
            $cat = CourseCategory::where('uuid', $request->category_uuid)->first();
            if ($cat) {
                $query->where('category_id', $cat->id);
            }
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('code', 'like', "%{$term}%")
                  ->orWhere('short_description', 'like', "%{$term}%");
            });
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        $courses = collect($paginated->items())->map(function ($course) use ($authUser) {
            if ($authUser?->hasRole('Student')) {
                $progress = CourseProgress::where('user_id', $authUser->id)
                    ->where('course_id', $course->id)
                    ->orderByDesc('progress_percentage')
                    ->first();
                $course->setAttribute('learning_progress', $progress ? [
                    'percentage' => (float) $progress->progress_percentage,
                    'completed_lessons' => $progress->completed_lessons_count,
                    'total_lessons' => $progress->total_lessons_count,
                ] : null);
            }

            return $course;
        });

        return ApiResponse::success($courses, 'Courses list retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('courses.create')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();

        $validated = $request->validate([
            'category_uuid' => ['required', 'exists:course_categories,uuid'],
            'code' => ['required', 'string', 'max:50', Rule::unique('courses', 'code')->where(fn($q) => $q->where('organization_id', $org->id))],
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'duration' => ['required', 'integer', 'min:1'],
            'duration_unit' => ['required', 'in:hours,days,weeks,months'],
            'level' => ['required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,active,archived'],
        ]);

        $category = CourseCategory::where('uuid', $validated['category_uuid'])->firstOrFail();

        $course = Course::create([
            'organization_id' => $org->id,
            'category_id' => $category->id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'duration' => $validated['duration'],
            'duration_unit' => $validated['duration_unit'],
            'level' => $validated['level'],
            'status' => $validated['status'] ?? 'active',
            'created_by' => $authUser->id,
        ]);

        AuditLogService::log('course.create', $course, null, $course->toArray());

        return ApiResponse::success($course->load(['category']), 'Course created successfully.', 201);
    }

    public function show(Course $course): JsonResponse
    {
        $authUser = request()->user();
        if ($authUser?->hasRole('Student') && !$course->batches()
            ->whereHas('enrollments', fn($q) => $q
                ->where('student_id', $authUser->id)
                ->whereIn('status', ['Pending', 'Active']))
            ->exists()) {
            return ApiResponse::forbidden('You are not enrolled in this course.');
        }

        $course->load([
            'category',
            'modules.lessons.resources',
            'units.modules.lessons.resources',
            'batches.branch',
            'creator',
        ]);

        if ($authUser?->hasRole('Student')) {
            $course->setRelation('batches', $course->batches()
                ->whereHas('enrollments', fn($q) => $q
                    ->where('student_id', $authUser->id)
                    ->whereIn('status', ['Pending', 'Active']))
                ->with('branch')
                ->get());
        }

        if ($authUser?->hasRole('Student')) {
            $lessonIds = $course->modules->flatMap->lessons
                ->merge($course->units->flatMap->modules->flatMap->lessons)
                ->pluck('id');
            $batchIds = $course->batches->pluck('id');
            $completedLessonUuids = LessonProgress::where('user_id', $authUser->id)
                ->whereIn('lesson_id', $lessonIds)
                ->whereIn('batch_id', $batchIds)
                ->where('status', 'completed')
                ->with('lesson')
                ->get()
                ->pluck('lesson.uuid')
                ->unique()
                ->values()
                ->all();
            $progress = CourseProgress::where('user_id', $authUser->id)
                ->where('course_id', $course->id)
                ->orderByDesc('progress_percentage')
                ->first();
            $course->setAttribute('learning_progress', [
                'percentage' => $progress ? (float) $progress->progress_percentage : 0,
                'completed_lesson_uuids' => $completedLessonUuids,
            ]);
        }

        return ApiResponse::success($course);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('courses.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'category_uuid' => ['sometimes', 'required', 'exists:course_categories,uuid'],
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('courses', 'code')
                ->where(fn($q) => $q->where('organization_id', $course->organization_id))
                ->ignore($course->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'duration' => ['sometimes', 'required', 'integer', 'min:1'],
            'duration_unit' => ['sometimes', 'required', 'in:hours,days,weeks,months'],
            'level' => ['sometimes', 'required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,active,archived'],
        ]);

        $old = $course->toArray();

        if (!empty($validated['category_uuid'])) {
            $cat = CourseCategory::where('uuid', $validated['category_uuid'])->first();
            if ($cat) {
                $course->category_id = $cat->id;
            }
        }

        $course->fill(collect($validated)->except('category_uuid')->toArray());
        $course->save();

        AuditLogService::log('course.update', $course, $old, $course->toArray());

        return ApiResponse::success($course->load('category'), 'Course updated successfully.');
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('courses.delete')) {
            return ApiResponse::forbidden();
        }

        // Check if there are active batches
        if ($course->batches()->where('status', 'ongoing')->exists()) {
            return ApiResponse::error('Cannot delete course with active ongoing cohorts. Archive instead.', 422);
        }

        $course->delete();
        AuditLogService::log('course.delete', $course);

        return ApiResponse::success(null, 'Course archived successfully.');
    }
}
