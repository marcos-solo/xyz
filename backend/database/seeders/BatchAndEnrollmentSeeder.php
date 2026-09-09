<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Branch;
use App\Models\ClassSession;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BatchAndEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        $branchNrb = Branch::where('code', 'NRB')->first();
        $branchEmbu = Branch::where('code', 'EMB')->first();
        $branchMeru = Branch::where('code', 'MRU')->first();

        $courseCcna = Course::where('code', 'CCNA-200-301')->first();
        $courseCyber = Course::where('code', 'CYBER-101')->first();
        $courseBi = Course::where('code', 'BI-300')->first();
        $courseAccaFia = Course::where('code', 'ACCA-FIA')->first();
        $courseAccaAppliedKnowledge = Course::where('code', 'ACCA-APPLIED-KNOWLEDGE')->first();
        $courseAccaAppliedSkills = Course::where('code', 'ACCA-APPLIED-SKILLS')->first();
        $courseAccaStrategic = Course::where('code', 'ACCA-STRATEGIC-PROFESSIONAL')->first();

        $trainerNrb = User::where('email', 'trainer.nairobi@iatlms.test')->first();
        $asstTrainerNrb = User::where('email', 'asst.trainer@iatlms.test')->first();
        $trainerEmbu = User::where('email', 'trainer.embu@iatlms.test')->first();

        $studentJohn = User::where('email', 'student.john@iatlms.test')->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();
        $studentAlex = User::where('email', 'student.alex@iatlms.test')->first();
        $studentBrian = User::where('email', 'student.brian@iatlms.test')->first();
        $studentDiana = User::where('email', 'student.diana@iatlms.test')->first();

        // 1. Batches
        // Batch 1: CCNA January-April 2026 (Nairobi)
        $batchCcnaNrb = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $courseCcna->id,
            'branch_id' => $branchNrb->id,
            'name' => 'CCNA January-April 2026 Cohort',
            'code' => 'CCNA-2026-JAN-NRB',
            'start_date' => '2026-01-15',
            'end_date' => '2026-04-15',
            'capacity' => 25,
            'status' => 'ongoing',
        ]);

        // Assign Lead Trainer & Assistant Trainer
        $batchCcnaNrb->trainers()->attach($trainerNrb->id, ['role_type' => 'Lead Trainer']);
        if ($asstTrainerNrb) {
            $batchCcnaNrb->trainers()->attach($asstTrainerNrb->id, ['role_type' => 'Assistant Trainer']);
        }

        // Batch 2: CCNA January-April 2026 (Embu)
        $batchCcnaEmbu = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $courseCcna->id,
            'branch_id' => $branchEmbu->id,
            'name' => 'CCNA January-April 2026 Cohort (Embu)',
            'code' => 'CCNA-2026-JAN-EMB',
            'start_date' => '2026-01-15',
            'end_date' => '2026-04-15',
            'capacity' => 20,
            'status' => 'ongoing',
        ]);
        $batchCcnaEmbu->trainers()->attach($trainerEmbu->id, ['role_type' => 'Lead Trainer']);

        // Batch 3: CCNA April-July 2026 (Nairobi)
        $batchCcnaApril = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $courseCcna->id,
            'branch_id' => $branchNrb->id,
            'name' => 'CCNA April-July 2026 Cohort',
            'code' => 'CCNA-2026-APR-NRB',
            'start_date' => '2026-04-15',
            'end_date' => '2026-07-15',
            'capacity' => 30,
            'status' => 'upcoming',
        ]);
        $batchCcnaApril->trainers()->attach($trainerNrb->id, ['role_type' => 'Lead Trainer']);

        // Batch 4: Cybersecurity January-April 2026 (Nairobi)
        $batchCyber = CourseBatch::create([
            'organization_id' => $org->id,
            'course_id' => $courseCyber->id,
            'branch_id' => $branchNrb->id,
            'name' => 'Cybersecurity January-April 2026 Cohort',
            'code' => 'CYBER-2026-NRB',
            'start_date' => '2026-01-15',
            'end_date' => '2026-04-15',
            'capacity' => 20,
            'status' => 'ongoing',
        ]);
        $batchCyber->trainers()->attach($trainerNrb->id, ['role_type' => 'Lead Trainer']);

        // ACCA cohorts for the four programme stages
        $accaBatches = [
            [$courseAccaFia, 'ACCA FIA September 2026 Cohort', 'ACCA-FIA-2026-SEP-NRB', '2026-09-14', '2027-03-05', 30],
            [$courseAccaAppliedKnowledge, 'ACCA Applied Knowledge September 2026 Cohort', 'ACCA-AK-2026-SEP-NRB', '2026-09-14', '2027-01-29', 30],
            [$courseAccaAppliedSkills, 'ACCA Applied Skills September 2026 Cohort', 'ACCA-AS-2026-SEP-NRB', '2026-09-14', '2027-04-02', 30],
            [$courseAccaStrategic, 'ACCA Strategic Professional September 2026 Cohort', 'ACCA-SP-2026-SEP-NRB', '2026-09-14', '2027-02-05', 25],
        ];

        foreach ($accaBatches as [$course, $name, $code, $startDate, $endDate, $capacity]) {
            if (! $course) {
                continue;
            }

            $accaBatch = CourseBatch::create([
                'organization_id' => $org->id,
                'course_id' => $course->id,
                'branch_id' => $branchNrb->id,
                'name' => $name,
                'code' => $code,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'capacity' => $capacity,
                'status' => 'upcoming',
            ]);
            $accaBatch->trainers()->attach($trainerNrb->id, ['role_type' => 'Lead Trainer']);
        }

        // 2. Enrollments
        $enrollJohn = Enrollment::create([
            'student_id' => $studentJohn->id,
            'batch_id' => $batchCcnaNrb->id,
            'enrollment_number' => 'ENR-2026-001',
            'enrollment_date' => '2026-01-10',
            'status' => 'Active',
        ]);

        $enrollJane = Enrollment::create([
            'student_id' => $studentJane->id,
            'batch_id' => $batchCcnaNrb->id,
            'enrollment_number' => 'ENR-2026-002',
            'enrollment_date' => '2026-01-10',
            'status' => 'Active',
        ]);

        $enrollAlex = Enrollment::create([
            'student_id' => $studentAlex->id,
            'batch_id' => $batchCcnaEmbu->id,
            'enrollment_number' => 'ENR-2026-003',
            'enrollment_date' => '2026-01-12',
            'status' => 'Active',
        ]);

        $enrollBrian = Enrollment::create([
            'student_id' => $studentBrian->id,
            'batch_id' => $batchCcnaEmbu->id,
            'enrollment_number' => 'ENR-2026-004',
            'enrollment_date' => '2026-01-12',
            'status' => 'Active',
        ]);

        $enrollDiana = Enrollment::create([
            'student_id' => $studentDiana->id,
            'batch_id' => $batchCyber->id,
            'enrollment_number' => 'ENR-2026-005',
            'enrollment_date' => '2026-01-13',
            'status' => 'Active',
        ]);

        // 3. Class Sessions & Attendance
        $sessionDates = [
            '2026-01-19', '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16',
        ];

        foreach ($sessionDates as $idx => $dateStr) {
            $classSession = ClassSession::create([
                'batch_id' => $batchCcnaNrb->id,
                'trainer_id' => $trainerNrb->id,
                'title' => 'CCNA Class Session '.($idx + 1).' - '.($idx === 0 ? 'Network Topologies' : ($idx === 1 ? 'IPv4 Subnetting' : 'Switching & VLANs')),
                'topic' => 'Practical Lab and Concept Review #'.($idx + 1),
                'date' => $dateStr,
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'delivery_mode' => $idx % 2 === 0 ? 'Physical' : 'Hybrid',
                'location' => 'Lab 3, Nairobi Main Campus',
                'meeting_url' => 'https://meet.google.com/xyz-ccna-class',
                'status' => 'completed',
            ]);

            $attSession = AttendanceSession::create([
                'class_session_id' => $classSession->id,
                'batch_id' => $batchCcnaNrb->id,
                'taken_by' => $trainerNrb->id,
                'session_date' => $dateStr,
                'status' => 'closed',
            ]);

            // John Mwangi Attendance: 4 Present, 1 Late
            AttendanceRecord::create([
                'attendance_session_id' => $attSession->id,
                'student_id' => $studentJohn->id,
                'status' => $idx === 2 ? 'Late' : 'Present',
                'remarks' => $idx === 2 ? 'Arrived 15 mins late due to transport' : 'Active participant',
            ]);

            // Jane Oduor Attendance: 5 Present
            AttendanceRecord::create([
                'attendance_session_id' => $attSession->id,
                'student_id' => $studentJane->id,
                'status' => 'Present',
                'remarks' => 'Full attendance',
            ]);
        }

        // Today's upcoming session
        ClassSession::create([
            'batch_id' => $batchCcnaNrb->id,
            'trainer_id' => $trainerNrb->id,
            'title' => 'CCNA Live Hands-On Lab: Dynamic Routing & OSPF',
            'topic' => 'Configuring Single-Area OSPFv2 on Cisco 2901 Routers',
            'date' => Carbon::today()->format('Y-m-d'),
            'start_time' => '14:00:00',
            'end_time' => '17:00:00',
            'delivery_mode' => 'Physical',
            'location' => 'Advanced Cisco Network Lab',
            'status' => 'scheduled',
        ]);

        // 4. Learning Progress
        $allLessonsCcna = Lesson::whereHas('module', function ($q) use ($courseCcna) {
            $q->where('course_id', $courseCcna->id);
        })->orderBy('id')->get();

        // Mark 5 out of 7 lessons completed for John Mwangi (around 72%)
        foreach ($allLessonsCcna as $i => $lesson) {
            if ($i < 5) {
                LessonProgress::create([
                    'user_id' => $studentJohn->id,
                    'lesson_id' => $lesson->id,
                    'batch_id' => $batchCcnaNrb->id,
                    'status' => 'completed',
                    'started_at' => now()->subDays(20 - $i),
                    'completed_at' => now()->subDays(19 - $i),
                    'last_accessed_at' => now()->subDays(19 - $i),
                ]);
            }
        }

        CourseProgress::create([
            'user_id' => $studentJohn->id,
            'course_id' => $courseCcna->id,
            'batch_id' => $batchCcnaNrb->id,
            'progress_percentage' => 72.00,
            'completed_lessons_count' => 5,
            'total_lessons_count' => $allLessonsCcna->count(),
            'completed_modules_count' => 3,
            'total_modules_count' => 4,
            'started_at' => now()->subDays(25),
            'last_accessed_at' => now()->subHours(4),
        ]);

        // Jane has 85% progress
        CourseProgress::create([
            'user_id' => $studentJane->id,
            'course_id' => $courseCcna->id,
            'batch_id' => $batchCcnaNrb->id,
            'progress_percentage' => 85.00,
            'completed_lessons_count' => 6,
            'total_lessons_count' => $allLessonsCcna->count(),
            'completed_modules_count' => 4,
            'total_modules_count' => 4,
            'started_at' => now()->subDays(25),
            'last_accessed_at' => now()->subHours(2),
        ]);
    }
}
