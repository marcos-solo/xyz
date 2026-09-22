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
                'title' => 'Enterprise Network Engineering & Infrastructure Track',
                'slug' => 'enterprise-network-engineering-infrastructure-track',
                'category_slug' => 'networking-infrastructure',
                'description' => 'Comprehensive pathway covering enterprise network architecture, Cisco routing and switching protocols, VLAN management, and secure perimeter infrastructure.',
                'duration' => 120,
                'duration_unit' => 'hours',
                'level' => 'Intermediate',
                'status' => 'active',
                'order' => 2,
                'course_codes' => ['CCNA-200-301'],
            ],
            [
                'title' => 'Cybersecurity Operations & Threat Defense Track',
                'slug' => 'cybersecurity-operations-threat-defense-track',
                'category_slug' => 'cybersecurity-defense',
                'description' => 'End-to-end security operations track covering network vulnerability analysis, cryptographic safeguards, penetration testing, and defensive incident response.',
                'duration' => 80,
                'duration_unit' => 'hours',
                'level' => 'Beginner',
                'status' => 'active',
                'order' => 3,
                'course_codes' => ['CYBER-101'],
            ],
            [
                'title' => 'Business Intelligence & Data Analytics Track',
                'slug' => 'business-intelligence-data-analytics-track',
                'category_slug' => 'data-analytics-ai',
                'description' => 'Practical pathway for data analysts and business decision-makers using Power BI, DAX modeling, automated ETL pipelines, and executive dashboards.',
                'duration' => 60,
                'duration_unit' => 'hours',
                'level' => 'Intermediate',
                'status' => 'active',
                'order' => 4,
                'course_codes' => ['BI-300'],
            ],
        ];

        foreach ($pathsData as $p) {
            $category = CourseCategory::where('slug', $p['category_slug'])->first();

            $path = LearningPath::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'organization_id' => $org->id,
                    'category_id' => $category?->id,
                    'title' => $p['title'],
                    'description' => $p['description'],
                    'duration' => $p['duration'],
                    'duration_unit' => $p['duration_unit'],
                    'level' => $p['level'],
                    'status' => $p['status'],
                    'order' => $p['order'],
                ]
            );

            // Link courses to this learning path
            foreach ($p['course_codes'] as $courseCode) {
                Course::where('code', $courseCode)->update([
                    'learning_path_id' => $path->id,
                ]);
            }
        }
    }
}
