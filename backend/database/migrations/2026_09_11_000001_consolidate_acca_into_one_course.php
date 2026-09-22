<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $category = DB::table('course_categories')->where('slug', 'acca')->first();

            if (! $category) {
                return;
            }

            $accaCourses = DB::table('courses')
                ->where('category_id', $category->id)
                ->whereNull('deleted_at')
                ->orderBy('id')
                ->get();

            if ($accaCourses->isEmpty()) {
                return;
            }

            $master = $accaCourses->firstWhere('code', 'ACCA') ?? $accaCourses->first();
            $accaCourseIds = $accaCourses->pluck('id')->all();
            $now = now();

            DB::table('courses')->where('id', $master->id)->update([
                'code' => 'ACCA',
                'name' => 'ACCA',
                'short_description' => 'ACCA Foundation, Applied Knowledge, Applied Skills, and Strategic Professional pathways.',
                'description' => 'A single ACCA programme containing every level, paper, and intake.',
                'program_level' => 'Foundation / FIA, Applied Knowledge, Applied Skills, Strategic Professional',
                'paper_count' => 19,
                'level' => 'Professional',
                'status' => 'active',
                'updated_at' => $now,
            ]);

            DB::table('course_batches')->whereIn('course_id', $accaCourseIds)->update(['course_id' => $master->id]);
            DB::table('course_progress')->whereIn('course_id', $accaCourseIds)->update(['course_id' => $master->id]);
            DB::table('certificates')->whereIn('course_id', $accaCourseIds)->update(['course_id' => $master->id]);

            DB::table('courses')
                ->whereIn('id', array_diff($accaCourseIds, [$master->id]))
                ->update([
                    'status' => 'archived',
                    'deleted_at' => $now,
                    'updated_at' => $now,
                ]);

            $unitDefinitions = [
                [
                    'title' => 'Foundation / FIA',
                    'description' => 'Foundation in Accountancy pathways.',
                    'modules' => [
                        ['title' => 'RQF Level 2', 'papers' => ['FA1 — Recording Financial Transactions', 'MA1 — Management Information']],
                        ['title' => 'RQF Level 3', 'papers' => ['FA2 — Maintaining Financial Records', 'MA2 — Managing Costs and Finance']],
                        ['title' => 'RQF Level 4', 'papers' => ['FBT — Business & Technology', 'FMA — Management Accounting', 'FFA — Financial Accounting']],
                    ],
                ],
                [
                    'title' => 'Applied Knowledge',
                    'description' => 'The three applied knowledge papers.',
                    'modules' => [
                        ['title' => 'Applied Knowledge Papers', 'papers' => ['AB/BT — Business & Technology', 'MA — Management Accounting', 'FA — Financial Accounting']],
                    ],
                ],
                [
                    'title' => 'Applied Skills',
                    'description' => 'The six applied skills papers.',
                    'modules' => [
                        ['title' => 'Applied Skills Papers', 'papers' => ['CL/LW — Corporate and Business Law', 'PM — Performance Management', 'TX — Taxation', 'FR — Financial Reporting', 'AA — Audit & Assurance', 'FM — Financial Management']],
                    ],
                ],
                [
                    'title' => 'Strategic Professional',
                    'description' => 'Essentials are mandatory. Choose two papers from Options.',
                    'modules' => [
                        ['title' => 'Essentials', 'papers' => ['SBR — Strategic Business Reporting', 'SBL — Strategic Business Leader']],
                        ['title' => 'Options — Choose 2', 'papers' => ['AFM — Advanced Financial Management', 'APM — Advanced Performance Management', 'ATX — Advanced Taxation', 'AAA — Advanced Audit & Assurance']],
                    ],
                ],
            ];

            foreach ($unitDefinitions as $unitOrder => $unitDefinition) {
                $unitId = DB::table('course_units')->insertGetId([
                    'uuid' => (string) Str::uuid(),
                    'course_id' => $master->id,
                    'title' => $unitDefinition['title'],
                    'description' => $unitDefinition['description'],
                    'order' => $unitOrder + 1,
                    'status' => 'active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                foreach ($unitDefinition['modules'] as $moduleOrder => $moduleDefinition) {
                    $moduleId = DB::table('course_modules')->insertGetId([
                        'uuid' => (string) Str::uuid(),
                        'course_id' => $master->id,
                        'unit_id' => $unitId,
                        'title' => $moduleDefinition['title'],
                        'description' => null,
                        'order' => $moduleOrder + 1,
                        'status' => 'active',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    foreach ($moduleDefinition['papers'] as $paperOrder => $paper) {
                        $lessonContent = "## {$paper}\n\n### Learning outcomes\n- explain the core concept behind this paper\n- apply the method in a real business scenario\n- summarise the key revision points in your own words\n\n### Study notes\nThis ACCA paper should be treated as a practical business skill. Focus on the underlying principle, connect it to the relevant exam context, and keep a short revision sheet of formulas, definitions, and common pitfalls.\n\n### Recommended approach\n1. Learn the concept and the objective.\n2. Review one worked example.\n3. Practise one exam-style question and summarise the answer in your own words.\n\n### Final reminder\nStrong ACCA preparation combines theory, application, and consistent revision.\n";

                        DB::table('lessons')->insert([
                            'uuid' => (string) Str::uuid(),
                            'module_id' => $moduleId,
                            'title' => $paper,
                            'description' => 'ACCA paper syllabus and study content.',
                            'content_type' => 'text',
                            'content' => $lessonContent,
                            'duration' => 180,
                            'order' => $paperOrder + 1,
                            'is_preview' => false,
                            'status' => 'active',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }
            }
        });
    }

    public function down(): void
    {
        // The consolidation is intentionally irreversible because batches and progress are repointed to the master course.
    }
};
