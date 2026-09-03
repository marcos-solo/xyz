<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Get report data (JSON for UI display and charting).
     */
    public function generate(Request $request, string $type): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('reports.view')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
        ]);
        $branchId = $this->resolveBranchId($authUser, $validated['branch_uuid'] ?? null);
        $fromDate = $validated['from_date'] ?? null;
        $toDate = $validated['to_date'] ?? null;

        switch ($type) {
            case 'enrollments':
                $query = Enrollment::with(['student.studentProfile', 'batch.course', 'batch.branch']);
                if ($branchId) {
                    $query->whereHas('batch', fn($q) => $q->where('branch_id', $branchId));
                }
                if ($fromDate) {
                    $query->whereDate('enrollment_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->whereDate('enrollment_date', '<=', $toDate);
                }
                $data = $query->latest()->limit(500)->get()->map(fn($e) => [
                    'enrollment_number' => $e->enrollment_number,
                    'student_name' => $e->student?->full_name,
                    'student_number' => $e->student?->studentProfile?->student_number,
                    'course' => $e->batch?->course?->name,
                    'batch' => $e->batch?->name,
                    'branch' => $e->batch?->branch?->name,
                    'enrollment_date' => $e->enrollment_date->format('Y-m-d'),
                    'status' => $e->status,
                    'final_grade' => $e->final_grade ?? 'In Progress',
                    'final_score' => $e->final_score,
                ]);
                break;

            case 'branches':
                $branchQuery = Branch::withCount(['users', 'batches']);
                if ($branchId) {
                    $branchQuery->whereKey($branchId);
                }
                $data = $branchQuery->get()->map(fn($b) => [
                    'branch_name' => $b->name,
                    'branch_code' => $b->code,
                    'location' => $b->location,
                    'total_students' => User::role('Student')->where('branch_id', $b->id)->count(),
                    'total_staff' => User::where('branch_id', $b->id)->whereHas('staffProfile')->count(),
                    'active_cohorts' => $b->batches()->where('status', 'ongoing')->count(),
                    'total_enrollments' => Enrollment::whereHas('batch', fn($q) => $q->where('branch_id', $b->id))->count(),
                ]);
                break;

            case 'attendance':
                $batchQuery = CourseBatch::with(['branch', 'course']);
                if ($branchId) {
                    $batchQuery->where('branch_id', $branchId);
                }
                if ($fromDate || $toDate) {
                    $batchQuery->whereHas('classSessions.attendanceSession', function ($q) use ($fromDate, $toDate) {
                        $q->when($fromDate, fn($dateQuery) => $dateQuery->whereDate('session_date', '>=', $fromDate))
                            ->when($toDate, fn($dateQuery) => $dateQuery->whereDate('session_date', '<=', $toDate));
                    });
                }
                $data = $batchQuery->limit(500)->get()->map(function ($b) use ($fromDate, $toDate) {
                    $attendanceQuery = AttendanceRecord::whereHas('session', function ($q) use ($b, $fromDate, $toDate) {
                        $q->where('batch_id', $b->id)
                            ->when($fromDate, fn($dateQuery) => $dateQuery->whereDate('session_date', '>=', $fromDate))
                            ->when($toDate, fn($dateQuery) => $dateQuery->whereDate('session_date', '<=', $toDate));
                    });
                    $totalMarks = (clone $attendanceQuery)->count();
                    $presentMarks = (clone $attendanceQuery)->whereIn('status', ['Present', 'Late'])->count();
                    $rate = $totalMarks > 0 ? round(($presentMarks / $totalMarks) * 100, 1) : 100;
                    return [
                        'cohort' => $b->name,
                        'branch' => $b->branch?->name,
                        'course' => $b->course?->name,
                        'total_sessions_logged' => $b->classSessions()->whereHas('attendanceSession')->count(),
                        'average_attendance_rate' => $rate . '%',
                    ];
                });
                break;

            case 'certificates':
                $certificateQuery = Certificate::with(['student.studentProfile', 'course', 'batch.branch', 'issuer']);
                if ($branchId) {
                    $certificateQuery->whereHas('batch', fn($q) => $q->where('branch_id', $branchId));
                }
                $certificateQuery->when($fromDate, fn($q) => $q->whereDate('issue_date', '>=', $fromDate))
                    ->when($toDate, fn($q) => $q->whereDate('issue_date', '<=', $toDate));
                $data = $certificateQuery->latest()->limit(500)->get()
                    ->map(fn($c) => [
                        'certificate_number' => $c->certificate_number,
                        'verification_code' => $c->verification_code,
                        'student_name' => $c->student?->full_name,
                        'course' => $c->course?->name,
                        'branch' => $c->batch?->branch?->name,
                        'issue_date' => $c->issue_date->format('Y-m-d'),
                        'final_grade' => $c->final_grade,
                        'status' => $c->status,
                    ]);
                break;

            default:
                return ApiResponse::error('Unknown report type requested.', 404);
        }

        return ApiResponse::success([
            'report_type' => $type,
            'generated_at' => now()->toIso8601String(),
            'rows' => $data,
        ]);
    }

    /**
     * Stream export report as CSV (prevents high memory exhaustion on large datasets).
     */
    public function exportCsv(Request $request, string $type): StreamedResponse|JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('reports.view')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
        ]);
        $branchId = $this->resolveBranchId($authUser, $validated['branch_uuid'] ?? null);
        $fromDate = $validated['from_date'] ?? null;
        $toDate = $validated['to_date'] ?? null;
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"report_{$type}_" . date('Y-m-d') . ".csv\"",
        ];

        return response()->stream(function () use ($type, $branchId, $fromDate, $toDate) {
            $handle = fopen('php://output', 'w');

            if ($type === 'enrollments') {
                fputcsv($handle, ['Enrollment #', 'Student Name', 'Student #', 'Course', 'Batch', 'Branch', 'Date', 'Status', 'Grade', 'Score']);
                $query = Enrollment::with(['student.studentProfile', 'batch.course', 'batch.branch']);
                $query->when($branchId, fn($q) => $q->whereHas('batch', fn($batchQuery) => $batchQuery->where('branch_id', $branchId)))
                    ->when($fromDate, fn($q) => $q->whereDate('enrollment_date', '>=', $fromDate))
                    ->when($toDate, fn($q) => $q->whereDate('enrollment_date', '<=', $toDate));
                $query->chunk(200, function ($rows) use ($handle) {
                    foreach ($rows as $e) {
                        fputcsv($handle, [
                            $e->enrollment_number,
                            $e->student?->full_name,
                            $e->student?->studentProfile?->student_number,
                            $e->batch?->course?->name,
                            $e->batch?->name,
                            $e->batch?->branch?->name,
                            $e->enrollment_date->format('Y-m-d'),
                            $e->status,
                            $e->final_grade,
                            $e->final_score,
                        ]);
                    }
                });
            } elseif ($type === 'certificates') {
                fputcsv($handle, ['Certificate #', 'Verification Code', 'Student Name', 'Course', 'Branch', 'Issue Date', 'Grade', 'Status']);
                $query = Certificate::with(['student', 'course', 'batch.branch']);
                $query->when($branchId, fn($q) => $q->whereHas('batch', fn($batchQuery) => $batchQuery->where('branch_id', $branchId)))
                    ->when($fromDate, fn($q) => $q->whereDate('issue_date', '>=', $fromDate))
                    ->when($toDate, fn($q) => $q->whereDate('issue_date', '<=', $toDate));
                $query->chunk(200, function ($rows) use ($handle) {
                    foreach ($rows as $c) {
                        fputcsv($handle, [
                            $c->certificate_number,
                            $c->verification_code,
                            $c->student?->full_name,
                            $c->course?->name,
                            $c->batch?->branch?->name,
                            $c->issue_date->format('Y-m-d'),
                            $c->final_grade,
                            $c->status,
                        ]);
                    }
                });
            }

            fclose($handle);
        }, 200, $headers);
    }

    private function resolveBranchId($authUser, ?string $branchUuid): ?int
    {
        if (!BranchScopeService::canAccessAllBranches($authUser)) {
            return $authUser->branch_id;
        }

        return $branchUuid ? Branch::where('uuid', $branchUuid)->value('id') : null;
    }
}
