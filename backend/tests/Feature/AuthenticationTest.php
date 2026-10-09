<?php

namespace Tests\Feature;

use App\Models\CertificateTemplate;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'superadmin@iatlms.test',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'user' => ['uuid', 'email', 'full_name', 'roles', 'permissions'],
                ],
            ]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'superadmin@iatlms.test',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_public_certificate_verification(): void
    {
        $response = $this->getJson('/api/v1/public/verify-certificate/IAT-ACCA-98234');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_valid' => true,
                    'verification_code' => 'IAT-ACCA-98234',
                ],
            ]);

        $this->getJson('/api/v1/public/verify-certificate/IAT-CERT-2026-00101')
            ->assertOk()
            ->assertJsonPath('data.certificate_number', 'IAT-CERT-2026-00101');
    }

    public function test_student_can_register_with_email_and_password_without_email_verification(): void
    {
        $course = Course::where('code', 'ACCA')->firstOrFail();
        $batch = CourseBatch::where('course_id', $course->id)
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->firstOrFail();

        $response = $this->postJson('/api/v1/auth/register-student', [
            'first_name' => 'Regular',
            'last_name' => 'Student',
            'email' => 'regular.student@example.test',
            'phone' => '0712345678',
            'password' => 'SecurePassword123',
            'password_confirmation' => 'SecurePassword123',
            'course_uuid' => $course->uuid,
            'batch_uuid' => $batch->uuid,
            'privacy_notice_accepted' => true,
        ])->assertCreated()
            ->assertJsonPath('data.user.email', 'regular.student@example.test')
            ->assertJsonPath('data.user.is_student', true);

        $student = User::where('email', 'regular.student@example.test')->firstOrFail();
        $this->assertNotNull($student->privacy_notice_accepted_at);
        $this->assertSame('2026-09-30', $student->privacy_notice_version);
        $this->assertNull($student->email_verified_at);
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'workflow_stage' => 'registered',
        ]);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_unauthenticated_api_requests_return_json_instead_of_redirecting_to_login(): void
    {
        $response = $this->getJson('/api/v1/reports/enrollments/export');

        $response->assertUnauthorized()
            ->assertJsonStructure(['message']);
    }

    public function test_admin_can_configure_student_academic_support_contact_and_response_time(): void
    {
        $admin = User::where('email', 'superadmin@iatlms.test')->firstOrFail();
        $organization = Organization::firstOrFail();
        $settings = $organization->settings ?? [];
        $settings['academic_support_email'] = 'academic.support@iat.ac.ke';
        $settings['query_response_time'] = 'Within 1 business day';

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/v1/organization', [
                'name' => $organization->name,
                'email' => $organization->email,
                'phone' => $organization->phone,
                'website' => $organization->website,
                'address' => $organization->address,
                'settings' => $settings,
            ])
            ->assertOk();

        $this->actingAs(User::where('email', 'student.john@iatlms.test')->firstOrFail(), 'sanctum')
            ->getJson('/api/v1/organization')
            ->assertOk()
            ->assertJsonPath('data.settings.academic_support_email', 'academic.support@iat.ac.ke')
            ->assertJsonPath('data.settings.query_response_time', 'Within 1 business day');
    }

    public function test_student_sees_only_their_acca_intake_unit_in_curriculum(): void
    {
        $student = User::where('email', 'student.john@iatlms.test')->firstOrFail();
        $course = Course::where('code', 'ACCA')->firstOrFail();
        $batch = CourseBatch::where('course_id', $course->id)
            ->where('name', 'like', '%Applied Knowledge%')
            ->firstOrFail();

        Enrollment::query()->create([
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'ENR-ACCA-APPLIED-KNOWLEDGE',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Active',
            'workflow_stage' => 'in_training',
            'workflow_updated_by' => User::role('Admissions Officer')->firstOrFail()->id,
            'workflow_updated_at' => now(),
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/courses/'.$course->uuid);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.units')
            ->assertJsonPath('data.units.0.title', 'Fundamental Level')
            ->assertJsonPath('data.units.0.modules.0.title', 'Applied Knowledge Module');
    }

    public function test_student_cannot_complete_lessons_outside_their_intake_module(): void
    {
        $student = User::where('email', 'student.john@iatlms.test')->firstOrFail();
        $course = Course::where('code', 'ACCA')->firstOrFail();
        $knowledgeBatch = CourseBatch::where('course_id', $course->id)
            ->where('name', 'like', '%Applied Knowledge%')
            ->firstOrFail();
        $skillsLesson = $course->units()
            ->where('title', 'Fundamental Level')
            ->with('modules.lessons')
            ->firstOrFail()
            ->modules
            ->firstWhere('title', 'Applied Skills Module')
            ->lessons
            ->firstOrFail();

        Enrollment::query()->create([
            'student_id' => $student->id,
            'batch_id' => $knowledgeBatch->id,
            'enrollment_number' => 'ENR-ACCA-SEQUENCE-GUARD',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Active',
            'workflow_stage' => 'in_training',
        ]);

        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/lessons/'.$skillsLesson->uuid.'/progress', [
                'batch_uuid' => $knowledgeBatch->uuid,
                'status' => 'completed',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This lesson is not part of the selected intake curriculum.');
    }

    public function test_acca_student_can_complete_learning_and_receive_certificate(): void
    {
        $student = User::where('email', 'student.jane@iatlms.test')->firstOrFail();
        $course = Course::where('code', 'ACCA')->firstOrFail();
        $batch = CourseBatch::where('course_id', $course->id)
            ->where('name', 'like', '%Applied Knowledge%')
            ->firstOrFail();
        $admissionsOfficer = User::role('Admissions Officer')->firstOrFail();
        $financeOfficer = User::role('Finance Officer')->firstOrFail();
        $certificationOfficer = User::role('Certification Officer')->firstOrFail();

        $enrollment = Enrollment::query()->create([
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'ENR-ACCA-CERT-FLOW',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Pending',
            'workflow_stage' => 'registered',
            'workflow_updated_by' => $admissionsOfficer->id,
            'workflow_updated_at' => now(),
        ]);

        $this->actingAs($admissionsOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'branch_review'])
            ->assertOk();

        $this->actingAs($financeOfficer, 'sanctum')
            ->putJson("/api/v1/finance/enrollments/{$enrollment->uuid}/fee", ['total_fee' => 150000, 'fees_paid' => 150000])
            ->assertOk();

        $this->actingAs($financeOfficer, 'sanctum')
            ->postJson('/api/v1/finance/payments', [
                'enrollment_uuid' => $enrollment->uuid,
                'amount' => 150000,
                'method' => 'mpesa',
            ])->assertCreated();

        $this->actingAs($financeOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'finance_cleared'])
            ->assertOk();

        $this->actingAs($admissionsOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'in_training'])
            ->assertOk();

        $allLessons = $course->units()
            ->where('title', 'Fundamental Level')
            ->with('modules.lessons')
            ->firstOrFail()
            ->modules
            ->firstWhere('title', 'Applied Knowledge Module')
            ->lessons;

        foreach ($allLessons as $lesson) {
            $this->actingAs($student, 'sanctum')
                ->postJson('/api/v1/lessons/'.$lesson->uuid.'/progress', [
                    'batch_uuid' => $batch->uuid,
                    'status' => 'completed',
                ])
                ->assertOk();
        }

        $this->actingAs($certificationOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'course_completed'])
            ->assertOk();

        $this->actingAs($certificationOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'certification_ready'])
            ->assertOk();

        $template = CertificateTemplate::firstOrCreate([
            'organization_id' => $course->organization_id,
            'name' => 'ACCA Completion Certificate',
        ], [
            'title' => 'Certificate of Completion',
            'description' => 'Issued for completion of the ACCA Applied Knowledge pathway.',
            'signatory_name' => 'Dr. Catherine Wanjiku Mutua',
            'signatory_title' => 'Chief Executive Officer & Academic Director',
            'requirements_config' => [
                'min_course_progress' => 80,
                'min_attendance' => 75,
                'min_final_score' => 50,
            ],
            'is_active' => true,
        ]);

        $this->actingAs($certificationOfficer, 'sanctum')
            ->postJson('/api/v1/certificates/issue', [
                'student_uuid' => $student->uuid,
                'batch_uuid' => $batch->uuid,
                'template_uuid' => $template->uuid,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true);
    }
}
