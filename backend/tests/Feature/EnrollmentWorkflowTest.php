<?php

namespace Tests\Feature;

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
}
