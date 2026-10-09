<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use App\Models\CourseBatch;
use App\Models\GradingScaleRange;
use App\Models\GradingScheme;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssessmentAndGradingSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        $batch = CourseBatch::where('code', 'ACCA-AK-2026-SEP-NRB')->first()
            ?? CourseBatch::where('code', 'like', '%ACCA%')->first();
        $trainer = User::where('email', 'trainer.nairobi@iatlms.test')->first() ?? User::role('Trainer')->first();

        $studentJohn = User::where('email', 'student.john@iatlms.test')->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();

        // 1. Standard Grading Scheme
        $scheme = GradingScheme::firstOrCreate(
            ['organization_id' => $org->id, 'name' => 'ACCA Professional Qualification Grading Scheme'],
            ['is_default' => true]
        );

        if (! GradingScaleRange::where('scheme_id', $scheme->id)->exists()) {
            $ranges = [
                ['grade_letter' => 'A', 'min_percentage' => 80.00, 'max_percentage' => 100.00, 'gpa_point' => 4.00, 'description' => 'Distinction / Excellent'],
                ['grade_letter' => 'B', 'min_percentage' => 70.00, 'max_percentage' => 79.99, 'gpa_point' => 3.00, 'description' => 'Credit / Very Good'],
                ['grade_letter' => 'C', 'min_percentage' => 60.00, 'max_percentage' => 69.99, 'gpa_point' => 2.00, 'description' => 'Pass / Good'],
                ['grade_letter' => 'D', 'min_percentage' => 50.00, 'max_percentage' => 59.99, 'gpa_point' => 1.00, 'description' => 'Satisfactory Pass (ACCA 50% Threshold)'],
                ['grade_letter' => 'F', 'min_percentage' => 0.00, 'max_percentage' => 49.99, 'gpa_point' => 0.00, 'description' => 'Fail / Unsatisfactory'],
            ];
            foreach ($ranges as $range) {
                GradingScaleRange::create(array_merge($range, ['scheme_id' => $scheme->id]));
            }
        }

        if (! $batch || ! $trainer) {
            return;
        }

        if (Assessment::where('batch_id', $batch->id)->where('title', 'like', '%Financial Accounting%')->exists()) {
            return;
        }

        // 2. Assessments
        // Assessment 1: ACCA Financial Accounting (FA) CBE Quiz
        $quiz = Assessment::create([
            'organization_id' => $org->id,
            'batch_id' => $batch->id,
            'title' => 'ACCA FA / FFA CBE Knowledge Check: Double Entry & Balance Sheet',
            'description' => 'Timed assessment covering the double-entry bookkeeping cycle, journal adjustments, accruals, and statement of financial position.',
            'type' => 'Quiz',
            'weight_percentage' => 25.00,
            'total_marks' => 100.00,
            'pass_mark' => 50.00,
            'time_limit' => 45,
            'attempts_allowed' => 2,
            'randomize_questions' => true,
            'randomize_options' => true,
            'show_immediate_results' => true,
            'show_correct_answers' => true,
            'due_date' => now()->addDays(14),
            'status' => 'published',
            'created_by' => $trainer->id,
        ]);

        // Question 1: Double entry principle
        $q1 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'Under IAS 1 and double-entry accounting, what is the correct recording for credit purchases of inventory?',
            'question_type' => 'Multiple Choice',
            'marks' => 25.00,
            'explanation' => 'Purchases (Expense) increase with a Debit, while Trade Payables (Liability) increase with a Credit.',
            'difficulty' => 'Easy',
            'order' => 1,
        ]);
        AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Debit Trade Payables, Credit Purchases', 'is_correct' => false, 'order' => 1]);
        AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Debit Purchases, Credit Trade Payables', 'is_correct' => true, 'order' => 2]);
        AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Debit Inventory, Credit Cash', 'is_correct' => false, 'order' => 3]);
        AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Debit Sales, Credit Trade Receivables', 'is_correct' => false, 'order' => 4]);

        // Question 2: Accruals calculation
        $q2 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'A company pays annual rent of $12,000 for the period 1 July 2025 to 30 June 2026. For the financial year ended 31 December 2025, what prepayment or accrual should be reported?',
            'question_type' => 'Multiple Choice',
            'marks' => 25.00,
            'explanation' => 'Rent paid covers 6 months into the next accounting period ($12,000 * 6/12 = $6,000 prepayment).',
            'difficulty' => 'Medium',
            'order' => 2,
        ]);
        AssessmentOption::create(['question_id' => $q2->id, 'option_text' => 'Prepayment of $6,000', 'is_correct' => true, 'order' => 1]);
        AssessmentOption::create(['question_id' => $q2->id, 'option_text' => 'Accrual of $6,000', 'is_correct' => false, 'order' => 2]);
        AssessmentOption::create(['question_id' => $q2->id, 'option_text' => 'Prepayment of $3,000', 'is_correct' => false, 'order' => 3]);
        AssessmentOption::create(['question_id' => $q2->id, 'option_text' => 'Accrual of $12,000', 'is_correct' => false, 'order' => 4]);

        // Question 3: True / False
        $q3 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'According to ACCA Code of Ethics, Objectivity requires that professional accountants do not compromise professional or business judgement because of bias, conflict of interest, or undue influence.',
            'question_type' => 'True/False',
            'marks' => 25.00,
            'explanation' => 'Objectivity is one of the five fundamental ethical principles in the IESBA / ACCA Code of Ethics.',
            'difficulty' => 'Easy',
            'order' => 3,
        ]);
        AssessmentOption::create(['question_id' => $q3->id, 'option_text' => 'True', 'is_correct' => true, 'order' => 1]);
        AssessmentOption::create(['question_id' => $q3->id, 'option_text' => 'False', 'is_correct' => false, 'order' => 2]);

        // Question 4: Short answer
        AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'Explain the difference between a statement of profit or loss and a statement of financial position in terms of time scope.',
            'question_type' => 'Short Answer',
            'marks' => 25.00,
            'explanation' => 'The profit or loss covers financial performance over a reporting period (flow), while the statement of financial position shows assets, liabilities, and equity at a specific point in time (snapshot).',
            'difficulty' => 'Medium',
            'order' => 4,
        ]);
    }
}
