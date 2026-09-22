<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseCategory;
use App\Models\CourseProgress;
use App\Models\LearningPath;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LearningPathController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LearningPath::with(['category', 'courses.category']);

        if (! $user->can('courses.create') && ! $user->hasAnyRole(['Admin', 'Super Admin', 'CEO'])) {
            $query->where('status', 'active');
        }

        $paths = $query->orderBy('order')->get()->map(function ($path) use ($user) {
            $pathCourses = $path->courses;
            $coursesCount = $pathCourses->count();

            $studentProgress = null;
            if ($user && $user->hasRole('Student')) {
                $courseIds = $pathCourses->pluck('id');
                $totalProgress = CourseProgress::where('user_id', $user->id)
                    ->whereIn('course_id', $courseIds)
                    ->avg('progress_percentage') ?? 0;
                $completedCourses = CourseProgress::where('user_id', $user->id)
                    ->whereIn('course_id', $courseIds)
                    ->where('progress_percentage', '>=', 100)
                    ->count();

                $studentProgress = [
                    'progress_percentage' => round((float) $totalProgress, 1),
                    'completed_courses' => $completedCourses,
                    'total_courses' => $coursesCount,
                ];
            }

            return [
                'id' => $path->id,
                'uuid' => $path->uuid,
                'title' => $path->title,
                'slug' => $path->slug,
                'description' => $path->description,
                'duration' => $path->duration,
                'duration_unit' => $path->duration_unit,
                'level' => $path->level,
                'status' => $path->status,
                'order' => $path->order,
                'category' => $path->category ? [
                    'uuid' => $path->category->uuid,
                    'name' => $path->category->name,
                ] : null,
                'courses' => $pathCourses->map(fn ($c) => [
                    'uuid' => $c->uuid,
                    'code' => $c->code,
                    'name' => $c->name,
                    'duration' => $c->duration,
                    'duration_unit' => $c->duration_unit,
                    'level' => $c->level,
                ]),
                'courses_count' => $coursesCount,
                'student_progress' => $studentProgress,
            ];
        });

        return ApiResponse::success($paths, 'Learning paths retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('courses.create') && ! $user->hasAnyRole(['Admin', 'Super Admin', 'CEO'])) {
            return ApiResponse::forbidden('Unauthorized to create learning paths.');
        }

        $org = Organization::first();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_uuid' => ['nullable', 'exists:course_categories,uuid'],
            'description' => ['nullable', 'string'],
            'duration' => ['required', 'integer', 'min:1'],
            'duration_unit' => ['required', 'in:hours,weeks,months'],
            'level' => ['required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,active,archived'],
        ]);

        $categoryId = null;
        if (! empty($validated['category_uuid'])) {
            $category = CourseCategory::where('uuid', $validated['category_uuid'])->first();
            $categoryId = $category?->id;
        }

        $slug = Str::slug($validated['title']);
        $uniqueSlug = $slug;
        $counter = 1;
        while (LearningPath::where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = "{$slug}-{$counter}";
            $counter++;
        }

        $path = LearningPath::create([
            'organization_id' => $org->id,
            'category_id' => $categoryId,
            'title' => $validated['title'],
            'slug' => $uniqueSlug,
            'description' => $validated['description'] ?? null,
            'duration' => $validated['duration'],
            'duration_unit' => $validated['duration_unit'],
            'level' => $validated['level'],
            'status' => $validated['status'] ?? 'active',
            'order' => (LearningPath::max('order') ?? 0) + 1,
        ]);

        return ApiResponse::success($path->load(['category', 'courses']), 'Learning path created successfully.', 201);
    }

    public function show(LearningPath $learningPath): JsonResponse
    {
        return ApiResponse::success($learningPath->load(['category', 'courses.modules.lessons']));
    }

    public function update(Request $request, LearningPath $learningPath): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('courses.update') && ! $user->hasAnyRole(['Admin', 'Super Admin', 'CEO'])) {
            return ApiResponse::forbidden('Unauthorized to update learning paths.');
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category_uuid' => ['nullable', 'exists:course_categories,uuid'],
            'description' => ['nullable', 'string'],
            'duration' => ['sometimes', 'required', 'integer', 'min:1'],
            'duration_unit' => ['sometimes', 'required', 'in:hours,weeks,months'],
            'level' => ['sometimes', 'required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,active,archived'],
        ]);

        if (array_key_exists('category_uuid', $validated)) {
            $categoryId = null;
            if (! empty($validated['category_uuid'])) {
                $category = CourseCategory::where('uuid', $validated['category_uuid'])->first();
                $categoryId = $category?->id;
            }
            $validated['category_id'] = $categoryId;
            unset($validated['category_uuid']);
        }

        $learningPath->update($validated);

        return ApiResponse::success($learningPath->load(['category', 'courses']), 'Learning path updated successfully.');
    }

    public function destroy(Request $request, LearningPath $learningPath): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('courses.delete') && ! $user->hasAnyRole(['Admin', 'Super Admin', 'CEO'])) {
            return ApiResponse::forbidden('Unauthorized to delete learning paths.');
        }

        // Dissociate courses from this path before deleting
        $learningPath->courses()->update(['learning_path_id' => null]);
        $learningPath->delete();

        return ApiResponse::success(null, 'Learning path deleted successfully.');
    }
}
