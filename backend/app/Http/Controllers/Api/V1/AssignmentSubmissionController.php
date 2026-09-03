<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Assessment;
use App\Models\AssignmentSubmission;
use App\Models\CourseBatch;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentSubmissionController extends Controller
{
    /**
     * Submit assignment work (student).
     */
    public function store(Request $request, Assessment $assessment): JsonResponse
    {
        $student = $request->user();

        $validated = $request->validate([
            'submission_text' => ['nullable', 'string'],
            'file_path' => ['nullable', 'string'],
        ]);

        $batch = $assessment->batch;

        $submission = AssignmentSubmission::updateOrCreate(
            ['assessment_id' => $assessment->id, 'student_id' => $student->id],
            [
                'batch_id' => $batch->id,
                'submission_text' => $validated['submission_text'] ?? null,
                'file_path' => $validated['file_path'] ?? null,
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );

        AuditLogService::log('assignment.submit', $submission);

        return ApiResponse::success($submission, 'Assignment submitted successfully.');
    }

    /**
     * Grade an assignment submission (trainer).
     */
    public function grade(Request $request, AssignmentSubmission $submission): JsonResponse
    {
        $trainer = $request->user();
        if (!$trainer->can('assessments.grade')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', "max:{$submission->assessment->total_marks}"],
            'grade' => ['nullable', 'string', 'max:10'],
            'feedback' => ['nullable', 'string'],
        ]);

        $scorePct = ($validated['score'] / $submission->assessment->total_marks) * 100;
        $letterGrade = $validated['grade'] ?? ($scorePct >= 80 ? 'A' : ($scorePct >= 70 ? 'B' : ($scorePct >= 60 ? 'C' : ($scorePct >= 50 ? 'D' : 'F'))));

        $submission->update([
            'score' => $validated['score'],
            'grade' => $letterGrade,
            'feedback' => $validated['feedback'] ?? null,
            'graded_by' => $trainer->id,
            'graded_at' => now(),
            'status' => 'graded',
        ]);

        AuditLogService::log('assignment.grade', $submission, null, [
            'score' => $validated['score'],
            'grade' => $letterGrade,
        ]);

        return ApiResponse::success($submission, 'Submission graded successfully.');
    }
}
