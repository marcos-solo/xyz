<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class GuestAccountSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Ensure Guest role exists with view-only permissions
        $guestPermissions = [
            'users.view',
            'roles.view',
            'organization.view',
            'branches.view',
            'branches.view-all-branches',
            'departments.view',
            'positions.manage',
            'students.view',
            'students.view-all-branches',
            'staff.view',
            'courses.view',
            'batches.view',
            'enrollments.view',
            'finance.view',
            'classes.view',
            'attendance.view',
            'attendance.view-all-branches',
            'assessments.view',
            'certificates.view',
            'reports.view',
            'reports.view-all-branches',
            'settings.view',
            'audit_logs.view',
            'student-portal.access',
            'student-portal.view-grades',
        ];

        $guestRole = Role::firstOrCreate(
            ['name' => 'Guest', 'guard_name' => 'sanctum'],
            [
                'uuid' => (string) Str::uuid(),
                'display_name' => 'Guest (Read-Only Observer)',
                'description' => 'Read-only testing account with global visibility across all users, branches, academics and student portal',
                'is_system_protected' => true,
            ]
        );

        $existingPerms = Permission::whereIn('name', $guestPermissions)
            ->where('guard_name', 'sanctum')
            ->pluck('name')
            ->toArray();

        $guestRole->syncPermissions($existingPerms);

        // 2. Organization & Branch
        $org = Organization::first();
        $branch = Branch::where('code', 'NRB')->first() ?? Branch::first();

        // 3. Create or update the Guest User
        $guestUser = User::firstOrCreate(
            ['email' => 'guest@iatlms.test'],
            [
                'uuid' => (string) Str::uuid(),
                'first_name' => 'Guest',
                'middle_name' => 'Testing',
                'last_name' => 'Observer',
                'phone' => '+254 700 999888',
                'password' => Hash::make('Password123!'),
                'organization_id' => $org?->id,
                'branch_id' => $branch?->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Assign Guest role
        $guestUser->syncRoles(['Guest']);

        // 4. Create Student Profile for Guest
        $studentProfile = StudentProfile::firstOrCreate(
            ['user_id' => $guestUser->id],
            [
                'student_number' => 'IAT-GST-2026-0001',
                'admission_date' => '2026-01-01',
                'national_id' => 'GST-TEST-001',
                'date_of_birth' => '2000-01-01',
                'gender' => 'other',
                'address' => 'IAT Testing Sandbox, Nairobi',
                'emergency_contact_name' => 'IAT Administration',
                'emergency_contact_phone' => '+254 723 819257',
                'status' => 'active',
            ]
        );

        // 5. Enroll in a batch so student portal has active course & lessons to preview
        $batch = CourseBatch::where('status', 'ongoing')->first() ?? CourseBatch::first();
        if ($batch) {
            $enrollment = Enrollment::firstOrCreate(
                [
                    'student_id' => $guestUser->id,
                    'batch_id' => $batch->id,
                ],
                [
                    'enrollment_number' => 'ENR-GST-2026-001',
                    'enrollment_date' => '2026-01-15',
                    'status' => 'Active',
                    'workflow_stage' => 'enrolled',
                ]
            );

            // Seed course progress
            if ($batch->course_id) {
                CourseProgress::firstOrCreate(
                    [
                        'user_id' => $guestUser->id,
                        'course_id' => $batch->course_id,
                    ],
                    [
                        'batch_id' => $batch->id,
                        'progress_percentage' => 45.0,
                        'completed_lessons_count' => 3,
                        'total_lessons_count' => 8,
                        'started_at' => now()->subDays(5),
                        'last_accessed_at' => now(),
                    ]
                );

                // Complete a couple of lessons for progress display
                $lessons = Lesson::whereHas('module', function ($mq) use ($batch) {
                    $mq->where('course_id', $batch->course_id);
                })->take(2)->get();

                foreach ($lessons as $lesson) {
                    LessonProgress::firstOrCreate(
                        [
                            'user_id' => $guestUser->id,
                            'lesson_id' => $lesson->id,
                        ],
                        [
                            'batch_id' => $batch->id,
                            'status' => 'completed',
                            'started_at' => now()->subDays(3),
                            'completed_at' => now(),
                        ]
                    );
                }
            }
        }
    }
}
