<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\EnrollmentFinance;
use App\Models\User;
use App\Notifications\FinanceClearedNotification;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('enrollments.view')) {
            return ApiResponse::forbidden();
        }

        $query = Enrollment::with([
            'student.studentProfile',
            'student.branch',
            'batch.course',
            'batch.branch',
        ]);

        if (! BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('batch', fn ($q) => $q->where('branch_id', $authUser->branch_id));
        }

        if ($request->filled('batch_uuid')) {
            $batch = CourseBatch::where('uuid', $request->batch_uuid)->first();
            if ($batch) {
                $query->where('batch_id', $batch->id);
            }
        }

        if ($request->filled('course_uuid')) {
            $course = Course::where('uuid', $request->course_uuid)->first();
            if ($course) {
                $query->whereHas('batch', fn ($q) => $q->where('course_id', $course->id));
            }
        }

        if ($request->filled('from_date')) {
            $query->whereDate('enrollment_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('enrollment_date', '<=', $request->to_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $paginated = $query->latest()->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Enrollments retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Enroll a student into a batch.
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('enrollments.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'student_uuid' => ['required', 'exists:users,uuid'],
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'enrollment_date' => ['nullable', 'date'],
        ]);

        $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();

        // 1. Prevent duplicate active enrollment into the same batch
        $existsActive = Enrollment::where('student_id', $student->id)
            ->where('batch_id', $batch->id)
            ->whereIn('status', ['Active', 'Pending'])
            ->exists();

        if ($existsActive) {
            return ApiResponse::error('Student already has an active or pending enrollment in this cohort.', 422);
        }

        // 2. Check batch capacity
        $activeEnrollmentsCount = Enrollment::where('batch_id', $batch->id)
            ->where('status', 'Active')
            ->count();

        if ($activeEnrollmentsCount >= $batch->capacity) {
            return ApiResponse::error("Batch capacity ({$batch->capacity}) reached.", 422);
        }

        // Generate enrollment number
        $year = Carbon::now()->format('Y');
        $seq = Enrollment::whereYear('created_at', $year)->count() + 1;
        $enrollmentNumber = sprintf('ENR-%s-%04d', $year, $seq);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => $enrollmentNumber,
            'enrollment_date' => $validated['enrollment_date'] ?? now()->format('Y-m-d'),
            'status' => 'Pending',
            'workflow_stage' => 'registered',
            'workflow_updated_by' => $authUser->id,
            'workflow_updated_at' => now(),
        ]);
        EnrollmentFinance::create([
            'enrollment_id' => $enrollment->id,
            'currency' => $authUser->organization?->settings['currency'] ?? 'KES',
        ]);

        AuditLogService::log('enrollment.create', $enrollment, null, [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => $enrollmentNumber,
        ]);

        return ApiResponse::success(
            $enrollment->load(['student.studentProfile', 'batch.course', 'batch.branch']),
            'Student enrolled successfully.',
            201
        );
    }

    public function advanceWorkflow(Request $request, Enrollment $enrollment): JsonResponse
    {
        $authUser = $request->user();

        if (! BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $enrollment->loadMissing('batch');
            if ($enrollment->batch?->branch_id !== $authUser->branch_id) {
                return ApiResponse::forbidden();
            }
        }

        $validated = $request->validate([
            'stage' => ['required', 'in:'.implode(',', Enrollment::WORKFLOW_STAGES)],
        ]);

        $currentIndex = array_search($enrollment->workflow_stage, Enrollment::WORKFLOW_STAGES, true);
        $targetIndex = array_search($validated['stage'], Enrollment::WORKFLOW_STAGES, true);
        if ($currentIndex === false || $targetIndex !== $currentIndex + 1) {
            return ApiResponse::error('Workflow stages must be approved in order.', 422);
        }

        $requiredPermission = match ($validated['stage']) {
            'branch_review' => 'enrollments.review',
            'finance_cleared' => 'enrollments.finance-clear',
            'in_training' => 'enrollments.update',
            'course_completed' => 'enrollments.complete',
            'certification_ready' => 'enrollments.certification-approve',
            default => 'enrollments.update',
        };
        if (! $authUser->can($requiredPermission)) {
            return ApiResponse::forbidden();
        }

        if ($validated['stage'] === 'finance_cleared') {
            $finance = $enrollment->finance;
            if (! $finance || ! in_array($finance->status, ['cleared', 'waived'], true)) {
                return ApiResponse::error('Finance must clear the outstanding balance before training can begin.', 422);
            }
        }

        $update = [
            'workflow_stage' => $validated['stage'],
            'workflow_updated_by' => $authUser->id,
            'workflow_updated_at' => now(),
        ];
        if ($validated['stage'] === 'finance_cleared') {
            $update['finance_cleared_by'] = $authUser->id;
            $update['finance_cleared_at'] = now();
        }
        if ($validated['stage'] === 'in_training') {
            $update['status'] = 'Active';
        }
        if ($validated['stage'] === 'course_completed') {
            $update['status'] = 'Completed';
            $update['completion_date'] = now()->format('Y-m-d');
        }

        $old = $enrollment->toArray();
        $enrollment->update($update);
        AuditLogService::log('enrollment.workflow_advance', $enrollment, $old, $enrollment->fresh()->toArray());

        if ($validated['stage'] === 'finance_cleared') {
            $enrollment->loadMissing('student', 'batch.course');
            $enrollment->student?->notify(new FinanceClearedNotification($enrollment));
        }

        return ApiResponse::success(
            $enrollment->fresh()->load(['student.studentProfile', 'batch.course', 'batch.branch', 'workflowUpdatedBy', 'financeClearedBy']),
            "Enrollment advanced to {$enrollment->workflow_stage}."
        );
    }

    /**
     * Update enrollment status (Active, Completed, Suspended, Withdrawn, Cancelled).
     */
    public function updateStatus(Request $request, Enrollment $enrollment): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('enrollments.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Active,Completed,Suspended,Withdrawn,Cancelled'],
            'completion_date' => ['nullable', 'date'],
        ]);

        if ($validated['status'] === 'Active' && ! in_array($enrollment->workflow_stage, ['in_training', 'course_completed', 'certification_ready', 'certified'], true)) {
            return ApiResponse::error('Approve the enrollment workflow through finance clearance before activating it.', 422);
        }
        if ($validated['status'] === 'Completed' && ! in_array($enrollment->workflow_stage, ['course_completed', 'certification_ready', 'certified'], true)) {
            return ApiResponse::error('The enrollment must complete its workflow before it can be marked completed.', 422);
        }

        $old = $enrollment->toArray();

        $updateData = ['status' => $validated['status']];
        if ($validated['status'] === 'Completed') {
            $updateData['completion_date'] = $validated['completion_date'] ?? now()->format('Y-m-d');
        }

        $enrollment->update($updateData);

        AuditLogService::log('enrollment.status_change', $enrollment, $old, $enrollment->toArray());

        return ApiResponse::success($enrollment, "Enrollment status updated to {$enrollment->status}.");
    }
}
