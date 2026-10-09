<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        $course = Course::where('code', 'ACCA')->first();
        $batch = CourseBatch::where('course_id', $course?->id)->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();
        $superAdmin = User::where('email', 'superadmin@iatlms.test')->first();

        if (Certificate::query()
            ->where('certificate_number', 'IAT-CERT-2026-00101')
            ->exists()) {
            $this->command?->warn('Certificates already exist; skipping fixture seeder.');

            return;
        }

        // 1. Certificate Template
        $template = CertificateTemplate::create([
            'organization_id' => $org->id,
            'name' => 'IAT ACCA Professional Certification Template',
            'title' => 'Certificate of Professional Accounting Competency',
            'description' => 'Official certificate issued by Institute of Advanced Technology Ltd upon verified completion of ACCA curriculum, syllabus study modules, attendance threshold, and practical mock assessments.',
            'signatory_name' => 'Dr. Catherine Wanjiku Mutua',
            'signatory_title' => 'Chief Executive Officer & Academic Director',
            'requirements_config' => [
                'min_course_progress' => 80,
                'min_attendance' => 75,
                'min_final_score' => 50,
            ],
            'is_active' => true,
        ]);

        // 2. Issued Certificate for Jane Oduor (ACCA)
        if ($course && $batch && $studentJane && $superAdmin) {
            Certificate::create([
                'organization_id' => $org->id,
                'certificate_number' => 'IAT-CERT-2026-00101',
                'verification_code' => 'IAT-ACCA-98234',
                'template_id' => $template->id,
                'student_id' => $studentJane->id,
                'course_id' => $course->id,
                'batch_id' => $batch->id,
                'issue_date' => '2026-02-28',
                'final_grade' => 'A',
                'final_score' => 89.00,
                'pdf_path' => 'certificates/IAT-CERT-2026-00101.pdf',
                'status' => 'issued',
                'issued_by' => $superAdmin->id,
            ]);
        }

        // 3. Announcements
        if ($superAdmin) {
            Announcement::create([
                'organization_id' => $org->id,
                'title' => 'Welcome to the New IAT Multi-Branch ACCA Portal',
                'message' => 'We are thrilled to unveil our unified Institute of Advanced Technology Ltd (IAT) LMS and student management platform across Nairobi, Embu, Meru, and Mombasa campuses. Trainers and students can now access real-time ACCA timetables, official syllabus guides, CBE assessments, and verifiable digital certificates.',
                'target_type' => 'all',
                'publish_at' => now()->subDays(10),
                'status' => 'published',
                'created_by' => $superAdmin->id,
            ]);

            if ($course) {
                Announcement::create([
                    'organization_id' => $org->id,
                    'title' => 'ACCA CBE Mock Exam & Syllabus Review Session',
                    'message' => 'All ACCA cohorts are reminded that the official CBE mock exam papers and syllabus guides have been updated in the study portal. Join your lead trainer for the live debriefing session.',
                    'target_type' => 'course',
                    'target_id' => $course->id,
                    'publish_at' => now()->subDays(2),
                    'status' => 'published',
                    'created_by' => $superAdmin->id,
                ]);
            }
        }
    }
}
