<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            OrganizationSeeder::class,
            WorkflowStaffSeeder::class,
            CourseCurriculumSeeder::class,
            BatchAndEnrollmentSeeder::class,
            AssessmentAndGradingSeeder::class,
            CertificateSeeder::class,
            LearningPathSeeder::class,
            AccaTimetableAndEnrollmentSeeder::class,
        ]);
    }
}
