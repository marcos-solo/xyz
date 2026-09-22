<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\AssignmentSubmission;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\GradingScheme;

class GradebookCalculationService
{
    /**
     * Compute full gradebook matrix for an intake batch.
     */
    public static function getBatchGradebook(CourseBatch $batch): array
    {
        $assessments = Assessment::where('batch_id', $batch->id)
            ->where('status', 'published')
            ->orderBy('created_at')
            ->get();

        $enrollments = Enrollment::where('batch_id', $batch->id)
            ->with(['student.studentProfile'])
            ->get();

        $gradingScheme = GradingScheme::where('organization_id', $batch->organization_id)
            ->where('is_default', true)
            ->with('ranges')
            ->first();

        $rows = [];

        foreach ($enrollments as $enrollment) {
            $student = $enrollment->student;
            if (! $student) {
                continue;
            }

            $assessmentScores = [];
            $totalWeightedScore = 0;
            $totalAssignedWeight = 0;

            foreach ($assessments as $assessment) {
                $score = null;
                $percentage = null;

                if (in_array($assessment->type, ['Quiz', 'CAT', 'Exam', 'Final Examination'])) {
                    $attempt = AssessmentAttempt::where('assessment_id', $assessment->id)
                        ->where('student_id', $student->id)
                        ->where('status', 'graded')
                        ->orderByDesc('score')
                        ->first();
                    if ($attempt) {
                        $score = (float) $attempt->score;
                        $percentage = (float) $attempt->percentage;
                    }
                } else {
                    $submission = AssignmentSubmission::where('assessment_id', $assessment->id)
                        ->where('student_id', $student->id)
                        ->first();
                    if ($submission && $submission->score !== null) {
                        $score = (float) $submission->score;
                        $percentage = (float) (($score / ($assessment->total_marks ?: 100)) * 100);
                    }
                }

                if ($percentage !== null) {
                    $weight = (float) $assessment->weight_percentage;
                    $totalWeightedScore += ($percentage * ($weight / 100));
                    $totalAssignedWeight += $weight;
                }

                $assessmentScores[$assessment->uuid] = [
                    'assessment_id' => $assessment->uuid,
                    'title' => $assessment->title,
                    'type' => $assessment->type,
                    'weight' => (float) $assessment->weight_percentage,
                    'score' => $score !== null ? round($score, 1) : null,
                    'percentage' => $percentage !== null ? round($percentage, 1) : null,
                ];
            }

            // Scale to 100 if weights total less than 100
            $finalScore = $totalAssignedWeight > 0 ? round(($totalWeightedScore / $totalAssignedWeight) * 100, 1) : 0;
            $gradeLetter = self::calculateGradeLetter($finalScore, $gradingScheme);

            // Update enrollment record with calculated grade
            if ($enrollment->final_score != $finalScore || $enrollment->final_grade != $gradeLetter) {
                $enrollment->update([
                    'final_score' => $finalScore,
                    'final_grade' => $gradeLetter,
                ]);
            }

            $rows[] = [
                'enrollment_id' => $enrollment->uuid,
                'enrollment_number' => $enrollment->enrollment_number,
                'student_uuid' => $student->uuid,
                'student_name' => $student->full_name,
                'student_number' => $student->studentProfile?->student_number ?? 'N/A',
                'assessments' => $assessmentScores,
                'final_score' => $finalScore,
                'total_weighted_score' => $finalScore,
                'final_grade' => $gradeLetter,
                'passed' => $finalScore >= 50,
            ];
        }

        return [
            'batch' => [
                'uuid' => $batch->uuid,
                'name' => $batch->name,
                'code' => $batch->code,
                'course' => $batch->course?->name,
            ],
            'assessments' => $assessments->map(fn ($a) => [
                'uuid' => $a->uuid,
                'title' => $a->title,
                'type' => $a->type,
                'weight' => (float) $a->weight_percentage,
                'total_marks' => (float) $a->total_marks,
            ]),
            'students' => $rows,
            'matrix' => $rows,
        ];
    }

    /**
     * Determine letter grade based on grading scale ranges.
     */
    public static function calculateGradeLetter(float $score, ?GradingScheme $scheme = null): string
    {
        if ($scheme && $scheme->ranges->isNotEmpty()) {
            foreach ($scheme->ranges as $range) {
                if ($score >= (float) $range->min_percentage && $score <= (float) $range->max_percentage) {
                    return $range->grade_letter;
                }
            }
        }

        // Fallback default
        if ($score >= 80) {
            return 'A';
        }
        if ($score >= 70) {
            return 'B';
        }
        if ($score >= 60) {
            return 'C';
        }
        if ($score >= 50) {
            return 'D';
        }

        return 'F';
    }
}
