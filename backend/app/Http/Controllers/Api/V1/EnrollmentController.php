<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseBatch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
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
        if (!$authUser->can('enrollments.view')) {
            return ApiResponse::forbidden();
        }

        $query = Enrollment::with([
            'student.studentProfile',
            'student.branch',
            'batch.course',
            'batch.branch',
        ]);

        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('batch', fn($q) => $q->where('branch_id', $authUser->branch_id));
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
                $query->whereHas('batch', fn($q) => $q->where('course_id', $course->id));
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
        if (!$authUser->can('enrollments.create')) {
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
            'status' => 'Active',
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

    /**
     * Update enrollment status (Active, Completed, Suspended, Withdrawn, Cancelled).
     */
    public function updateStatus(Request $request, Enrollment $enrollment): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('enrollments.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Active,Completed,Suspended,Withdrawn,Cancelled'],
            'completion_date' => ['nullable', 'date'],
        ]);

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
