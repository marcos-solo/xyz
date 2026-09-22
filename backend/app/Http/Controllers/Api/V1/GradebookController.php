<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\AssignmentSubmission;
use App\Models\CourseBatch;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\GradebookCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradebookController extends Controller
{
    /**
     * Get complete weighted gradebook matrix for an intake batch.
     */
    public function show(CourseBatch $batch): JsonResponse
    {
        $gradebook = GradebookCalculationService::getBatchGradebook($batch);

        return ApiResponse::success($gradebook);
    }

    /**
     * Record or update marks for a student in an assessment.
     */
    public function recordMark(Request $request, CourseBatch $batch): JsonResponse
    {
        $validated = $request->validate([
            'student_uuid' => ['required', 'exists:users,uuid'],
            'assessment_uuid' => ['required', 'exists:assessments,uuid'],
            'score' => ['required', 'numeric', 'min:0'],
            'feedback' => ['nullable', 'string'],
        ]);

        $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
        $assessment = Assessment::where('uuid', $validated['assessment_uuid'])
            ->where('batch_id', $batch->id)
            ->firstOrFail();

        $score = (float) $validated['score'];
        $totalMarks = (float) ($assessment->total_marks ?: 100);
        $percentage = round(($score / $totalMarks) * 100, 2);
        $passed = $percentage >= (float) ($assessment->pass_mark ?: 50);

        if (in_array($assessment->type, ['Quiz', 'CAT', 'Exam', 'Final Examination'])) {
            $attempt = AssessmentAttempt::where('assessment_id', $assessment->id)
                ->where('student_id', $student->id)
                ->first();

            if ($attempt) {
                $attempt->update([
                    'score' => $score,
                    'percentage' => $percentage,
                    'passed' => $passed,
                    'status' => 'graded',
                    'submitted_at' => $attempt->submitted_at ?: now(),
                ]);
            } else {
                AssessmentAttempt::create([
                    'assessment_id' => $assessment->id,
                    'student_id' => $student->id,
                    'attempt_number' => 1,
                    'score' => $score,
                    'percentage' => $percentage,
                    'passed' => $passed,
                    'status' => 'graded',
                    'started_at' => now(),
                    'submitted_at' => now(),
                ]);
            }
        } else {
            AssignmentSubmission::updateOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'student_id' => $student->id,
                ],
                [
                    'batch_id' => $batch->id,
                    'score' => $score,
                    'feedback' => $validated['feedback'] ?? null,
                    'status' => 'graded',
                    'graded_by' => $request->user()->id,
                    'graded_at' => now(),
                    'submitted_at' => now(),
                ]
            );
        }

        AuditLogService::log('gradebook.record_mark', $assessment, null, [
            'batch_id' => $batch->id,
            'student_id' => $student->id,
            'score' => $score,
            'percentage' => $percentage,
            'passed' => $passed,
        ]);

        $updatedGradebook = GradebookCalculationService::getBatchGradebook($batch);

        return ApiResponse::success($updatedGradebook, 'Assessment mark recorded successfully.');
    }
}
