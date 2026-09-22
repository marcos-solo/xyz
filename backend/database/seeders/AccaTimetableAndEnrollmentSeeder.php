<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use App\Models\ClassSession;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseFeedback;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\User;
use App\Notifications\EnrollmentApprovedNotification;
use App\Notifications\FeedbackSubmittedNotification;
use App\Notifications\FeedbackWindowOpenedNotification;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AccaTimetableAndEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::first();
        $accaCourse = Course::where('code', 'ACCA')->first();

        if (! $accaCourse) {
            $this->command->error('ACCA Course not found.');

            return;
        }

        $admin = User::role('Super Admin')->first() ?? User::first();
        $leadTrainer = User::where('email', 'trainer.nairobi@iatlms.test')->first() ?? User::role('Trainer')->first();
        $asstTrainer = User::where('email', 'asst.trainer@iatlms.test')->first() ?? $leadTrainer;
        $academicManager = User::where('email', 'academic.manager@iatlms.test')->first() ?? User::role('Academic Manager')->first();

        // 1. Identify Batches
        $appliedSkillsBatch = CourseBatch::where('code', 'ACCA-AS-2026-SEP-NRB')->first()
            ?? CourseBatch::where('name', 'like', '%Applied Skills%')->first();

        $fiaBatch = CourseBatch::where('code', 'ACCA-FIA-2026-SEP-NRB')->first()
            ?? CourseBatch::where('name', 'like', '%FIA%')->first();

        if (! $appliedSkillsBatch || ! $fiaBatch) {
            $this->command->error('ACCA Batches not found.');

            return;
        }

        // Attach Trainers
        if ($leadTrainer) {
            $appliedSkillsBatch->trainers()->syncWithoutDetaching([$leadTrainer->id, $asstTrainer?->id]);
            $fiaBatch->trainers()->syncWithoutDetaching([$leadTrainer->id, $asstTrainer?->id]);
        }

        // 2. Enroll and Approve Students with Portal Notifications
        // Reserve student.john@iatlms.test for Admissions Workflow testing
        $allStudents = User::role('Student')
            ->where('email', '!=', 'student.john@iatlms.test')
            ->orderBy('id')
            ->get();

        // Applied Skills Students
        $appliedSkillsStudents = $allStudents->take(3);
        // FIA Students
        $fiaStudents = $allStudents->skip(3)->take(3);
        if ($fiaStudents->isEmpty()) {
            $fiaStudents = $allStudents->take(2);
        }

        $this->enrollStudentsIntoBatch($appliedSkillsStudents, $appliedSkillsBatch, $admin);
        $this->enrollStudentsIntoBatch($fiaStudents, $fiaBatch, $admin);

        // 3. Seed Applied Skills Timetable (CL, TX, FR, FM)
        $this->seedAppliedSkillsTimetable($appliedSkillsBatch, $leadTrainer);

        // 4. Seed FIA Timetable (FFA, FA2: Session 1 & 2)
        $this->seedFiaTimetable($fiaBatch, $leadTrainer);

        // 5. Seed Assessments for Applied Skills and FIA
        $this->seedAppliedSkillsAssessments($organization, $appliedSkillsBatch, $leadTrainer);
        $this->seedFiaAssessments($organization, $fiaBatch, $leadTrainer);

        // 6. Feedback Windows & Submissions
        $this->seedFeedbackCampaignsAndSubmissions($appliedSkillsBatch, $fiaBatch, $appliedSkillsStudents, $fiaStudents, $leadTrainer, $academicManager);

        $this->command->info('ACCA Timetable, Enrollments, Assessments, and Feedback seeded successfully.');
    }

    protected function enrollStudentsIntoBatch($students, CourseBatch $batch, $admin): void
    {
        foreach ($students as $student) {
            $enrollment = Enrollment::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'batch_id' => $batch->id,
                ],
                [
                    'uuid' => (string) Str::uuid(),
                    'enrollment_number' => 'ENR-ACCA-'.str_pad($student->id, 4, '0', STR_PAD_LEFT).'-'.$batch->id,
                    'enrollment_date' => Carbon::parse('2026-09-01'),
                    'status' => 'Active',
                    'workflow_stage' => 'in_training',
                    'workflow_updated_by' => $admin->id,
                    'workflow_updated_at' => now(),
                ]
            );

            // Update workflow to in_training if not already
            $enrollment->update([
                'status' => 'Active',
                'workflow_stage' => 'in_training',
                'workflow_updated_by' => $admin->id,
                'workflow_updated_at' => now(),
            ]);

            // Dispatch in-portal database notification to student
            $student->notify(new EnrollmentApprovedNotification(
                $enrollment,
                "Welcome to {$batch->name}! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active."
            ));
        }
    }

    protected function seedAppliedSkillsTimetable(CourseBatch $batch, $trainer): void
    {
        // Weekly schedule:
        // MON: 6:00-8:00 AM CL
        // TUE: 5:30-8:30 PM TX
        // WED: 5:30-8:30 PM FR
        // THU: 5:30-8:30 PM FM
        // FRI: 5:30-8:30 PM FR
        $startDate = Carbon::parse('2026-09-01');
        $endDate = Carbon::parse('2026-11-20');

        $current = $startDate->copy();
        $sessionIndex = 1;

        while ($current->lte($endDate)) {
            $dayOfWeek = $current->dayOfWeek; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri

            $sessionConfig = null;
            if ($dayOfWeek === Carbon::MONDAY) {
                $sessionConfig = [
                    'unit' => 'CL',
                    'name' => 'Corporate & Business Law',
                    'start' => '06:00:00',
                    'end' => '08:00:00',
                ];
            } elseif ($dayOfWeek === Carbon::TUESDAY) {
                $sessionConfig = [
                    'unit' => 'TX',
                    'name' => 'Taxation',
                    'start' => '17:30:00',
                    'end' => '20:30:00',
                ];
            } elseif ($dayOfWeek === Carbon::WEDNESDAY) {
                $sessionConfig = [
                    'unit' => 'FR',
                    'name' => 'Financial Reporting',
                    'start' => '17:30:00',
                    'end' => '20:30:00',
                ];
            } elseif ($dayOfWeek === Carbon::THURSDAY) {
                $sessionConfig = [
                    'unit' => 'FM',
                    'name' => 'Financial Management',
                    'start' => '17:30:00',
                    'end' => '20:30:00',
                ];
            } elseif ($dayOfWeek === Carbon::FRIDAY) {
                $sessionConfig = [
                    'unit' => 'FR',
                    'name' => 'Financial Reporting (Practical & Past Papers)',
                    'start' => '17:30:00',
                    'end' => '20:30:00',
                ];
            }

            if ($sessionConfig) {
                $isPast = $current->lt(Carbon::parse('2026-09-16'));
                ClassSession::firstOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'date' => $current->format('Y-m-d'),
                        'start_time' => $sessionConfig['start'],
                    ],
                    [
                        'uuid' => (string) Str::uuid(),
                        'trainer_id' => $trainer?->id,
                        'title' => "ACCA Applied Skills: {$sessionConfig['unit']} - {$sessionConfig['name']} (Session #{$sessionIndex})",
                        'topic' => "{$sessionConfig['name']} Core Modules & Exam Techniques",
                        'end_time' => $sessionConfig['end'],
                        'delivery_mode' => 'Physical',
                        'location' => 'Hall A - Applied Skills Center, Nairobi Main',
                        'meeting_url' => 'https://meet.google.com/acca-applied-skills',
                        'status' => $isPast ? 'completed' : 'scheduled',
                        'notes' => 'Timetable synced per ACCA Applied Skills schedule.',
                    ]
                );
                $sessionIndex++;
            }

            $current->addDay();
        }
    }

    protected function seedFiaTimetable(CourseBatch $batch, $trainer): void
    {
        // Session run time: 15.09.2026 - 13.11.2026
        // MON: Session 1 (8-10am) FFA, Session 2 (10am-12pm) FFA
        // TUE: Session 1 (8-10am) FA2, Session 2 (10am-12pm) FA2
        // WED: Session 1 (8-10am) FFA, Session 2 (10am-12pm) FFA
        // THU: Session 1 (8-10am) FA2, Session 2 (10am-12pm) FA2
        // FRI: Session 1 (8-10am) FA2, Session 2 (10am-12pm) FA2
        $startDate = Carbon::parse('2026-09-15');
        $endDate = Carbon::parse('2026-11-13');

        $current = $startDate->copy();
        $counter = 1;

        while ($current->lte($endDate)) {
            $dayOfWeek = $current->dayOfWeek;

            $unit = null;
            $unitFullName = null;

            if ($dayOfWeek === Carbon::MONDAY || $dayOfWeek === Carbon::WEDNESDAY) {
                $unit = 'FFA';
                $unitFullName = 'Financial Accounting';
            } elseif (in_array($dayOfWeek, [Carbon::TUESDAY, Carbon::THURSDAY, Carbon::FRIDAY])) {
                $unit = 'FA2';
                $unitFullName = 'Maintaining Financial Records';
            }

            if ($unit) {
                $isPast = $current->lt(Carbon::parse('2026-09-16'));

                // Session 1: 8:00 - 10:00 AM
                ClassSession::firstOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'date' => $current->format('Y-m-d'),
                        'start_time' => '08:00:00',
                    ],
                    [
                        'uuid' => (string) Str::uuid(),
                        'trainer_id' => $trainer?->id,
                        'title' => "ACCA FIA {$unit}: Session 1 - {$unitFullName}",
                        'topic' => "{$unitFullName} Theoretical Foundations & Drills",
                        'end_time' => '10:00:00',
                        'delivery_mode' => 'Physical',
                        'location' => 'Room 204 - FIA Academy, Nairobi Main',
                        'meeting_url' => 'https://meet.google.com/acca-fia-morning',
                        'status' => $isPast ? 'completed' : 'scheduled',
                        'notes' => 'FIA Session 1 (8:00-10:00 AM)',
                    ]
                );

                // Session 2: 10:00 AM - 12:00 NOON
                ClassSession::firstOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'date' => $current->format('Y-m-d'),
                        'start_time' => '10:00:00',
                    ],
                    [
                        'uuid' => (string) Str::uuid(),
                        'trainer_id' => $trainer?->id,
                        'title' => "ACCA FIA {$unit}: Session 2 - {$unitFullName}",
                        'topic' => "{$unitFullName} Practical Problem Sets & Ledger Postings",
                        'end_time' => '12:00:00',
                        'delivery_mode' => 'Physical',
                        'location' => 'Room 204 - FIA Academy, Nairobi Main',
                        'meeting_url' => 'https://meet.google.com/acca-fia-noon',
                        'status' => $isPast ? 'completed' : 'scheduled',
                        'notes' => 'FIA Session 2 (10:00AM-12:00 NOON)',
                    ]
                );

                $counter++;
            }

            $current->addDay();
        }
    }

    protected function seedAppliedSkillsAssessments(Organization $org, CourseBatch $batch, $trainer): void
    {
        $assessments = [
            // Corporate & Business Law (CL)
            [
                'title' => 'ACCA CL: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'First continuous assessment test covering Contract Law, Formation, and Breach.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-09-02 23:59:59',
            ],
            [
                'title' => 'ACCA CL: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Second continuous assessment test covering Company Law, Directors, and Insolvency.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-16 23:59:59',
            ],
            [
                'title' => 'ACCA CL: Mock Examination',
                'description' => 'Full-length mock exam simulating ACCA Computer Based Exam conditions for Corporate & Business Law.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-05 23:59:59',
            ],
            [
                'title' => 'ACCA CL: Final Examination',
                'description' => 'Final institutional ACCA examination for Corporate and Business Law (CL).',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-10 23:59:59',
            ],

            // Taxation (TX)
            [
                'title' => 'ACCA TX: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'Income Tax computations for employed and self-employed individuals.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-02 23:59:59',
            ],
            [
                'title' => 'ACCA TX: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Corporation Tax, Capital Gains Tax, and Value Added Tax computations.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-11-06 23:59:59',
            ],
            [
                'title' => 'ACCA TX: Mock Examination',
                'description' => 'Timed 3-hour mock exam covering comprehensive syllabus of ACCA TX.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-11-27 23:59:59',
            ],
            [
                'title' => 'ACCA TX: Final Examination Window',
                'description' => 'Official ACCA Final Exam for Taxation Paper.',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-12-07 23:59:59',
            ],

            // Financial Reporting (FR)
            [
                'title' => 'ACCA FR: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'Conceptual Framework, IFRS standards, and single-entity financial statements.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-03 23:59:59',
            ],
            [
                'title' => 'ACCA FR: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Consolidated financial statements and group accounts.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-11-07 23:59:59',
            ],
            [
                'title' => 'ACCA FR: Mock Examination',
                'description' => 'Comprehensive ACCA FR Mock Exam simulating live testing environment.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-11-28 23:59:59',
            ],
            [
                'title' => 'ACCA FR: Final Examination Window',
                'description' => 'Official ACCA Final Exam for Financial Reporting (FR).',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-12-08 23:59:59',
            ],

            // Financial Management (FM)
            [
                'title' => 'ACCA FM: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'Working capital management and investment appraisal (NPV, IRR).',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-03 23:59:59',
            ],
            [
                'title' => 'ACCA FM: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Business finance, cost of capital, and risk management techniques.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-11-07 23:59:59',
            ],
            [
                'title' => 'ACCA FM: Mock Examination',
                'description' => 'ACCA FM Mock Exam covering all syllabus areas.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-11-28 23:59:59',
            ],
            [
                'title' => 'ACCA FM: Final Examination Window',
                'description' => 'Official ACCA Final Exam for Financial Management (FM).',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 180,
                'due_date' => '2026-12-09 23:59:59',
            ],
        ];

        foreach ($assessments as $data) {
            $assessment = Assessment::firstOrCreate(
                [
                    'batch_id' => $batch->id,
                    'title' => $data['title'],
                ],
                array_merge($data, [
                    'uuid' => (string) Str::uuid(),
                    'organization_id' => $org->id,
                    'attempts_allowed' => 2,
                    'randomize_questions' => true,
                    'randomize_options' => true,
                    'show_immediate_results' => true,
                    'show_correct_answers' => true,
                    'status' => 'published',
                    'created_by' => $trainer?->id ?? 1,
                ])
            );
            $this->seedQuestionsForAssessment($assessment);
        }
    }

    protected function seedFiaAssessments(Organization $org, CourseBatch $batch, $trainer): void
    {
        $assessments = [
            // FFA (Financial Accounting)
            [
                'title' => 'ACCA FIA FFA: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'Principles of financial accounting, double-entry bookkeeping, and ledger balances.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-05 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FFA: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Preparation of trial balances, bank reconciliations, and accruals/prepayments.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-26 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FFA: Mock Examination',
                'description' => 'Mock exam simulating the 2-hour CBE format for FFA.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-16 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FFA: Final Examination',
                'description' => 'Final ACCA Foundations in Accountancy (FFA) Computer Based Exam.',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-23 23:59:59',
            ],

            // FA2 (Maintaining Financial Records)
            [
                'title' => 'ACCA FIA FA2: Continuous Assessment Test 1 (CAT 1)',
                'description' => 'Basic accounting principles, journal entries, and corrections of errors.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-07 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FA2: Continuous Assessment Test 2 (CAT 2)',
                'description' => 'Control accounts, sales and purchase ledgers, and inventory valuation.',
                'type' => 'CAT',
                'weight_percentage' => 15.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 60,
                'due_date' => '2026-10-27 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FA2: Mock Examination',
                'description' => 'Full-length FA2 Mock Examination.',
                'type' => 'CAT',
                'weight_percentage' => 20.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-17 23:59:59',
            ],
            [
                'title' => 'ACCA FIA FA2: Final Examination',
                'description' => 'Final ACCA Foundations in Accountancy (FA2) Computer Based Exam.',
                'type' => 'Final Examination',
                'weight_percentage' => 50.00,
                'total_marks' => 100.00,
                'pass_mark' => 50.00,
                'time_limit' => 120,
                'due_date' => '2026-11-25 23:59:59',
            ],
        ];

        foreach ($assessments as $data) {
            $assessment = Assessment::firstOrCreate(
                [
                    'batch_id' => $batch->id,
                    'title' => $data['title'],
                ],
                array_merge($data, [
                    'uuid' => (string) Str::uuid(),
                    'organization_id' => $org->id,
                    'attempts_allowed' => 2,
                    'randomize_questions' => true,
                    'randomize_options' => true,
                    'show_immediate_results' => true,
                    'show_correct_answers' => true,
                    'status' => 'published',
                    'created_by' => $trainer?->id ?? 1,
                ])
            );
            $this->seedQuestionsForAssessment($assessment);
        }
    }

    protected function seedFeedbackCampaignsAndSubmissions(
        CourseBatch $appliedSkillsBatch,
        CourseBatch $fiaBatch,
        $appliedSkillsStudents,
        $fiaStudents,
        $leadTrainer,
        $academicManager
    ): void {
        // Feedback windows from PDF 2:
        // Beginning: 25.09.2026
        // Middle: 16.10.2026
        // Exit: 20.11.2026
        $windows = [
            ['period' => 'beginning', 'date' => '2026-09-25'],
            ['period' => 'middle', 'date' => '2026-10-16'],
            ['period' => 'exit', 'date' => '2026-11-20'],
        ];

        // Dispatch feedback window notifications to students and trainers
        foreach ([$appliedSkillsBatch, $fiaBatch] as $batch) {
            foreach ($windows as $w) {
                // Window opened notification
                $leadTrainer?->notify(new FeedbackWindowOpenedNotification($batch, $w['period'], $w['date']));
                $academicManager?->notify(new FeedbackWindowOpenedNotification($batch, $w['period'], $w['date']));
            }
        }

        // Seed realistic sample student feedback
        $sampleFeedbacks = [
            [
                'batch' => $appliedSkillsBatch,
                'student' => $appliedSkillsStudents->first(),
                'unit_code' => 'CL',
                'period' => 'beginning',
                'rating' => 5,
                'category' => 'Trainer Delivery',
                'comments' => 'The morning CL sessions at 6:00 AM are very sharp and well-structured. The lecturer explains corporate governance and contract law cases clearly with real Kenyan and UK case examples.',
                'metrics' => [
                    'content_clarity' => 5,
                    'trainer_responsiveness' => 5,
                    'pacing' => 4,
                    'material_relevance' => 5,
                ],
            ],
            [
                'batch' => $appliedSkillsBatch,
                'student' => $appliedSkillsStudents->skip(1)->first(),
                'unit_code' => 'TX',
                'period' => 'beginning',
                'rating' => 4,
                'category' => 'Curriculum & Resources',
                'comments' => 'Taxation practice questions are very comprehensive. Would appreciate a bit more time spent on withholding tax calculation exercises during the evening classes.',
                'metrics' => [
                    'content_clarity' => 4,
                    'trainer_responsiveness' => 5,
                    'pacing' => 4,
                    'material_relevance' => 5,
                ],
            ],
            [
                'batch' => $fiaBatch,
                'student' => $fiaStudents->first(),
                'unit_code' => 'FFA',
                'period' => 'beginning',
                'rating' => 5,
                'category' => 'Learning Environment',
                'comments' => 'FFA double-entry lectures are excellent! Breaking down into two 2-hour morning sessions makes grasping complex ledger accounts so much easier.',
                'metrics' => [
                    'content_clarity' => 5,
                    'trainer_responsiveness' => 5,
                    'pacing' => 5,
                    'material_relevance' => 5,
                ],
            ],
            [
                'batch' => $fiaBatch,
                'student' => $fiaStudents->skip(1)->first(),
                'unit_code' => 'FA2',
                'period' => 'beginning',
                'rating' => 5,
                'category' => 'Overall Satisfaction',
                'comments' => 'Fantastic guidance on maintaining financial records and trial balances. The interactive problem sets in session 2 give us immediate practice.',
                'metrics' => [
                    'content_clarity' => 5,
                    'trainer_responsiveness' => 5,
                    'pacing' => 5,
                    'material_relevance' => 5,
                ],
            ],
        ];

        foreach ($sampleFeedbacks as $item) {
            if (! $item['student'] || ! $item['batch']) {
                continue;
            }

            $feedback = CourseFeedback::firstOrCreate(
                [
                    'batch_id' => $item['batch']->id,
                    'student_id' => $item['student']->id,
                    'unit_code' => $item['unit_code'],
                    'period' => $item['period'],
                ],
                [
                    'uuid' => (string) Str::uuid(),
                    'trainer_id' => $leadTrainer?->id,
                    'rating' => $item['rating'],
                    'category' => $item['category'],
                    'comments' => $item['comments'],
                    'metrics' => $item['metrics'],
                    'status' => 'submitted',
                ]
            );

            // Notify Trainer and Academic Manager
            $leadTrainer?->notify(new FeedbackSubmittedNotification($feedback));
            $academicManager?->notify(new FeedbackSubmittedNotification($feedback));
        }
    }

    protected function seedQuestionsForAssessment(Assessment $assessment): void
    {
        $title = $assessment->title;
        $questions = [];

        if (str_contains($title, 'CL:')) {
            $questions = [
                [
                    'text' => 'Under contract law, which of the following statements best describes an \'offer\'?',
                    'explanation' => 'An offer is an expression of willingness to contract on specified terms, made with the intention that it is to become binding once accepted.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'An invitation to treat', 'is_correct' => false],
                        ['text' => 'A definite promise to be bound on specific terms upon acceptance', 'is_correct' => true],
                        ['text' => 'A statement of intent without legal intention', 'is_correct' => false],
                        ['text' => 'A preliminary commercial inquiry', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'In company law, what is the primary legal consequence of the landmark case Salomon v Salomon & Co Ltd (1897)?',
                    'explanation' => 'Salomon established the doctrine of separate corporate personality, meaning a company exists as a distinct legal entity independent of its members.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'A company and its shareholders are legally indistinguishable', 'is_correct' => false],
                        ['text' => 'A registered company is an independent legal person distinct from its subscribers', 'is_correct' => true],
                        ['text' => 'Directors are strictly personally liable for ordinary trading debts', 'is_correct' => false],
                        ['text' => 'One-person limited companies are prohibited under common law', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Which of the following is an example of an \'invitation to treat\' rather than an offer?',
                    'explanation' => 'Pharmaceutical Society of Great Britain v Boots Cash Chemists established that goods displayed on shop shelves with price tags are invitations to treat.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Goods displayed on the shelf of a self-service store with prices attached', 'is_correct' => true],
                        ['text' => 'A written formal tender acceptance', 'is_correct' => false],
                        ['text' => 'An unambiguous unilateral reward advertisement for finding a lost item', 'is_correct' => false],
                        ['text' => 'A firm quotation with clear intention to be bound immediately', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'What is the primary objective of compensatory damages awarded for breach of contract?',
                    'explanation' => 'Under Robinson v Harman, damages aim to put the innocent party into the position they would have been in had the contract been performed properly.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'To penalize and punish the defaulting party for bad conduct', 'is_correct' => false],
                        ['text' => 'To put the innocent party in the financial position they would have been in had the contract been performed', 'is_correct' => true],
                        ['text' => 'To disgorge all revenues collected across the business', 'is_correct' => false],
                        ['text' => 'To cancel all past valid contracts between both parties', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Which form of consideration is generally NOT recognized as valid consideration under English contract law?',
                    'explanation' => 'Past consideration is no consideration (Roscorla v Thomas) because the act was performed before the promise was made.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Executory consideration', 'is_correct' => false],
                        ['text' => 'Executed consideration', 'is_correct' => false],
                        ['text' => 'Past consideration', 'is_correct' => true],
                        ['text' => 'Adequate economic consideration', 'is_correct' => false],
                    ],
                ],
            ];
        } elseif (str_contains($title, 'TX:')) {
            $questions = [
                [
                    'text' => 'Under standard income tax principles, which of the following is treated as taxable employment income?',
                    'explanation' => 'Employment income includes contractual salary, cash bonuses, and taxable benefits-in-kind such as private fuel or company cars.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Reimbursement of exact substantiated business travel expenses', 'is_correct' => false],
                        ['text' => 'Base salary, annual cash performance bonuses, and private vehicle perks', 'is_correct' => true],
                        ['text' => 'Exempt occupational pension scheme contributions made by the employer', 'is_correct' => false],
                        ['text' => 'Free staff cafeteria meals provided to all employees equally', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'When calculating corporation tax on trading profits, which expenditure is generally disallowable?',
                    'explanation' => 'Business and client entertainment expenditure is disallowable for corporate tax purposes.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Staff occupational training and certifications', 'is_correct' => false],
                        ['text' => 'Client entertaining and lavish hospitality costs', 'is_correct' => true],
                        ['text' => 'Statutory audit and annual filing compliance costs', 'is_correct' => false],
                        ['text' => 'Office electricity and broadband utilities', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'What is the standard VAT treatment of zero-rated supplies?',
                    'explanation' => 'Zero-rated supplies attract 0% output tax, but allow the registered trader to fully reclaim input tax suffered on related purchases.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Output VAT is 0%, and the business CAN reclaim related input VAT', 'is_correct' => true],
                        ['text' => 'Output VAT is 0%, and the business CANNOT reclaim related input VAT', 'is_correct' => false],
                        ['text' => 'The supply is treated outside the scope of VAT system entirely', 'is_correct' => false],
                        ['text' => 'Input VAT must be forfeited to the revenue authority', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'For Capital Gains Tax (CGT), how are net allowable capital losses in a tax year treated?',
                    'explanation' => 'Capital losses are first offset against chargeable gains of the same tax year, with remaining unused losses carried forward indefinitely.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Deducted directly from salary income in the current year', 'is_correct' => false],
                        ['text' => 'Set against chargeable gains of the same year and carried forward against future capital gains', 'is_correct' => true],
                        ['text' => 'Claimed as a cash refund immediately from the tax commissioner', 'is_correct' => false],
                        ['text' => 'Written off permanently if not utilized within 30 days', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Which tax concept prevents multinational corporations from transferring profits to low-tax jurisdictions using artificial pricing?',
                    'explanation' => 'Transfer pricing rules require transactions between connected parties to take place on an arm\'s length basis.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Capital allowances pooling', 'is_correct' => false],
                        ['text' => 'Arm\'s length transfer pricing regulations', 'is_correct' => true],
                        ['text' => 'Pay-As-You-Earn (PAYE) deductions', 'is_correct' => false],
                        ['text' => 'Turnover stamp duties', 'is_correct' => false],
                    ],
                ],
            ];
        } elseif (str_contains($title, 'FFA') || str_contains($title, 'FA2')) {
            $questions = [
                [
                    'text' => 'According to the core accounting equation, which formula must always balance?',
                    'explanation' => 'Assets = Liabilities + Equity is the foundational balance sheet equation.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Assets = Liabilities + Owner\'s Equity (Capital)', 'is_correct' => true],
                        ['text' => 'Assets + Liabilities = Capital', 'is_correct' => false],
                        ['text' => 'Liabilities = Assets + Capital', 'is_correct' => false],
                        ['text' => 'Capital = Current Assets - Profit', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'What is the double-entry posting to record the purchase of inventory on credit from a supplier?',
                    'explanation' => 'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Debit Accounts Payable, Credit Purchases', 'is_correct' => false],
                        ['text' => 'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)', 'is_correct' => true],
                        ['text' => 'Debit Cash, Credit Accounts Payable', 'is_correct' => false],
                        ['text' => 'Debit Sales, Credit Trade Receivables', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?',
                    'explanation' => 'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'An entire invoice transaction was completely omitted from daybooks', 'is_correct' => false],
                        ['text' => 'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely', 'is_correct' => true],
                        ['text' => 'A repair expense was debited to equipment asset account (error of principle)', 'is_correct' => false],
                        ['text' => 'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Under the accruals concept (matching principle), when must revenues and expenses be recognized?',
                    'explanation' => 'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Only when liquid cash is physically deposited into the bank', 'is_correct' => false],
                        ['text' => 'In the accounting period in which they are earned or incurred, regardless of cash timing', 'is_correct' => true],
                        ['text' => 'Only at year-end when certified by the tax board', 'is_correct' => false],
                        ['text' => 'Whenever approved by board of directors', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?',
                    'explanation' => 'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.',
                    'marks' => 20,
                    'options' => [
                        ['text' => '$56,000', 'is_correct' => true],
                        ['text' => '$64,000', 'is_correct' => false],
                        ['text' => '$72,000', 'is_correct' => false],
                        ['text' => '$48,000', 'is_correct' => false],
                    ],
                ],
            ];
        } else {
            // Default generic business & finance questions
            $questions = [
                [
                    'text' => 'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?',
                    'explanation' => 'Relevance and Faithful Representation are the two fundamental qualitative characteristics.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Comparability and Verifiability', 'is_correct' => false],
                        ['text' => 'Relevance and Faithful Representation', 'is_correct' => true],
                        ['text' => 'Prudence and Timeliness', 'is_correct' => false],
                        ['text' => 'Understandability and Materiality', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?',
                    'explanation' => 'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Simple payback period', 'is_correct' => false],
                        ['text' => 'Net Present Value (NPV)', 'is_correct' => true],
                        ['text' => 'Accounting Rate of Return (ARR)', 'is_correct' => false],
                        ['text' => 'Gross profit margin', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?',
                    'explanation' => 'General administration costs and staff training costs are expensed to profit or loss immediately.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'Site preparation and foundation costs', 'is_correct' => false],
                        ['text' => 'General administrative overheads and staff operating training costs', 'is_correct' => true],
                        ['text' => 'Import duties and non-refundable purchase taxes', 'is_correct' => false],
                        ['text' => 'Initial professional installation fees', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'What does an organization\'s Working Capital cycle (Operating Cycle) measure?',
                    'explanation' => 'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'The time between inventory purchase and cash realization from sales', 'is_correct' => true],
                        ['text' => 'The tenure of outstanding bank loans', 'is_correct' => false],
                        ['text' => 'The depreciation lifespan of non-current machinery', 'is_correct' => false],
                        ['text' => 'The time between annual shareholder meetings', 'is_correct' => false],
                    ],
                ],
                [
                    'text' => 'What is the Weighted Average Cost of Capital (WACC)?',
                    'explanation' => 'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.',
                    'marks' => 20,
                    'options' => [
                        ['text' => 'The coupon interest rate on bank mortgages only', 'is_correct' => false],
                        ['text' => 'The average return required by equity and debt providers weighted by market values', 'is_correct' => true],
                        ['text' => 'The inflation rate plus central bank benchmark rate', 'is_correct' => false],
                        ['text' => 'The dividend yield on preferred shares', 'is_correct' => false],
                    ],
                ],
            ];
        }

        foreach ($questions as $qIdx => $qData) {
            $question = AssessmentQuestion::firstOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'question_text' => $qData['text'],
                ],
                [
                    'uuid' => (string) Str::uuid(),
                    'question_type' => 'Multiple Choice',
                    'marks' => $qData['marks'] ?? 20.00,
                    'explanation' => $qData['explanation'] ?? '',
                    'difficulty' => 'Medium',
                    'order' => $qIdx + 1,
                ]
            );

            foreach ($qData['options'] as $optIdx => $optData) {
                AssessmentOption::firstOrCreate(
                    [
                        'question_id' => $question->id,
                        'option_text' => $optData['text'],
                    ],
                    [
                        'uuid' => (string) Str::uuid(),
                        'is_correct' => $optData['is_correct'],
                        'order' => $optIdx + 1,
                    ]
                );
            }
        }
    }
}
