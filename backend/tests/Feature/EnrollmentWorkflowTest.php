<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\FinanceClearedNotification;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EnrollmentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_finance_clearance_requires_payment_or_waiver(): void
    {
        Notification::fake();

        $admissionsOfficer = User::role('Admissions Officer')->firstOrFail();
        $financeOfficer = User::role('Finance Officer')->firstOrFail();
        $enrollment = Enrollment::query()
            ->whereHas('batch', fn ($query) => $query->where('branch_id', $admissionsOfficer->branch_id))
            ->firstOrFail();

        $this->actingAs($admissionsOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'branch_review'])
            ->assertOk();

        $this->actingAs($financeOfficer, 'sanctum')
            ->putJson("/api/v1/finance/enrollments/{$enrollment->uuid}/fee", ['total_fee' => 100])
            ->assertOk();

        $this->actingAs($financeOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'finance_cleared'])
            ->assertStatus(422);

        $this->actingAs($financeOfficer, 'sanctum')
            ->postJson('/api/v1/finance/payments', [
                'enrollment_uuid' => $enrollment->uuid,
                'amount' => 100,
                'method' => 'mpesa',
            ])
            ->assertCreated();

        $this->actingAs($financeOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'finance_cleared'])
            ->assertOk();

        Notification::assertSentTo($enrollment->student, FinanceClearedNotification::class);

    }

    public function test_self_registered_student_requires_admissions_approval(): void
    {
        $student = User::role('Student')->firstOrFail();
        $branchManager = User::role('Branch Manager')->firstOrFail();
        $admissionsOfficer = User::role('Admissions Officer')->firstOrFail();
        $batch = CourseBatch::where('branch_id', $branchManager->branch_id)->firstOrFail();

        $enrollment = Enrollment::query()->create([
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'ENR-SELF-SPONSORED-APPROVAL',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Pending',
            'workflow_stage' => 'registered',
            'workflow_updated_by' => null,
            'workflow_updated_at' => now(),
        ]);

        $this->actingAs($branchManager, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'branch_review'])
            ->assertForbidden();

        $this->actingAs($admissionsOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'branch_review'])
            ->assertOk();
    }

    public function test_student_learning_unlocks_after_admissions_approval_before_finance_clearance(): void
    {
        $student = User::role('Student')->firstOrFail();
        $admissionsOfficer = User::role('Admissions Officer')->firstOrFail();
        $course = Course::where('status', 'active')->firstOrFail();
        $batch = CourseBatch::create([
            'organization_id' => $course->organization_id,
            'course_id' => $course->id,
            'branch_id' => $admissionsOfficer->branch_id,
            'name' => 'Self Sponsored Approval Test Intake',
            'code' => 'SELF-APPROVAL-TEST',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(3)->toDateString(),
            'capacity' => 20,
            'status' => 'ongoing',
        ]);
        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'ENR-SELF-LEARNING-ACCESS',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Pending',
            'workflow_stage' => 'registered',
            'workflow_updated_by' => null,
            'workflow_updated_at' => now(),
        ]);

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/courses/'.$course->uuid)
            ->assertForbidden();

        $this->actingAs($admissionsOfficer, 'sanctum')
            ->patchJson("/api/v1/enrollments/{$enrollment->uuid}/workflow", ['stage' => 'branch_review'])
            ->assertOk();

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/courses/'.$course->uuid)
            ->assertOk();

        $this->assertSame('pending', $enrollment->fresh()->finance?->status ?? 'pending');
    }

    public function test_student_can_apply_for_batch_intake(): void
    {
        $student = User::role('Student')->firstOrFail();
        $batch = CourseBatch::whereDoesntHave('enrollments', fn ($q) => $q->where('student_id', $student->id))->firstOrFail();

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/enrollments/apply', [
                'batch_uuid' => $batch->uuid,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'workflow_stage' => 'registered',
            'status' => 'Pending',
        ]);
    }
}
