<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Services\AssessmentGradingService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizEngineController extends Controller
{
    /**
     * Start or resume a quiz attempt.
     * CRITICAL SECURITY RULE: Do not expose correct answers or explanations before submission.
     */
    public function startAttempt(Request $request, Assessment $assessment): JsonResponse
    {
        $student = $request->user();

        if (!$student->hasRole('Student')) {
            return ApiResponse::forbidden('Only students can start an assessment attempt.');
        }

        $isEnrolled = $assessment->batch->enrollments()
            ->where('student_id', $student->id)
            ->whereIn('status', ['Pending', 'Active'])
            ->exists();
        if (!$isEnrolled) {
            return ApiResponse::forbidden('You are not enrolled in this assessment cohort.');
        }

        // Verify assessment is open
        if ($assessment->status !== 'published') {
            return ApiResponse::error('This assessment is not currently active.', 403);
        }

        // Check attempts allowed
        $pastAttemptsCount = AssessmentAttempt::where('assessment_id', $assessment->id)
            ->where('student_id', $student->id)
            ->count();

        $activeAttempt = AssessmentAttempt::where('assessment_id', $assessment->id)
            ->where('student_id', $student->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$activeAttempt) {
            if ($pastAttemptsCount >= $assessment->attempts_allowed) {
                return ApiResponse::error("You have already used all allowed attempts ({$assessment->attempts_allowed}) for this assessment.", 422);
            }

            $activeAttempt = AssessmentAttempt::create([
                'assessment_id' => $assessment->id,
                'student_id' => $student->id,
                'attempt_number' => $pastAttemptsCount + 1,
                'started_at' => now(),
                'status' => 'in_progress',
            ]);
        }

        // Fetch questions with randomized options if configured, SECURELY stripping is_correct & explanation
        $questions = $assessment->questions()->with(['options' => function ($q) use ($assessment) {
            if ($assessment->randomize_options) {
                $q->inRandomOrder();
            } else {
                $q->orderBy('order');
            }
        }])->get();

        if ($assessment->randomize_questions) {
            $questions = $questions->shuffle();
        }

        $secureQuestions = $questions->map(function ($q) {
            return [
                'uuid' => $q->uuid,
                'question_text' => $q->question_text,
                'question_type' => $q->question_type,
                'marks' => (float) $q->marks,
                'difficulty' => $q->difficulty,
                'order' => $q->order,
                'options' => $q->options->map(fn($opt) => [
                    'id' => $opt->id,
                    'uuid' => $opt->uuid,
                    'option_text' => $opt->option_text,
                ]),
            ];
        });

        return ApiResponse::success([
            'attempt' => [
                'uuid' => $activeAttempt->uuid,
                'attempt_number' => $activeAttempt->attempt_number,
                'started_at' => $activeAttempt->started_at->toIso8601String(),
                'time_limit' => $assessment->time_limit, // in minutes
            ],
            'assessment' => [
                'uuid' => $assessment->uuid,
                'title' => $assessment->title,
                'description' => $assessment->description,
                'type' => $assessment->type,
                'total_marks' => (float) $assessment->total_marks,
                'pass_mark' => (float) $assessment->pass_mark,
            ],
            'questions' => $secureQuestions,
        ], 'Quiz session started.');
    }

    /**
     * Submit completed quiz attempt answers and calculate score.
     */
    public function submitAttempt(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $student = $request->user();

        if ($attempt->student_id !== $student->id) {
            return ApiResponse::forbidden();
        }

        if ($attempt->status === 'submitted' || $attempt->status === 'graded') {
            return ApiResponse::error('This attempt has already been submitted and graded.', 422);
        }

        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $gradedAttempt = AssessmentGradingService::gradeQuizAttempt($attempt, $validated['answers']);

        AuditLogService::log('quiz.submit', $gradedAttempt, null, [
            'score' => $gradedAttempt->score,
            'percentage' => $gradedAttempt->percentage,
            'passed' => $gradedAttempt->passed,
        ]);

        return ApiResponse::success([
            'attempt_uuid' => $gradedAttempt->uuid,
            'score' => (float) $gradedAttempt->score,
            'percentage' => (float) $gradedAttempt->percentage,
            'passed' => (bool) $gradedAttempt->passed,
            'submitted_at' => $gradedAttempt->submitted_at->toIso8601String(),
        ], 'Quiz submitted and graded successfully.');
    }

    /**
     * Get attempt results breakdown.
     */
    public function getAttemptResult(AssessmentAttempt $attempt): JsonResponse
    {
        $assessment = $attempt->assessment;
        $attempt->load(['answers.question.options', 'answers.selectedOption']);

        return ApiResponse::success([
            'attempt' => [
                'uuid' => $attempt->uuid,
                'score' => (float) $attempt->score,
                'percentage' => (float) $attempt->percentage,
                'passed' => (bool) $attempt->passed,
                'started_at' => $attempt->started_at,
                'submitted_at' => $attempt->submitted_at,
                'show_correct_answers' => (bool) $assessment->show_correct_answers,
            ],
            'assessment' => [
                'title' => $assessment->title,
                'type' => $assessment->type,
                'total_marks' => (float) $assessment->total_marks,
                'pass_mark' => (float) $assessment->pass_mark,
            ],
            'answers' => $attempt->answers->map(fn($ans) => [
                'question_text' => $ans->question?->question_text,
                'question_type' => $ans->question?->question_type,
                'marks_awarded' => (float) $ans->marks_awarded,
                'total_marks' => (float) $ans->question?->marks,
                'selected_option' => $ans->selectedOption?->option_text,
                'text_answer' => $ans->text_answer,
                'feedback' => $ans->feedback,
                'explanation' => $assessment->show_correct_answers ? $ans->question?->explanation : null,
            ]),
        ]);
    }
}
