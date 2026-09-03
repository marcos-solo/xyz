<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use App\Models\User;

class AssessmentGradingService
{
    /**
     * Submit and auto-grade an entire quiz attempt.
     */
    public static function gradeQuizAttempt(AssessmentAttempt $attempt, array $submittedAnswers): AssessmentAttempt
    {
        $assessment = $attempt->assessment()->with('questions.options')->first();
        $totalEarnedMarks = 0;
        $totalPossibleMarks = 0;

        foreach ($assessment->questions as $question) {
            $totalPossibleMarks += (float) $question->marks;
            $userAns = $submittedAnswers[$question->id] ?? $submittedAnswers[$question->uuid] ?? null;

            $marksAwarded = 0;
            $selectedOptionId = null;
            $selectedOptionsJson = null;
            $textAnswer = null;

            if ($question->question_type === 'Multiple Choice' || $question->question_type === 'True/False') {
                $selectedOptionId = is_array($userAns) ? ($userAns['selected_option_id'] ?? null) : $userAns;
                if ($selectedOptionId) {
                    $option = AssessmentOption::find($selectedOptionId);
                    if ($option && $option->is_correct) {
                        $marksAwarded = (float) $question->marks;
                    }
                }
            } elseif ($question->question_type === 'Multiple Select') {
                $selectedOptionIds = is_array($userAns) ? ($userAns['selected_option_ids'] ?? $userAns) : [];
                $selectedOptionsJson = $selectedOptionIds;

                $correctOptions = $question->options->where('is_correct', true)->pluck('id')->toArray();
                sort($correctOptions);
                sort($selectedOptionIds);

                if ($correctOptions === $selectedOptionIds && count($correctOptions) > 0) {
                    $marksAwarded = (float) $question->marks;
                }
            } elseif ($question->question_type === 'Short Answer') {
                $textAnswer = is_array($userAns) ? ($userAns['text_answer'] ?? '') : (string) $userAns;
                // Auto-match exact correct option if exists
                $correctOpt = $question->options->where('is_correct', true)->first();
                if ($correctOpt && strcasecmp(trim($correctOpt->option_text), trim($textAnswer)) === 0) {
                    $marksAwarded = (float) $question->marks;
                }
            } else {
                // Essay or Practical - requires manual grading
                $textAnswer = is_array($userAns) ? ($userAns['text_answer'] ?? '') : (string) $userAns;
                $marksAwarded = 0; // Marked by trainer later
            }

            AssessmentAnswer::updateOrCreate(
                ['attempt_id' => $attempt->id, 'question_id' => $question->id],
                [
                    'selected_option_id' => $selectedOptionId,
                    'selected_options_json' => $selectedOptionsJson,
                    'text_answer' => $textAnswer,
                    'marks_awarded' => $marksAwarded,
                ]
            );

            $totalEarnedMarks += $marksAwarded;
        }

        $percentage = $totalPossibleMarks > 0 ? ($totalEarnedMarks / $totalPossibleMarks) * 100 : 0;
        $passed = $percentage >= (float) $assessment->pass_mark;

        $attempt->update([
            'submitted_at' => now(),
            'score' => round($totalEarnedMarks, 2),
            'percentage' => round($percentage, 2),
            'passed' => $passed,
            'status' => 'graded',
        ]);

        return $attempt->fresh();
    }
}
