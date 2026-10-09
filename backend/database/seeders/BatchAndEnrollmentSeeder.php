<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class BatchAndEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        $branchNrb = Branch::where('code', 'NRB')->first();
        $courseAcca = Course::where('code', 'ACCA')->first();

        if (! $courseAcca || ! $branchNrb) {
            return;
        }

        $trainerNrb = User::where('email', 'trainer.nairobi@iatlms.test')->first();
        $asstTrainerNrb = User::where('email', 'asst.trainer@iatlms.test')->first();

        $studentJohn = User::where('email', 'student.john@iatlms.test')->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();
        $studentAlex = User::where('email', 'student.alex@iatlms.test')->first();
        $studentBrian = User::where('email', 'student.brian@iatlms.test')->first();
        $studentDiana = User::where('email', 'student.diana@iatlms.test')->first();

        // ACCA Cohorts
        $accaBatches = [
            ['ACCA FIA September 2026 Cohort', 'ACCA-FIA-2026-SEP-NRB', '2026-09-14', '2027-03-05', 30, 'ongoing'],
            ['ACCA Applied Knowledge September 2026 Cohort', 'ACCA-AK-2026-SEP-NRB', '2026-09-14', '2027-01-29', 30, 'ongoing'],
            ['ACCA Applied Skills September 2026 Cohort', 'ACCA-AS-2026-SEP-NRB', '2026-09-14', '2027-04-02', 30, 'ongoing'],
            ['ACCA Strategic Professional September 2026 Cohort', 'ACCA-SP-2026-SEP-NRB', '2026-09-14', '2027-02-05', 25, 'upcoming'],
        ];

        $createdBatches = [];
        foreach ($accaBatches as [$name, $code, $startDate, $endDate, $capacity, $status]) {
            $batch = CourseBatch::firstOrCreate(
                ['code' => $code, 'organization_id' => $org->id],
                [
                    'course_id' => $courseAcca->id,
                    'branch_id' => $branchNrb->id,
                    'name' => $name,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'capacity' => $capacity,
                    'status' => $status,
                ]
            );

            if ($trainerNrb) {
                $batch->trainers()->syncWithoutDetaching([$trainerNrb->id]);
            }
            if ($asstTrainerNrb) {
                $batch->trainers()->syncWithoutDetaching([$asstTrainerNrb->id]);
            }

            $createdBatches[$code] = $batch;
        }

        $batchFia = $createdBatches['ACCA-FIA-2026-SEP-NRB'] ?? null;
        $batchAk = $createdBatches['ACCA-AK-2026-SEP-NRB'] ?? null;
        $batchAs = $createdBatches['ACCA-AS-2026-SEP-NRB'] ?? null;

        // Student Enrollments into ACCA Batches
        if ($batchAs && $studentJohn) {
            Enrollment::firstOrCreate(
                ['student_id' => $studentJohn->id, 'batch_id' => $batchAs->id],
                [
                    'enrollment_number' => 'ENR-ACCA-001',
                    'enrollment_date' => '2026-09-01',
                    'workflow_stage' => 'registered',
                    'status' => 'Pending',
                ]
            );
        }

        if ($batchAs && $studentJane) {
            Enrollment::firstOrCreate(
                ['student_id' => $studentJane->id, 'batch_id' => $batchAs->id],
                [
                    'enrollment_number' => 'ENR-ACCA-002',
                    'enrollment_date' => '2026-09-01',
                    'workflow_stage' => 'in_training',
                    'status' => 'Active',
                ]
            );
        }

        if ($batchAk && $studentAlex) {
            Enrollment::firstOrCreate(
                ['student_id' => $studentAlex->id, 'batch_id' => $batchAk->id],
                [
                    'enrollment_number' => 'ENR-ACCA-003',
                    'enrollment_date' => '2026-09-02',
                    'workflow_stage' => 'in_training',
                    'status' => 'Active',
                ]
            );
        }

        if ($batchFia && $studentBrian) {
            Enrollment::firstOrCreate(
                ['student_id' => $studentBrian->id, 'batch_id' => $batchFia->id],
                [
                    'enrollment_number' => 'ENR-ACCA-004',
                    'enrollment_date' => '2026-09-03',
                    'workflow_stage' => 'in_training',
                    'status' => 'Active',
                ]
            );
        }

        if ($batchFia && $studentDiana) {
            Enrollment::firstOrCreate(
                ['student_id' => $studentDiana->id, 'batch_id' => $batchFia->id],
                [
                    'enrollment_number' => 'ENR-ACCA-005',
                    'enrollment_date' => '2026-09-03',
                    'workflow_stage' => 'in_training',
                    'status' => 'Active',
                ]
            );
        }

        // ACCA Learning Progress for Active Students
        if ($batchAs && $studentJane) {
            $accaLessons = Lesson::whereHas('module', fn ($q) => $q->where('course_id', $courseAcca->id))->orderBy('id')->get();
            foreach ($accaLessons->take(8) as $idx => $les) {
                LessonProgress::firstOrCreate(
                    ['user_id' => $studentJane->id, 'lesson_id' => $les->id, 'batch_id' => $batchAs->id],
                    [
                        'status' => 'completed',
                        'started_at' => now()->subDays(10 - $idx),
                        'completed_at' => now()->subDays(9 - $idx),
                        'last_accessed_at' => now()->subDays(9 - $idx),
                    ]
                );
            }

            CourseProgress::updateOrCreate(
                ['user_id' => $studentJane->id, 'course_id' => $courseAcca->id, 'batch_id' => $batchAs->id],
                [
                    'progress_percentage' => 36.36,
                    'completed_lessons_count' => 8,
                    'total_lessons_count' => $accaLessons->count(),
                    'completed_modules_count' => 2,
                    'total_modules_count' => 7,
                    'started_at' => now()->subDays(15),
                    'last_accessed_at' => now()->subHours(2),
                ]
            );
        }
    }
}
