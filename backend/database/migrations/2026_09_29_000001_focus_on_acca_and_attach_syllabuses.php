<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $accaCourse = DB::table('courses')
                ->where('code', 'ACCA')
                ->whereNull('deleted_at')
                ->first();

            if (! $accaCourse) {
                // If soft-deleted or first ACCA course
                $accaCourse = DB::table('courses')->where('code', 'ACCA')->first();
                if ($accaCourse) {
                    DB::table('courses')->where('id', $accaCourse->id)->update([
                        'deleted_at' => null,
                        'status' => 'active',
                    ]);
                }
            }

            if (! $accaCourse) {
                return;
            }

            $accaCourseId = $accaCourse->id;
            $nonAccaCourses = DB::table('courses')
                ->where('id', '!=', $accaCourseId)
                ->get();
            $nonAccaCourseIds = $nonAccaCourses->pluck('id')->all();

            if (! empty($nonAccaCourseIds)) {
                // 1. Re-link any existing certificates to ACCA course and ACCA batch
                $accaBatch = DB::table('course_batches')
                    ->where('course_id', $accaCourseId)
                    ->orderBy('id')
                    ->first();

                if ($accaBatch) {
                    DB::table('certificates')
                        ->whereIn('course_id', $nonAccaCourseIds)
                        ->update([
                            'course_id' => $accaCourseId,
                            'batch_id' => $accaBatch->id,
                            'verification_code' => DB::raw("CONCAT('IAT-ACCA-', SUBSTRING(MD5(RAND()), 1, 6))"),
                        ]);
                } else {
                    DB::table('certificates')->whereIn('course_id', $nonAccaCourseIds)->delete();
                }

                // 2. Clean up course_progress for non-ACCA courses
                DB::table('course_progress')->whereIn('course_id', $nonAccaCourseIds)->delete();

                // 3. Clean up non-ACCA batches and all their related tables
                $nonAccaBatches = DB::table('course_batches')->whereIn('course_id', $nonAccaCourseIds)->get();
                $nonAccaBatchIds = $nonAccaBatches->pluck('id')->all();

                if (! empty($nonAccaBatchIds)) {
                    // Detach trainers
                    DB::table('batch_trainers')->whereIn('batch_id', $nonAccaBatchIds)->delete();

                    // Class sessions & attendance
                    $classSessions = DB::table('class_sessions')->whereIn('batch_id', $nonAccaBatchIds)->get();
                    $classSessionIds = $classSessions->pluck('id')->all();
                    if (! empty($classSessionIds)) {
                        $attSessions = DB::table('attendance_sessions')->whereIn('class_session_id', $classSessionIds)->get();
                        $attSessionIds = $attSessions->pluck('id')->all();
                        if (! empty($attSessionIds)) {
                            DB::table('attendance_records')->whereIn('attendance_session_id', $attSessionIds)->delete();
                            DB::table('attendance_sessions')->whereIn('id', $attSessionIds)->delete();
                        }
                        DB::table('class_sessions')->whereIn('id', $classSessionIds)->delete();
                    }

                    // Assessments
                    $assessments = DB::table('assessments')->whereIn('batch_id', $nonAccaBatchIds)->get();
                    $assessmentIds = $assessments->pluck('id')->all();
                    if (! empty($assessmentIds)) {
                        // Submissions
                        DB::table('assignment_submissions')->whereIn('assessment_id', $assessmentIds)->delete();
                        // Attempts & Answers
                        $attempts = DB::table('assessment_attempts')->whereIn('assessment_id', $assessmentIds)->get();
                        $attemptIds = $attempts->pluck('id')->all();
                        if (! empty($attemptIds)) {
                            DB::table('assessment_answers')->whereIn('attempt_id', $attemptIds)->delete();
                            DB::table('assessment_attempts')->whereIn('id', $attemptIds)->delete();
                        }
                        // Questions & Options
                        $questions = DB::table('assessment_questions')->whereIn('assessment_id', $assessmentIds)->get();
                        $questionIds = $questions->pluck('id')->all();
                        if (! empty($questionIds)) {
                            DB::table('assessment_options')->whereIn('question_id', $questionIds)->delete();
                            DB::table('assessment_questions')->whereIn('id', $questionIds)->delete();
                        }
                        DB::table('assessments')->whereIn('id', $assessmentIds)->delete();
                    }

                    // Feedbacks
                    DB::table('course_feedbacks')->whereIn('batch_id', $nonAccaBatchIds)->delete();

                    // Enrollments & finances
                    $enrollments = DB::table('enrollments')->whereIn('batch_id', $nonAccaBatchIds)->get();
                    $enrollmentIds = $enrollments->pluck('id')->all();
                    if (! empty($enrollmentIds)) {
                        $finances = DB::table('enrollment_finances')->whereIn('enrollment_id', $enrollmentIds)->get();
                        $financeIds = $finances->pluck('id')->all();
                        if (! empty($financeIds)) {
                            DB::table('finance_payments')->whereIn('enrollment_finance_id', $financeIds)->delete();
                            DB::table('enrollment_finances')->whereIn('id', $financeIds)->delete();
                        }
                        DB::table('enrollments')->whereIn('id', $enrollmentIds)->delete();
                    }

                    // Finally delete batches
                    DB::table('course_batches')->whereIn('id', $nonAccaBatchIds)->delete();
                }

                // 4. Clean up non-ACCA modules & lessons
                $nonAccaModules = DB::table('course_modules')->whereIn('course_id', $nonAccaCourseIds)->get();
                $nonAccaModuleIds = $nonAccaModules->pluck('id')->all();
                if (! empty($nonAccaModuleIds)) {
                    $nonAccaLessons = DB::table('lessons')->whereIn('module_id', $nonAccaModuleIds)->get();
                    $nonAccaLessonIds = $nonAccaLessons->pluck('id')->all();
                    if (! empty($nonAccaLessonIds)) {
                        DB::table('lesson_resources')->whereIn('lesson_id', $nonAccaLessonIds)->delete();
                        DB::table('lesson_progress')->whereIn('lesson_id', $nonAccaLessonIds)->delete();
                        DB::table('lessons')->whereIn('id', $nonAccaLessonIds)->delete();
                    }
                    DB::table('course_modules')->whereIn('id', $nonAccaModuleIds)->delete();
                }

                // Clean up non-ACCA units
                DB::table('course_units')->whereIn('course_id', $nonAccaCourseIds)->delete();

                // Delete orphan lessons where module no longer exists
                DB::table('lessons')->whereNotIn('module_id', DB::table('course_modules')->pluck('id'))->delete();

                // Delete non-ACCA courses permanently
                DB::table('courses')->whereIn('id', $nonAccaCourseIds)->delete();
            }

            // 5. Clean up non-ACCA learning paths and categories
            DB::table('learning_paths')
                ->where('slug', '!=', 'chartered-accounting-financial-strategy-track')
                ->delete();

            DB::table('course_categories')
                ->where('slug', '!=', 'acca')
                ->delete();

            // 6. Update ACCA course details
            $now = now();
            DB::table('courses')->where('id', $accaCourseId)->update([
                'name' => 'ACCA — Association of Chartered Certified Accountants',
                'short_description' => 'Comprehensive ACCA qualification covering Foundation (FIA), Applied Knowledge, Applied Skills, and Strategic Professional pathways with official CBE study syllabuses.',
                'description' => 'The premier global chartered accountancy qualification offering full syllabus coverage, official ACCA study guides, CBE exam preparation, structured cohort intakes, and career advancement across auditing, taxation, financial management, and corporate leadership.',
                'program_level' => 'Foundation / FIA, Applied Knowledge, Applied Skills, Strategic Professional',
                'paper_count' => 22,
                'duration' => 48,
                'duration_unit' => 'weeks',
                'level' => 'Professional',
                'status' => 'active',
                'updated_at' => $now,
            ]);

            // 7. Attach official syllabus PDFs to all ACCA lessons
            $syllabusMapping = [
                'FA1' => [
                    'file' => 'storage/syllabuses/acca-fa1-recording-financial-transactions-syllabus.pdf',
                    'title' => 'FA1 — Recording Financial Transactions Syllabus & Study Guide',
                    'size' => 227370,
                ],
                'MA1' => [
                    'file' => 'storage/syllabuses/acca-ma1-management-information-syllabus.pdf',
                    'title' => 'MA1 — Management Information Syllabus & Study Guide',
                    'size' => 203982,
                ],
                'FA2' => [
                    'file' => 'storage/syllabuses/acca-fa2-maintaining-financial-records-syllabus.pdf',
                    'title' => 'FA2 — Maintaining Financial Records Syllabus & Study Guide',
                    'size' => 262256,
                ],
                'MA2' => [
                    'file' => 'storage/syllabuses/acca-ma2-managing-costs-finance-syllabus.pdf',
                    'title' => 'MA2 — Managing Costs & Finance Syllabus & Study Guide',
                    'size' => 242560,
                ],
                'FBT' => [
                    'file' => 'storage/syllabuses/acca-fbt-business-technology-syllabus.pdf',
                    'title' => 'FBT — Business & Technology Syllabus & Study Guide',
                    'size' => 1698042,
                ],
                'FMA' => [
                    'file' => 'storage/syllabuses/acca-fma-management-accounting-syllabus.pdf',
                    'title' => 'FMA — Management Accounting Syllabus & Study Guide',
                    'size' => 261270,
                ],
                'FFA' => [
                    'file' => 'storage/syllabuses/acca-ffa-financial-accounting-syllabus.pdf',
                    'title' => 'FFA — Financial Accounting Syllabus & Study Guide',
                    'size' => 325802,
                ],
                'AB/BT' => [
                    'file' => 'storage/syllabuses/acca-bt-business-technology-syllabus.pdf',
                    'title' => 'BT — Business & Technology Syllabus & Study Guide',
                    'size' => 349781,
                ],
                'BT' => [
                    'file' => 'storage/syllabuses/acca-bt-business-technology-syllabus.pdf',
                    'title' => 'BT — Business & Technology Syllabus & Study Guide',
                    'size' => 349781,
                ],
                'MA' => [
                    'file' => 'storage/syllabuses/acca-ma-management-accounting-syllabus.pdf',
                    'title' => 'MA — Management Accounting Syllabus & Study Guide',
                    'size' => 261270,
                ],
                'FA' => [
                    'file' => 'storage/syllabuses/acca-fa-financial-accounting-syllabus.pdf',
                    'title' => 'FA — Financial Accounting Syllabus & Study Guide',
                    'size' => 325802,
                ],
                'CL/LW' => [
                    'file' => 'storage/syllabuses/acca-cl-corporate-business-law-syllabus.pdf',
                    'title' => 'CL/LW — Corporate & Business Law Syllabus & Study Guide',
                    'size' => 458320,
                ],
                'PM' => [
                    'file' => 'storage/syllabuses/acca-pm-performance-management-syllabus.pdf',
                    'title' => 'PM — Performance Management Syllabus & Study Guide',
                    'size' => 859410,
                ],
                'TX' => [
                    'file' => 'storage/syllabuses/acca-tx-taxation-uk-syllabus.pdf',
                    'title' => 'TX — Taxation (UK) Syllabus & Study Guide',
                    'size' => 778090,
                ],
                'FR' => [
                    'file' => 'storage/syllabuses/acca-fr-financial-reporting-syllabus.pdf',
                    'title' => 'FR — Financial Reporting Syllabus & Study Guide',
                    'size' => 761156,
                ],
                'AA' => [
                    'file' => 'storage/syllabuses/acca-aa-audit-assurance-syllabus.pdf',
                    'title' => 'AA — Audit & Assurance Syllabus & Study Guide',
                    'size' => 572951,
                ],
                'FM' => [
                    'file' => 'storage/syllabuses/acca-fm-financial-management-syllabus.pdf',
                    'title' => 'FM — Financial Management Syllabus & Study Guide',
                    'size' => 517913,
                ],
                'SBR' => [
                    'file' => 'storage/syllabuses/acca-sbr-strategic-business-reporting-syllabus.pdf',
                    'title' => 'SBR — Strategic Business Reporting Syllabus & Study Guide',
                    'size' => 687687,
                ],
                'SBL' => [
                    'file' => 'storage/syllabuses/acca-sbl-strategic-business-leader-syllabus.pdf',
                    'title' => 'SBL — Strategic Business Leader Syllabus & Study Guide',
                    'size' => 734445,
                ],
                'AFM' => [
                    'file' => 'storage/syllabuses/acca-afm-advanced-financial-management-syllabus.pdf',
                    'title' => 'AFM — Advanced Financial Management Syllabus & Study Guide',
                    'size' => 568640,
                ],
                'APM' => [
                    'file' => 'storage/syllabuses/acca-apm-advanced-performance-management-syllabus.pdf',
                    'title' => 'APM — Advanced Performance Management Syllabus & Study Guide',
                    'size' => 564290,
                ],
                'ATX' => [
                    'file' => 'storage/syllabuses/acca-atx-advanced-taxation-syllabus.pdf',
                    'title' => 'ATX — Advanced Taxation Syllabus & Study Guide',
                    'size' => 1014464,
                ],
                'AAA' => [
                    'file' => 'storage/syllabuses/acca-aaa-advanced-audit-assurance-syllabus.pdf',
                    'title' => 'AAA — Advanced Audit & Assurance Syllabus & Study Guide',
                    'size' => 536150,
                ],
            ];

            $accaModules = DB::table('course_modules')->where('course_id', $accaCourseId)->get();
            $accaModuleIds = $accaModules->pluck('id')->all();
            $lessons = DB::table('lessons')->whereIn('module_id', $accaModuleIds)->get();

            foreach ($lessons as $lesson) {
                $matchedConfig = null;
                foreach ($syllabusMapping as $code => $config) {
                    if (str_starts_with($lesson->title, $code.' ') ||
                        str_starts_with($lesson->title, $code.'—') ||
                        str_starts_with($lesson->title, $code.' —')) {
                        $matchedConfig = $config;
                        break;
                    }
                }

                if ($matchedConfig) {
                    DB::table('lessons')->where('id', $lesson->id)->update([
                        'content_type' => 'pdf',
                        'file_path' => $matchedConfig['file'],
                        'description' => "Official ACCA Syllabus and Study Guide for {$lesson->title}. Includes CBE exam format, learning outcomes, intellectual levels, and revision guidelines.",
                        'updated_at' => $now,
                    ]);

                    // Insert or update lesson resource
                    $existingResource = DB::table('lesson_resources')
                        ->where('lesson_id', $lesson->id)
                        ->where('title', $matchedConfig['title'])
                        ->first();

                    if (! $existingResource) {
                        DB::table('lesson_resources')->insert([
                            'uuid' => (string) Str::uuid(),
                            'lesson_id' => $lesson->id,
                            'title' => $matchedConfig['title'],
                            'file_path' => $matchedConfig['file'],
                            'file_type' => 'application/pdf',
                            'file_size' => $matchedConfig['size'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }

                    // Special extra resource for SBL
                    if (str_contains($lesson->title, 'SBL')) {
                        $sblGuide = DB::table('lesson_resources')
                            ->where('lesson_id', $lesson->id)
                            ->where('file_path', 'storage/syllabuses/acca-sbl-mapping-guide.pdf')
                            ->first();

                        if (! $sblGuide) {
                            DB::table('lesson_resources')->insert([
                                'uuid' => (string) Str::uuid(),
                                'lesson_id' => $lesson->id,
                                'title' => 'How Applied Knowledge and Applied Skills map to SBL Guide',
                                'file_path' => 'storage/syllabuses/acca-sbl-mapping-guide.pdf',
                                'file_type' => 'application/pdf',
                                'file_size' => 270027,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        }
                    }
                }
            }
        });
    }

    public function down(): void
    {
        // One-way focus migration
    }
};
