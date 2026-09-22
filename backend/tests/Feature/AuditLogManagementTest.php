<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_can_export_audit_logs_as_csv(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();

        AuditLog::create([
            'user_id' => $admin->id,
            'organization_id' => $admin->organization_id,
            'action' => 'user.update',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $admin->id,
            'old_values' => ['status' => 'active'],
            'new_values' => ['status' => 'inactive'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/audit-logs/export?from_date='.now()->subDay()->toDateString().'&to_date='.now()->toDateString());

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_clear_audit_logs_with_date_range(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();

        $log = AuditLog::create([
            'user_id' => $admin->id,
            'organization_id' => $admin->organization_id,
            'action' => 'course.update',
            'entity_type' => 'App\\Models\\Course',
            'entity_id' => 99,
            'old_values' => ['name' => 'Old'],
            'new_values' => ['name' => 'New'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/v1/audit-logs', [
                'from_date' => now()->subDay()->toDateString(),
                'to_date' => now()->toDateString(),
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertGreaterThanOrEqual(1, $response->json('data.deleted'));
        $this->assertDatabaseMissing('audit_logs', ['id' => $log->id]);
    }

    public function test_admin_can_clear_all_audit_logs_when_explicitly_requested(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();

        $log = AuditLog::create([
            'user_id' => $admin->id,
            'organization_id' => $admin->organization_id,
            'action' => 'settings.update',
            'entity_type' => 'App\\Models\\SystemSetting',
            'entity_id' => 1,
            'old_values' => ['theme' => 'light'],
            'new_values' => ['theme' => 'dark'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/v1/audit-logs', ['all' => true]);

        $response->assertOk()
            ->assertJsonPath('success', true);
        $this->assertDatabaseMissing('audit_logs', ['id' => $log->id]);
    }
}
