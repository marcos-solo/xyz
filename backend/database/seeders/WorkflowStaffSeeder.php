<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Organization;
use App\Models\Position;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WorkflowStaffSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->firstOrFail();
        $branch = Branch::query()->where('organization_id', $organization->id)->where('code', 'NRB')->firstOrFail();
        $department = Department::query()->where('branch_id', $branch->id)->first();
        $defaultPassword = Hash::make(env('DEV_DEFAULT_PASSWORD', 'Password123!'));

        $staff = [
            ['Peter', 'K.', 'Omondi', 'finance@iatlms.test', 'Finance Officer', 'EMP-0301'],
            ['Lydia', 'N.', 'Wambui', 'admissions@iatlms.test', 'Admissions Officer', 'EMP-0302'],
            ['Michael', 'T.', 'Kiptoo', 'certification@iatlms.test', 'Certification Officer', 'EMP-0303'],
        ];

        foreach ($staff as [$firstName, $middleName, $lastName, $email, $role, $employeeNumber]) {
            $position = Position::firstOrCreate([
                'organization_id' => $organization->id,
                'name' => $role,
            ], [
                'description' => $role,
            ]);
            $user = User::firstOrCreate(['email' => $email], [
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
                'phone' => '+254 724 '.substr($employeeNumber, -4),
                'password' => $defaultPassword,
                'organization_id' => $organization->id,
                'branch_id' => $branch->id,
                'department_id' => $department?->id,
                'position_id' => $position->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $user->assignRole($role);
            StaffProfile::firstOrCreate(['user_id' => $user->id], [
                'employee_number' => $employeeNumber,
                'employment_date' => '2026-01-05',
                'employment_type' => 'full_time',
                'job_title' => $role,
                'status' => 'active',
            ]);
        }
    }
}
