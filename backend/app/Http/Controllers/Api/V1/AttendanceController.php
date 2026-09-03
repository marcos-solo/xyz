<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\ClassSession;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get attendance roster for a specific class session.
     */
    public function getSessionRoster(ClassSession $classSession): JsonResponse
    {
        $batch = $classSession->batch;
        $enrollments = Enrollment::where('batch_id', $batch->id)
            ->where('status', 'Active')
            ->with('student.studentProfile')
            ->get();

        $existingSession = AttendanceSession::where('class_session_id', $classSession->id)
            ->with('records')
            ->first();

        $roster = $enrollments->map(function ($enrollment) use ($existingSession) {
            $student = $enrollment->student;
            $record = $existingSession ? $existingSession->records->firstWhere('student_id', $student->id) : null;

            return [
                'student_id' => $student->id,
                'student_uuid' => $student->uuid,
                'student_name' => $student->full_name,
                'student_number' => $student->studentProfile?->student_number ?? 'N/A',
                'status' => $record ? $record->status : 'Present',
                'remarks' => $record ? $record->remarks : '',
            ];
        });

        return ApiResponse::success([
            'session' => [
                'uuid' => $classSession->uuid,
                'title' => $classSession->title,
                'date' => $classSession->date->format('Y-m-d'),
                'start_time' => $classSession->start_time,
                'end_time' => $classSession->end_time,
                'status' => $existingSession ? 'recorded' : 'pending',
            ],
            'roster' => $roster,
        ]);
    }

    /**
     * Submit / record attendance marks for a class session.
     */
    public function recordAttendance(Request $request, ClassSession $classSession): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('attendance.create') && !$authUser->can('attendance.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_uuid' => ['required', 'exists:users,uuid'],
            'records.*.status' => ['required', 'in:Present,Absent,Late,Excused'],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $classSession, $authUser) {
            $attSession = AttendanceSession::updateOrCreate(
                ['class_session_id' => $classSession->id],
                [
                    'batch_id' => $classSession->batch_id,
                    'taken_by' => $authUser->id,
                    'session_date' => $classSession->date,
                    'status' => 'closed',
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            foreach ($validated['records'] as $recData) {
                $student = User::where('uuid', $recData['student_uuid'])->firstOrFail();

                AttendanceRecord::updateOrCreate(
                    [
                        'attendance_session_id' => $attSession->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'status' => $recData['status'],
                        'remarks' => $recData['remarks'] ?? null,
                    ]
                );
            }

            // Mark session as completed
            $classSession->update(['status' => 'completed']);

            AuditLogService::log('attendance.mark', $attSession, null, [
                'session_id' => $classSession->id,
                'total_students' => count($validated['records']),
            ]);
        });

        return ApiResponse::success(null, 'Attendance records saved successfully.');
    }

    /**
     * Get batch-wide attendance matrix (Dates on columns, Students on rows).
     */
    public function getBatchMatrix(CourseBatch $batch): JsonResponse
    {
        $sessions = ClassSession::where('batch_id', $batch->id)
            ->whereHas('attendanceSession')
            ->with(['attendanceSession.records'])
            ->orderBy('date')
            ->get();

        $enrollments = Enrollment::where('batch_id', $batch->id)
            ->with('student.studentProfile')
            ->get();

        $matrix = $enrollments->map(function ($enr) use ($sessions) {
            $student = $enr->student;
            $history = [];
            $presentCount = 0;

            foreach ($sessions as $session) {
                $rec = $session->attendanceSession?->records->firstWhere('student_id', $student->id);
                $status = $rec ? $rec->status : 'Unrecorded';
                if (in_array($status, ['Present', 'Late'])) {
                    $presentCount++;
                }

                $history[$session->uuid] = [
                    'date' => $session->date->format('Y-m-d'),
                    'status' => $status,
                    'remarks' => $rec?->remarks,
                ];
            }

            $total = $sessions->count();
            $percentage = $total > 0 ? round(($presentCount / $total) * 100, 1) : 100;

            return [
                'student_uuid' => $student->uuid,
                'student_name' => $student->full_name,
                'student_number' => $student->studentProfile?->student_number ?? 'N/A',
                'attended_sessions' => $presentCount,
                'total_sessions' => $total,
                'attendance_percentage' => $percentage,
                'records' => $history,
            ];
        });

        return ApiResponse::success([
            'batch' => [
                'uuid' => $batch->uuid,
                'name' => $batch->name,
                'code' => $batch->code,
            ],
            'sessions' => $sessions->map(fn($s) => [
                'uuid' => $s->uuid,
                'title' => $s->title,
                'date' => $s->date->format('Y-m-d'),
            ]),
            'matrix' => $matrix,
        ]);
    }
}
