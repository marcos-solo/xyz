<?php

namespace Tests\Feature;

use App\Models\CertificateTemplate;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
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
        $response = $this->getJson('/api/v1/public/verify-certificate/IAT-CCNA-98234');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_valid' => true,
                    'verification_code' => 'IAT-CCNA-98234',
                ],
            ]);
    }

    public function test_unauthenticated_api_requests_return_json_instead_of_redirecting_to_login(): void
    {
        $response = $this->getJson('/api/v1/reports/enrollments/export');

        $response->assertUnauthorized()
            ->assertJsonStructure(['message']);
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
            ->assertJsonPath('data.units.0.title', 'Applied Knowledge');
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

        $allLessons = $course->units()->with('modules.lessons')->get()
            ->flatMap(fn ($unit) => $unit->modules->flatMap(fn ($module) => $module->lessons))
            ->values();

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
