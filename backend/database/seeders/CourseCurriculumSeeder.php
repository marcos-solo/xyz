<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CourseUnit;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseCurriculumSeeder extends Seeder
{
    private function buildAccaLessonContent(string $paper): string
    {
        return "## {$paper}\n\n".
            "### Learning outcomes\n".
            "- Explain the core professional concepts and statutory framework behind this paper.\n".
            "- Apply accounting, audit, management, or tax principles to real-world corporate case scenarios.\n".
            "- Structure clear, exam-standard CBE responses adhering to ACCA marking rubrics.\n\n".
            "### Official ACCA Syllabus Reference\n".
            "This unit is mapped directly to the official ACCA Syllabus and Study Guide provided in the attached PDF resource. Always review the detailed syllabus section for capabilities, intellectual levels, and exam structure.\n\n".
            "### Recommended Study Approach\n".
            "1. Read the syllabus guidance and identify core examinable areas.\n".
            "2. Study worked examples and technical articles from ACCA Global.\n".
            "3. Practice past CBE questions and mock exams under timed conditions.\n".
            "4. Review revision notes, formulas, and reporting standards.\n";
    }

    public function run(): void
    {
        $org = Organization::first();
        $trainer = User::role('Trainer')->first();

        // 1. Only ACCA Category
        $catAcca = CourseCategory::firstOrCreate(
            ['slug' => 'acca', 'organization_id' => $org->id],
            [
                'name' => 'ACCA',
                'description' => 'ACCA Foundation (FIA), Applied Knowledge, Applied Skills, and Strategic Professional pathways',
                'status' => 'active',
            ]
        );

        // 2. ACCA Master Qualification Course
        $courseAcca = Course::firstOrCreate(
            ['organization_id' => $org->id, 'code' => 'ACCA'],
            [
                'category_id' => $catAcca->id,
                'name' => 'ACCA — Association of Chartered Certified Accountants',
                'short_description' => 'Comprehensive ACCA qualification covering Foundation Level, Fundamental Level (Applied Knowledge & Applied Skills), and Strategic Professional Level with official CBE study syllabuses.',
                'description' => "The ACCA qualification is structured into 3 distinct levels:\n1. Foundation Level (7 Papers) — Entry level accounting with no prior qualifications required.\n2. Fundamental Level (9 Papers) — Comprising Applied Knowledge Module (3 Papers) and Applied Skills Module (6 Papers).\n3. Strategic Professional Level (4 Papers) — Comprising Essentials (2 Papers) and Options (Choose 2 of 4).",
                'program_level' => 'Foundation Level, Fundamental Level, Strategic Professional Level',
                'entry_requirements' => 'Foundation Level: Entry Level Accounting. No prior qualifications required (7 Papers). Fundamental Level: Applied Knowledge & Applied Skills Modules: KCSE Mean Grade C+ with a C in both English & Mathematics (9 Papers). Strategic Professional Level: Requires the successful completion of Applied Skills Modules (4 Papers: 2 Essentials + 2 Options).',
                'paper_count' => 22,
                'duration' => 48,
                'duration_unit' => 'weeks',
                'level' => 'Professional',
                'status' => 'active',
                'created_by' => $trainer?->id,
            ]
        );

        $courseAcca->update([
            'program_level' => 'Foundation Level, Fundamental Level, Strategic Professional Level',
            'entry_requirements' => 'Foundation Level: Entry Level Accounting. No prior qualifications required (7 Papers). Fundamental Level: Applied Knowledge & Applied Skills Modules: KCSE Mean Grade C+ with a C in both English & Mathematics (9 Papers). Strategic Professional Level: Requires the successful completion of Applied Skills Modules (4 Papers: 2 Essentials + 2 Options).',
            'description' => "The ACCA qualification is structured into 3 distinct levels:\n1. Foundation Level (7 Papers) — Entry level accounting with no prior qualifications required.\n2. Fundamental Level (9 Papers) — Comprising Applied Knowledge Module (3 Papers) and Applied Skills Module (6 Papers).\n3. Strategic Professional Level (4 Papers) — Comprising Essentials (2 Papers) and Options (Choose 2 of 4).",
        ]);

        if ($courseAcca->units()->exists()) {
            $this->command?->info('ACCA course curriculum already has units populated; skipping fresh creation.');

            return;
        }

        $syllabusFiles = [
            'FA1' => ['file' => 'storage/syllabuses/acca-fa1-recording-financial-transactions-syllabus.pdf', 'size' => 227370],
            'MA1' => ['file' => 'storage/syllabuses/acca-ma1-management-information-syllabus.pdf', 'size' => 203982],
            'FA2' => ['file' => 'storage/syllabuses/acca-fa2-maintaining-financial-records-syllabus.pdf', 'size' => 262256],
            'MA2' => ['file' => 'storage/syllabuses/acca-ma2-managing-costs-finance-syllabus.pdf', 'size' => 242560],
            'FBT' => ['file' => 'storage/syllabuses/acca-fbt-business-technology-syllabus.pdf', 'size' => 1698042],
            'FMA' => ['file' => 'storage/syllabuses/acca-fma-management-accounting-syllabus.pdf', 'size' => 261270],
            'FFA' => ['file' => 'storage/syllabuses/acca-ffa-financial-accounting-syllabus.pdf', 'size' => 325802],
            'BT' => ['file' => 'storage/syllabuses/acca-bt-business-technology-syllabus.pdf', 'size' => 349781],
            'MA' => ['file' => 'storage/syllabuses/acca-ma-management-accounting-syllabus.pdf', 'size' => 261270],
            'FA' => ['file' => 'storage/syllabuses/acca-fa-financial-accounting-syllabus.pdf', 'size' => 325802],
            'CL' => ['file' => 'storage/syllabuses/acca-cl-corporate-business-law-syllabus.pdf', 'size' => 458320],
            'PM' => ['file' => 'storage/syllabuses/acca-pm-performance-management-syllabus.pdf', 'size' => 859410],
            'TX' => ['file' => 'storage/syllabuses/acca-tx-taxation-uk-syllabus.pdf', 'size' => 778090],
            'FR' => ['file' => 'storage/syllabuses/acca-fr-financial-reporting-syllabus.pdf', 'size' => 761156],
            'AA' => ['file' => 'storage/syllabuses/acca-aa-audit-assurance-syllabus.pdf', 'size' => 572951],
            'FM' => ['file' => 'storage/syllabuses/acca-fm-financial-management-syllabus.pdf', 'size' => 517913],
            'SBR' => ['file' => 'storage/syllabuses/acca-sbr-strategic-business-reporting-syllabus.pdf', 'size' => 687687],
            'SBL' => ['file' => 'storage/syllabuses/acca-sbl-strategic-business-leader-syllabus.pdf', 'size' => 734445],
            'AFM' => ['file' => 'storage/syllabuses/acca-afm-advanced-financial-management-syllabus.pdf', 'size' => 568640],
            'APM' => ['file' => 'storage/syllabuses/acca-apm-advanced-performance-management-syllabus.pdf', 'size' => 564290],
            'ATX' => ['file' => 'storage/syllabuses/acca-atx-advanced-taxation-syllabus.pdf', 'size' => 1014464],
            'AAA' => ['file' => 'storage/syllabuses/acca-aaa-advanced-audit-assurance-syllabus.pdf', 'size' => 536150],
        ];

        $accaUnits = [
            [
                'title' => 'Foundation Level',
                'description' => 'Entry Level Accounting. No prior qualifications required (7 Papers).',
                'modules' => [
                    [
                        'title' => 'Foundation Module',
                        'description' => 'Seven foundational accountancy papers developing essential bookkeeping, management information, and business accounting skills (7 Papers).',
                        'papers' => [
                            'FA1 — Recording Financial Transactions',
                            'MA1 — Management Information',
                            'FA2 — Maintaining Financial Records',
                            'MA2 — Managing Costs and Finance',
                            'FBT — Business & Technology',
                            'FMA — Management Accounting',
                            'FFA — Financial Accounting',
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Fundamental Level',
                'description' => 'Applied Knowledge & Applied Skills Modules: KCSE Mean Grade C+ with a C in both English & Mathematics (9 Papers).',
                'modules' => [
                    [
                        'title' => 'Applied Knowledge Module',
                        'description' => 'Three core papers covering business organisations, management accounting fundamentals, and financial reporting principles (3 Papers).',
                        'papers' => [
                            'BT — Business & Technology',
                            'MA — Management Accounting',
                            'FA — Financial Accounting',
                        ],
                    ],
                    [
                        'title' => 'Applied Skills Module',
                        'description' => 'Six core papers covering corporate law, performance management, taxation, financial reporting, audit and assurance, and financial management (6 Papers).',
                        'papers' => [
                            'CL — Corporate and Business Law',
                            'PM — Performance Management',
                            'TX — Taxation',
                            'FR — Financial Reporting',
                            'AA — Audit & Assurance',
                            'FM — Financial Management',
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Strategic Professional Level',
                'description' => 'Requires the successful completion of Applied Skills Modules (4 Papers: 2 Essentials + 2 Options).',
                'modules' => [
                    [
                        'title' => 'Essentials',
                        'description' => 'Two mandatory strategic leadership and reporting papers.',
                        'papers' => [
                            'SBR — Strategic Business Reporting',
                            'SBL — Strategic Business Leader',
                        ],
                    ],
                    [
                        'title' => 'Options (Choose 2)',
                        'description' => 'Specialization options — students choose 2 papers from Advanced Financial Management, Advanced Performance Management, Advanced Taxation, and Advanced Audit & Assurance.',
                        'papers' => [
                            'AFM — Advanced Financial Management',
                            'APM — Advanced Performance Management',
                            'ATX — Advanced Taxation',
                            'AAA — Advanced Audit & Assurance',
                        ],
                    ],
                ],
            ],
        ];

        foreach ($accaUnits as $unitIndex => $unitData) {
            $unit = CourseUnit::create([
                'course_id' => $courseAcca->id,
                'title' => $unitData['title'],
                'description' => $unitData['description'],
                'order' => $unitIndex + 1,
                'status' => 'active',
            ]);

            foreach ($unitData['modules'] as $moduleIndex => $moduleData) {
                $module = CourseModule::create([
                    'course_id' => $courseAcca->id,
                    'unit_id' => $unit->id,
                    'title' => $moduleData['title'],
                    'order' => $moduleIndex + 1,
                    'status' => 'active',
                ]);

                foreach ($moduleData['papers'] as $paperIndex => $paper) {
                    $matched = null;
                    foreach ($syllabusFiles as $code => $config) {
                        if (str_starts_with($paper, $code.' ') ||
                            str_starts_with($paper, $code.'—') ||
                            str_starts_with($paper, $code.' —')) {
                            $matched = $config;
                            break;
                        }
                    }

                    $filePath = $matched['file'] ?? null;
                    $lesson = Lesson::create([
                        'module_id' => $module->id,
                        'title' => $paper,
                        'description' => "Official ACCA Syllabus and Study Guide for {$paper}. Covers exam format, syllabus areas, learning outcomes, and CBE guidelines.",
                        'content_type' => 'pdf',
                        'content' => $this->buildAccaLessonContent($paper),
                        'file_path' => $filePath,
                        'duration' => 180,
                        'order' => $paperIndex + 1,
                        'is_preview' => $paperIndex === 0 && $moduleIndex === 0,
                    ]);

                    if ($matched) {
                        LessonResource::create([
                            'uuid' => (string) Str::uuid(),
                            'lesson_id' => $lesson->id,
                            'title' => "{$paper} Official Syllabus & Study Guide",
                            'file_path' => $matched['file'],
                            'file_type' => 'application/pdf',
                            'file_size' => $matched['size'],
                        ]);
                    }

                    if (str_contains($paper, 'SBL')) {
                        LessonResource::create([
                            'uuid' => (string) Str::uuid(),
                            'lesson_id' => $lesson->id,
                            'title' => 'How Applied Knowledge and Applied Skills map to SBL Guide',
                            'file_path' => 'storage/syllabuses/acca-sbl-mapping-guide.pdf',
                            'file_type' => 'application/pdf',
                            'file_size' => 270027,
                        ]);
                    }
                }
            }
        }
    }
}
