<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\AuditLog;
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
        $course = Course::where('code', 'CCNA-200-301')->first();
        $batch = CourseBatch::where('code', 'CCNA-2026-JAN-NRB')->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();
        $superAdmin = User::where('email', 'superadmin@iatlms.test')->first();

        // 1. Certificate Template
        $template = CertificateTemplate::create([
            'organization_id' => $org->id,
            'name' => 'IAT Professional Certification Template',
            'title' => 'Certificate of Professional Competency',
            'description' => 'Official certificate issued by Institute of Advanced Technology Ltd upon verified completion of curriculum, attendance threshold, and practical assessments.',
            'signatory_name' => 'Dr. Catherine Wanjiku Mutua',
            'signatory_title' => 'Chief Executive Officer & Academic Director',
            'requirements_config' => [
                'min_course_progress' => 80,
                'min_attendance' => 75,
                'min_final_score' => 50,
            ],
            'is_active' => true,
        ]);

        // 2. Issued Certificate for Jane Oduor
        Certificate::create([
            'organization_id' => $org->id,
            'certificate_number' => 'IAT-CERT-2026-00101',
            'verification_code' => 'IAT-CCNA-98234',
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

        // 3. Announcements
        Announcement::create([
            'organization_id' => $org->id,
            'title' => 'Welcome to the New IAT Multi-Branch LMS Platform',
            'message' => 'We are thrilled to unveil our unified Institute of Advanced Technology Ltd (IAT) LMS and student management platform across Nairobi, Embu, Meru, and Mombasa campuses. Trainers and students can now access real-time timetables, assessments, and verifiable digital certificates.',
            'target_type' => 'all',
            'publish_at' => now()->subDays(10),
            'status' => 'published',
            'created_by' => $superAdmin->id,
        ]);

        Announcement::create([
            'organization_id' => $org->id,
            'title' => 'Upcoming Cisco Packet Tracer Practical Lab Evaluation',
            'message' => 'All CCNA cohorts are reminded that the Enterprise Topology Packet Tracer assignment submission portal closes on Friday at 23:59 EAT.',
            'target_type' => 'course',
            'target_id' => $course->id,
            'publish_at' => now()->subDays(2),
            'status' => 'published',
            'created_by' => $superAdmin->id,
        ]);

        // 4. Sample Audit Logs
        AuditLog::create([
            'user_id' => $superAdmin->id,
            'organization_id' => $org->id,
            'action' => 'user.create',
            'entity_type' => User::class,
            'entity_id' => $studentJane->id,
            'new_values' => ['email' => $studentJane->email, 'role' => 'Student'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            'created_at' => now()->subDays(20),
        ]);

        AuditLog::create([
            'user_id' => $superAdmin->id,
            'organization_id' => $org->id,
            'action' => 'certificate.issue',
            'entity_type' => Certificate::class,
            'entity_id' => 1,
            'new_values' => ['certificate_number' => 'IAT-CERT-2026-00101', 'student' => 'Jane Oduor', 'score' => 89],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            'created_at' => now()->subDays(1),
        ]);
    }
}
