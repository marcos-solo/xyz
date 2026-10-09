<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Lesson;
use App\Models\Organization;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseBatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('batches.view')) {
            return ApiResponse::forbidden();
        }

        $query = CourseBatch::with(['course.category', 'branch', 'trainers', 'batchTrainers.trainer'])
            ->withCount(['enrollments', 'classSessions', 'assessments']);

        // Branch Isolation
        if (! BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->where('branch_id', $authUser->branch_id);
        } elseif ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->where('branch_id', $branch->id);
            }
        }

        // Trainer limitation (if only regular trainer)
        if ($authUser->hasRole('Trainer') && ! $authUser->can('batches.view-all-branches') && ! $authUser->hasRole('Branch Manager')) {
            $query->whereHas('batchTrainers', fn ($bt) => $bt->where('trainer_id', $authUser->id));
        }

        if ($request->filled('course_uuid')) {
            $course = Course::where('uuid', $request->course_uuid)->first();
            if ($course) {
                $query->where('course_id', $course->id);
            }
        }

        if ($request->filled('category_uuid')) {
            $query->whereHas('course.category', fn ($categoryQuery) => $categoryQuery->where('uuid', $request->category_uuid));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('start_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('end_date', '<=', $request->to_date);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Batches retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('batches.create')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();

        $validated = $request->validate([
            'course_uuid' => ['required', 'exists:courses,uuid'],
            'branch_uuid' => ['required', 'exists:branches,uuid'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'curriculum_lesson_uuids' => ['nullable', 'array', 'max:22'],
            'curriculum_lesson_uuids.*' => ['required', 'uuid', 'distinct', 'exists:lessons,uuid'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:upcoming,ongoing,completed,cancelled'],
            'trainer_ids' => ['nullable', 'array'],
            'trainer_ids.*' => ['exists:users,id'],
        ]);

        $course = Course::where('uuid', $validated['course_uuid'])->firstOrFail();
        $branch = Branch::where('uuid', $validated['branch_uuid'])->firstOrFail();

        $selectionError = $this->validateCurriculumSelection(
            $course,
            $validated['name'],
            $validated['curriculum_lesson_uuids'] ?? [],
        );
        if ($selectionError) {
            return $selectionError;
        }

        $batch = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $course->id,
            'branch_id' => $branch->id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'curriculum_lesson_uuids' => $validated['curriculum_lesson_uuids'] ?? null,
            'capacity' => $validated['capacity'],
            'status' => $validated['status'] ?? 'upcoming',
        ]);

        if (! empty($validated['trainer_ids'])) {
            foreach ($validated['trainer_ids'] as $idx => $trainerId) {
                $batch->trainers()->attach($trainerId, [
                    'role_type' => $idx === 0 ? 'Lead Trainer' : 'Assistant Trainer',
                ]);
            }
        }

        AuditLogService::log('batch.create', $batch, null, $batch->toArray());

        return ApiResponse::success($batch->load(['course', 'branch', 'trainers']), 'Batch created successfully.', 201);
    }

    public function show(CourseBatch $batch): JsonResponse
    {
        return ApiResponse::success($batch->load([
            'course.modules.lessons',
            'branch',
            'trainers',
            'enrollments.student.studentProfile',
            'classSessions.attendanceSession',
            'assessments',
        ]));
    }

    public function update(Request $request, CourseBatch $batch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('batches.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'course_uuid' => ['sometimes', 'required', 'exists:courses,uuid'],
            'branch_uuid' => ['sometimes', 'required', 'exists:branches,uuid'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:50'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date'],
            'curriculum_lesson_uuids' => ['sometimes', 'nullable', 'array', 'max:22'],
            'curriculum_lesson_uuids.*' => ['required', 'uuid', 'distinct', 'exists:lessons,uuid'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:upcoming,ongoing,completed,cancelled'],
        ]);

        $old = $batch->toArray();

        if (array_key_exists('curriculum_lesson_uuids', $validated)) {
            $courseId = isset($validated['course_uuid'])
                ? Course::where('uuid', $validated['course_uuid'])->value('id')
                : $batch->course_id;
            $course = Course::findOrFail($courseId);
            $selectionError = $this->validateCurriculumSelection(
                $course,
                $validated['name'] ?? $batch->name,
                $validated['curriculum_lesson_uuids'] ?? [],
            );
            if ($selectionError) {
                return $selectionError;
            }
        }

        if (array_key_exists('course_uuid', $validated)) {
            $batch->course_id = Course::where('uuid', $validated['course_uuid'])->value('id');
        }
        if (array_key_exists('branch_uuid', $validated)) {
            $batch->branch_id = Branch::where('uuid', $validated['branch_uuid'])->value('id');
        }

        $batch->fill(collect($validated)->except(['course_uuid', 'branch_uuid'])->toArray());
        $batch->save();

        AuditLogService::log('batch.update', $batch, $old, $batch->toArray());

        return ApiResponse::success($batch->load(['course', 'branch', 'trainers']), 'Batch updated.');
    }

    public function destroy(Request $request, CourseBatch $batch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('batches.delete')) {
            return ApiResponse::forbidden();
        }

        if ($batch->status === 'ongoing') {
            return ApiResponse::error('Cannot delete an ongoing batch. Archive it instead.', 422);
        }

        $batch->delete();
        AuditLogService::log('batch.delete', $batch);

        return ApiResponse::success(null, 'Batch archived successfully.');
    }

    /**
     * Assign / update trainers for this batch.
     */
    public function assignTrainers(Request $request, CourseBatch $batch): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('batches.assign-trainers')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'trainers' => ['required', 'array'],
            'trainers.*.trainer_id' => ['required', 'exists:users,id'],
            'trainers.*.role_type' => ['required', 'in:Lead Trainer,Assistant Trainer,Guest Trainer'],
        ]);

        $syncData = [];
        foreach ($validated['trainers'] as $t) {
            $syncData[$t['trainer_id']] = ['role_type' => $t['role_type']];
        }

        $batch->trainers()->sync($syncData);

        AuditLogService::log('batch.trainers_assigned', $batch, null, $validated['trainers']);

        return ApiResponse::success($batch->load('trainers'), 'Batch trainers assigned successfully.');
    }

    private function validateCurriculumSelection(Course $course, string $batchName, array $lessonUuids): ?JsonResponse
    {
        $isStrategicAccaBatch = strtoupper((string) $course->code) === 'ACCA'
            && (str_contains(strtolower($batchName), 'strategic') || preg_match('/\bsp\b/i', $batchName));

        if ($isStrategicAccaBatch && count($lessonUuids) === 0) {
            return ApiResponse::error('Select the two mandatory Strategic Professional papers and exactly two option papers.', 422);
        }

        if ($lessonUuids === []) {
            return null;
        }

        $selectedLessons = Lesson::whereIn('uuid', $lessonUuids)
            ->with('module.unit')
            ->get();

        if ($selectedLessons->count() !== count($lessonUuids)
            || $selectedLessons->contains(fn (Lesson $lesson) => $lesson->module?->course_id !== $course->id)) {
            return ApiResponse::error('Selected papers must belong to the chosen course.', 422);
        }

        if ($isStrategicAccaBatch) {
            $selectedStrategicLessons = $selectedLessons->filter(fn (Lesson $lesson) => $lesson->module?->unit?->title === 'Strategic Professional Level'
            );
            $requiredEssentials = Lesson::whereHas('module', fn ($module) => $module
                ->where('title', 'Essentials')
                ->whereHas('unit', fn ($unit) => $unit->where('title', 'Strategic Professional Level')))
                ->whereHas('module', fn ($module) => $module->where('course_id', $course->id))
                ->pluck('uuid');
            $selectedEssentialUuids = $selectedStrategicLessons
                ->filter(fn (Lesson $lesson) => $lesson->module?->title === 'Essentials')
                ->pluck('uuid');
            $selectedOptionCount = $selectedStrategicLessons
                ->filter(fn (Lesson $lesson) => str_contains(strtolower((string) $lesson->module?->title), 'options'))
                ->count();

            if ($selectedStrategicLessons->count() !== $selectedLessons->count()
                || $selectedStrategicLessons->count() !== $requiredEssentials->count() + 2
                || $requiredEssentials->diff($selectedEssentialUuids)->isNotEmpty()
                || $selectedOptionCount !== 2) {
                return ApiResponse::error('Strategic Professional batches require both Essentials papers and exactly two option papers.', 422);
            }
        }

        return null;
    }
}
