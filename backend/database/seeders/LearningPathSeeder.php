<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\LearningPath;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        if (! $org) {
            return;
        }

        $pathsData = [
            [
                'title' => 'Chartered Accounting & Financial Strategy Track',
                'slug' => 'chartered-accounting-financial-strategy-track',
                'category_slug' => 'acca',
                'description' => 'Master the complete ACCA qualification pipeline from financial accounting fundamentals to strategic business reporting, taxation, and advanced audit.',
                'duration' => 360,
                'duration_unit' => 'hours',
                'level' => 'Professional',
                'status' => 'active',
                'order' => 1,
                'course_codes' => ['ACCA'],
            ],
            [
                'title' => 'Foundation in Accountancy (FIA) Fast-Track',
                'slug' => 'foundation-in-accountancy-fia-track',
                'category_slug' => 'acca',
                'description' => 'Entry-level pathway covering RQF Level 2 to 4 papers (FA1, MA1, FA2, MA2, FBT, FMA, FFA), ideal for school leavers and aspiring accountants.',
                'duration' => 120,
                'duration_unit' => 'hours',
                'level' => 'Beginner',
                'status' => 'active',
                'order' => 2,
                'course_codes' => ['ACCA'],
            ],
            [
                'title' => 'ACCA Applied Skills & CBE Preparation Track',
                'slug' => 'acca-applied-skills-cbe-track',
                'category_slug' => 'acca',
                'description' => 'Advanced technical practice covering Corporate Law, Performance Management, Taxation, Financial Reporting, Audit & Assurance, and Financial Management.',
                'duration' => 180,
                'duration_unit' => 'hours',
                'level' => 'Intermediate',
                'status' => 'active',
                'order' => 3,
                'course_codes' => ['ACCA'],
            ],
        ];

        foreach ($pathsData as $pData) {
            $cat = CourseCategory::where('slug', $pData['category_slug'])->first();
            if (! $cat) {
                continue;
            }

            $learningPath = LearningPath::updateOrCreate(
                ['slug' => $pData['slug'], 'organization_id' => $org->id],
                [
                    'category_id' => $cat->id,
                    'title' => $pData['title'],
                    'description' => $pData['description'],
                    'duration' => $pData['duration'],
                    'duration_unit' => $pData['duration_unit'],
                    'level' => $pData['level'],
                    'status' => $pData['status'],
                    'order' => $pData['order'],
                ]
            );

            // Associate ACCA course
            $courses = Course::whereIn('code', $pData['course_codes'])->get();
            foreach ($courses as $c) {
                $c->update(['learning_path_id' => $learningPath->id]);
            }
        }
    }
}
