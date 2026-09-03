<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Organization;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseBatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('batches.view')) {
            return ApiResponse::forbidden();
        }

        $query = CourseBatch::with(['course.category', 'branch', 'trainers', 'batchTrainers.trainer'])
            ->withCount(['enrollments', 'classSessions', 'assessments']);

        // Branch Isolation
        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->where('branch_id', $authUser->branch_id);
        } elseif ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->where('branch_id', $branch->id);
            }
        }

        // Trainer limitation (if only regular trainer)
        if ($authUser->hasRole('Trainer') && !$authUser->can('batches.view-all-branches') && !$authUser->hasRole('Branch Manager')) {
            $query->whereHas('batchTrainers', fn($bt) => $bt->where('trainer_id', $authUser->id));
        }

        if ($request->filled('course_uuid')) {
            $course = Course::where('uuid', $request->course_uuid)->first();
            if ($course) {
                $query->where('course_id', $course->id);
            }
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
        if (!$authUser->can('batches.create')) {
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
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:upcoming,ongoing,completed,cancelled'],
            'trainer_ids' => ['nullable', 'array'],
            'trainer_ids.*' => ['exists:users,id'],
        ]);

        $course = Course::where('uuid', $validated['course_uuid'])->firstOrFail();
        $branch = Branch::where('uuid', $validated['branch_uuid'])->firstOrFail();

        $batch = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $course->id,
            'branch_id' => $branch->id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'capacity' => $validated['capacity'],
            'status' => $validated['status'] ?? 'upcoming',
        ]);

        if (!empty($validated['trainer_ids'])) {
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
        if (!$authUser->can('batches.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:50'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:upcoming,ongoing,completed,cancelled'],
        ]);

        $old = $batch->toArray();
        $batch->update($validated);

        AuditLogService::log('batch.update', $batch, $old, $batch->toArray());

        return ApiResponse::success($batch->load(['course', 'branch', 'trainers']), 'Batch updated.');
    }

    /**
     * Assign / update trainers for this batch.
     */
    public function assignTrainers(Request $request, CourseBatch $batch): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('batches.assign-trainers')) {
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
}
