<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_branch_manager_only_sees_departments_from_their_branch(): void
    {
        $branchManager = User::role('Branch Manager')->firstOrFail();
        $otherBranch = Branch::create([
            'organization_id' => Organization::firstOrFail()->id,
            'name' => 'Other Test Branch',
            'code' => 'OTHER-TEST',
            'status' => 'active',
        ]);
        $otherDepartment = Department::create([
            'branch_id' => $otherBranch->id,
            'name' => 'Other Branch Department',
            'status' => 'active',
        ]);

        $response = $this->actingAs($branchManager, 'sanctum')
            ->getJson('/api/v1/departments');

        $response->assertOk()
            ->assertJsonMissing(['uuid' => $otherDepartment->uuid]);

        collect($response->json('data'))->each(function (array $department) use ($branchManager): void {
            $this->assertSame($branchManager->branch_id, $department['branch']['id']);
        });
    }
}
