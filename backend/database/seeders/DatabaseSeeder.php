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
            CourseCurriculumSeeder::class,
            BatchAndEnrollmentSeeder::class,
            AssessmentAndGradingSeeder::class,
            CertificateSeeder::class,
        ]);
    }
}
