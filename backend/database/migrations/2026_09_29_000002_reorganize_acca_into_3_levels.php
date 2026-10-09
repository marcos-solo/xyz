<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $course = DB::table('courses')->where('code', 'ACCA')->first();
            if (! $course) {
                return;
            }

            $now = now();

            // 1. Update Course definition with 3 Levels and requirements from acca_level.jpeg
            DB::table('courses')->where('id', $course->id)->update([
                'name' => 'ACCA — Association of Chartered Certified Accountants',
                'program_level' => 'Foundation Level, Fundamental Level, Strategic Professional Level',
                'entry_requirements' => 'Foundation Level: Entry Level Accounting. No prior qualifications required (7 Papers). Fundamental Level: Applied Knowledge & Applied Skills Modules: KCSE Mean Grade C+ with a C in both English & Mathematics (9 Papers). Strategic Professional Level: Requires the successful completion of Applied Skills Modules (4 Papers: 2 Essentials + 2 Options).',
                'description' => "The ACCA qualification is structured into 3 distinct levels:\n1. Foundation Level (7 Papers) — Entry level accounting with no prior qualifications required.\n2. Fundamental Level (9 Papers) — Comprising Applied Knowledge Module (3 Papers) and Applied Skills Module (6 Papers).\n3. Strategic Professional Level (4 Papers) — Comprising Essentials (2 Papers) and Options (Choose 2 of 4).",
                'paper_count' => 22,
                'duration' => 48,
                'duration_unit' => 'weeks',
                'level' => 'Professional',
                'status' => 'active',
                'updated_at' => $now,
            ]);

            // Track old unit and module IDs to clean up later
            $oldUnitIds = DB::table('course_units')->where('course_id', $course->id)->pluck('id')->all();
            $oldModuleIds = DB::table('course_modules')->where('course_id', $course->id)->pluck('id')->all();

            // 2. Create the 3 Official Units (Levels) exactly per acca_level.jpeg
            // Unit 1: Foundation Level
            $unit1Id = DB::table('course_units')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'title' => 'Foundation Level',
                'description' => 'Entry Level Accounting. No prior qualifications required (7 Papers).',
                'order' => 1,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Unit 2: Fundamental Level (has 2 modules: Applied Knowledge & Applied Skills)
            $unit2Id = DB::table('course_units')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'title' => 'Fundamental Level',
                'description' => 'Applied Knowledge & Applied Skills Modules: KCSE Mean Grade C+ with a C in both English & Mathematics (9 Papers).',
                'order' => 2,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Unit 3: Strategic Professional Level (has 2 modules: Essentials & Options)
            $unit3Id = DB::table('course_units')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'title' => 'Strategic Professional Level',
                'description' => 'Requires the successful completion of Applied Skills Modules (4 Papers: 2 Essentials + 2 Options).',
                'order' => 3,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 3. Create Modules under the 3 Units
            // Module 1 under Unit 1 (Foundation Level)
            $modFoundationId = DB::table('course_modules')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'unit_id' => $unit1Id,
                'title' => 'Foundation Module',
                'description' => 'Seven foundational accountancy papers developing essential bookkeeping, management information, and business accounting skills (7 Papers).',
                'order' => 1,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Module 1 under Unit 2 (Fundamental Level -> a. Applied Knowledge Module)
            $modAppliedKnowledgeId = DB::table('course_modules')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'unit_id' => $unit2Id,
                'title' => 'Applied Knowledge Module',
                'description' => 'Three core papers covering business organisations, management accounting fundamentals, and financial reporting principles (3 Papers).',
                'order' => 1,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Module 2 under Unit 2 (Fundamental Level -> b. Applied Skills Module)
            $modAppliedSkillsId = DB::table('course_modules')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'unit_id' => $unit2Id,
                'title' => 'Applied Skills Module',
                'description' => 'Six comprehensive technical papers across law, performance, tax, reporting, audit, and financial management (6 Papers).',
                'order' => 2,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Module 1 under Unit 3 (Strategic Professional Level -> Essentials)
            $modEssentialsId = DB::table('course_modules')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'unit_id' => $unit3Id,
                'title' => 'Essentials',
                'description' => 'Mandatory strategic leadership and complex corporate reporting papers (2 Papers).',
                'order' => 1,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Module 2 under Unit 3 (Strategic Professional Level -> Options: Choose 2)
            $modOptionsId = DB::table('course_modules')->insertGetId([
                'uuid' => (string) Str::uuid(),
                'course_id' => $course->id,
                'unit_id' => $unit3Id,
                'title' => 'Options: Choose 2',
                'description' => 'Advanced specialisation options allowing students to focus on advanced finance, performance, taxation, or audit (Choose 2 of 4).',
                'order' => 2,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 4. Map and Re-point all 22 ACCA Lessons to their exact new Modules
            $papers = [
                // 1) Foundation Level: 7 Papers
                ['code' => 'FA1', 'title' => 'FA1: Recording Financial Transactions', 'mod_id' => $modFoundationId, 'order' => 1, 'file' => 'storage/syllabuses/acca-fa1-recording-financial-transactions-syllabus.pdf', 'size' => 227370],
                ['code' => 'MA1', 'title' => 'MA1: Management Information', 'mod_id' => $modFoundationId, 'order' => 2, 'file' => 'storage/syllabuses/acca-ma1-management-information-syllabus.pdf', 'size' => 203982],
                ['code' => 'FA2', 'title' => 'FA2: Maintaining Financial Records', 'mod_id' => $modFoundationId, 'order' => 3, 'file' => 'storage/syllabuses/acca-fa2-maintaining-financial-records-syllabus.pdf', 'size' => 262256],
                ['code' => 'MA2', 'title' => 'MA2: Managing Costs and Finance', 'mod_id' => $modFoundationId, 'order' => 4, 'file' => 'storage/syllabuses/acca-ma2-managing-costs-finance-syllabus.pdf', 'size' => 242560],
                ['code' => 'FBT', 'title' => 'FBT: Business & Technology', 'mod_id' => $modFoundationId, 'order' => 5, 'file' => 'storage/syllabuses/acca-fbt-business-technology-syllabus.pdf', 'size' => 1698042],
                ['code' => 'FMA', 'title' => 'FMA: Management Accounting', 'mod_id' => $modFoundationId, 'order' => 6, 'file' => 'storage/syllabuses/acca-fma-management-accounting-syllabus.pdf', 'size' => 261270],
                ['code' => 'FFA', 'title' => 'FFA: Financial Accounting', 'mod_id' => $modFoundationId, 'order' => 7, 'file' => 'storage/syllabuses/acca-ffa-financial-accounting-syllabus.pdf', 'size' => 325802],

                // 2) Fundamental Level: 9 Papers
                // a) Applied Knowledge Module (3 Papers)
                ['code' => 'BT', 'title' => 'BT: Business & Technology', 'mod_id' => $modAppliedKnowledgeId, 'order' => 1, 'file' => 'storage/syllabuses/acca-bt-business-technology-syllabus.pdf', 'size' => 349781],
                ['code' => 'MA', 'title' => 'MA: Management Accounting', 'mod_id' => $modAppliedKnowledgeId, 'order' => 2, 'file' => 'storage/syllabuses/acca-ma-management-accounting-syllabus.pdf', 'size' => 261270],
                ['code' => 'FA', 'title' => 'FA: Financial Accounting', 'mod_id' => $modAppliedKnowledgeId, 'order' => 3, 'file' => 'storage/syllabuses/acca-fa-financial-accounting-syllabus.pdf', 'size' => 325802],

                // b) Applied Skills Module (6 Papers)
                ['code' => 'CL', 'title' => 'CL: Corporate and Business Law', 'mod_id' => $modAppliedSkillsId, 'order' => 1, 'file' => 'storage/syllabuses/acca-cl-corporate-business-law-syllabus.pdf', 'size' => 458320],
                ['code' => 'PM', 'title' => 'PM: Performance Management', 'mod_id' => $modAppliedSkillsId, 'order' => 2, 'file' => 'storage/syllabuses/acca-pm-performance-management-syllabus.pdf', 'size' => 859410],
                ['code' => 'TX', 'title' => 'TX: Taxation', 'mod_id' => $modAppliedSkillsId, 'order' => 3, 'file' => 'storage/syllabuses/acca-tx-taxation-uk-syllabus.pdf', 'size' => 778090],
                ['code' => 'FR', 'title' => 'FR: Financial Reporting', 'mod_id' => $modAppliedSkillsId, 'order' => 4, 'file' => 'storage/syllabuses/acca-fr-financial-reporting-syllabus.pdf', 'size' => 761156],
                ['code' => 'AA', 'title' => 'AA: Audit & Assurance', 'mod_id' => $modAppliedSkillsId, 'order' => 5, 'file' => 'storage/syllabuses/acca-aa-audit-assurance-syllabus.pdf', 'size' => 572951],
                ['code' => 'FM', 'title' => 'FM: Financial Management', 'mod_id' => $modAppliedSkillsId, 'order' => 6, 'file' => 'storage/syllabuses/acca-fm-financial-management-syllabus.pdf', 'size' => 517913],

                // 3) Strategic Professional Level: 2 Papers + 2 Options
                // Essentials (2 Papers)
                ['code' => 'SBR', 'title' => 'SBR: Strategic Business Reporting', 'mod_id' => $modEssentialsId, 'order' => 1, 'file' => 'storage/syllabuses/acca-sbr-strategic-business-reporting-syllabus.pdf', 'size' => 687687],
                ['code' => 'SBL', 'title' => 'SBL: Strategic Business Leader', 'mod_id' => $modEssentialsId, 'order' => 2, 'file' => 'storage/syllabuses/acca-sbl-strategic-business-leader-syllabus.pdf', 'size' => 734445],

                // Options: Choose 2 (4 Papers)
                ['code' => 'AFM', 'title' => 'AFM: Advanced Financial Management', 'mod_id' => $modOptionsId, 'order' => 1, 'file' => 'storage/syllabuses/acca-afm-advanced-financial-management-syllabus.pdf', 'size' => 568640],
                ['code' => 'APM', 'title' => 'APM: Advanced Performance Management', 'mod_id' => $modOptionsId, 'order' => 2, 'file' => 'storage/syllabuses/acca-apm-advanced-performance-management-syllabus.pdf', 'size' => 564290],
                ['code' => 'ATX', 'title' => 'ATX: Advanced Taxation', 'mod_id' => $modOptionsId, 'order' => 3, 'file' => 'storage/syllabuses/acca-atx-advanced-taxation-syllabus.pdf', 'size' => 1014464],
                ['code' => 'AAA', 'title' => 'AAA: Advanced Audit & Assurance', 'mod_id' => $modOptionsId, 'order' => 4, 'file' => 'storage/syllabuses/acca-aaa-advanced-audit-assurance-syllabus.pdf', 'size' => 536150],
            ];

            // Re-point or insert each lesson
            foreach ($papers as $p) {
                // Find existing lesson matching code
                $existing = DB::table('lessons')
                    ->where(function ($q) use ($p) {
                        $code = $p['code'];
                        $q->where('title', 'like', $code.' —%')
                            ->orWhere('title', 'like', $code.':%')
                            ->orWhere('title', 'like', $code.' %');
                        if ($code === 'BT') {
                            $q->orWhere('title', 'like', 'AB/BT%');
                        }
                        if ($code === 'CL') {
                            $q->orWhere('title', 'like', 'CL/LW%');
                        }
                    })
                    ->first();

                if ($existing) {
                    DB::table('lessons')->where('id', $existing->id)->update([
                        'module_id' => $p['mod_id'],
                        'title' => $p['title'],
                        'description' => "Official ACCA Syllabus and Study Guide for {$p['title']}. Covers exam format, capabilities, intellectual levels, and revision guidelines.",
                        'content_type' => 'pdf',
                        'file_path' => $p['file'],
                        'order' => $p['order'],
                        'updated_at' => $now,
                    ]);
                    $lessonId = $existing->id;
                } else {
                    $lessonId = DB::table('lessons')->insertGetId([
                        'uuid' => (string) Str::uuid(),
                        'module_id' => $p['mod_id'],
                        'title' => $p['title'],
                        'description' => "Official ACCA Syllabus and Study Guide for {$p['title']}. Covers exam format, capabilities, intellectual levels, and revision guidelines.",
                        'content_type' => 'pdf',
                        'file_path' => $p['file'],
                        'duration' => 180,
                        'order' => $p['order'],
                        'status' => 'active',
                        'is_preview' => false,
                        'content' => "## {$p['title']}\n\nOfficial ACCA CBE study guide and curriculum paper.",
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                // Ensure syllabus resource
                $resTitle = "{$p['title']} Official Syllabus & Study Guide";
                $hasRes = DB::table('lesson_resources')
                    ->where('lesson_id', $lessonId)
                    ->where('file_path', $p['file'])
                    ->exists();

                if (! $hasRes) {
                    DB::table('lesson_resources')->insert([
                        'uuid' => (string) Str::uuid(),
                        'lesson_id' => $lessonId,
                        'title' => $resTitle,
                        'file_path' => $p['file'],
                        'file_type' => 'application/pdf',
                        'file_size' => $p['size'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // 5. Delete old modules and units that are no longer in use
            DB::table('course_modules')->whereIn('id', $oldModuleIds)->delete();
            DB::table('course_units')->whereIn('id', $oldUnitIds)->delete();
        });
    }

    public function down(): void {}
};
