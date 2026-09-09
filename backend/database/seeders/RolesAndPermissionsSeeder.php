<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // User Management
            ['name' => 'users.view', 'group_name' => 'Users', 'display_name' => 'View Users', 'description' => 'Can view users list and details'],
            ['name' => 'users.create', 'group_name' => 'Users', 'display_name' => 'Create Users', 'description' => 'Can create new users'],
            ['name' => 'users.update', 'group_name' => 'Users', 'display_name' => 'Update Users', 'description' => 'Can update user profiles and status'],
            ['name' => 'users.delete', 'group_name' => 'Users', 'display_name' => 'Delete Users', 'description' => 'Can soft-delete users'],
            ['name' => 'users.manage-roles', 'group_name' => 'Users', 'display_name' => 'Manage User Roles', 'description' => 'Can assign and revoke roles from users'],

            // Role Management
            ['name' => 'roles.view', 'group_name' => 'Roles & Permissions', 'display_name' => 'View Roles', 'description' => 'Can view roles and permissions'],
            ['name' => 'roles.create', 'group_name' => 'Roles & Permissions', 'display_name' => 'Create Roles', 'description' => 'Can create custom dynamic roles'],
            ['name' => 'roles.update', 'group_name' => 'Roles & Permissions', 'display_name' => 'Update Roles', 'description' => 'Can update role permissions'],
            ['name' => 'roles.delete', 'group_name' => 'Roles & Permissions', 'display_name' => 'Delete Roles', 'description' => 'Can delete custom roles'],

            // Organization & Branches
            ['name' => 'organization.view', 'group_name' => 'Organization', 'display_name' => 'View Organization', 'description' => 'Can view organization information'],
            ['name' => 'organization.update', 'group_name' => 'Organization', 'display_name' => 'Update Organization', 'description' => 'Can update organization profile and branding'],
            ['name' => 'branches.view', 'group_name' => 'Branches', 'display_name' => 'View Branches', 'description' => 'Can view branch information'],
            ['name' => 'branches.create', 'group_name' => 'Branches', 'display_name' => 'Create Branches', 'description' => 'Can create new branches'],
            ['name' => 'branches.update', 'group_name' => 'Branches', 'display_name' => 'Update Branches', 'description' => 'Can update branch details'],
            ['name' => 'branches.delete', 'group_name' => 'Branches', 'display_name' => 'Delete Branches', 'description' => 'Can delete branches'],
            ['name' => 'branches.view-all-branches', 'group_name' => 'Branches', 'display_name' => 'View All Branches Data', 'description' => 'Can access multi-branch data across the organization'],

            // Departments & Positions
            ['name' => 'departments.view', 'group_name' => 'Departments', 'display_name' => 'View Departments', 'description' => 'Can view departments'],
            ['name' => 'departments.create', 'group_name' => 'Departments', 'display_name' => 'Create Departments', 'description' => 'Can create departments'],
            ['name' => 'departments.update', 'group_name' => 'Departments', 'display_name' => 'Update Departments', 'description' => 'Can update departments'],
            ['name' => 'departments.delete', 'group_name' => 'Departments', 'display_name' => 'Delete Departments', 'description' => 'Can delete departments'],
            ['name' => 'positions.manage', 'group_name' => 'Positions', 'display_name' => 'Manage Positions', 'description' => 'Can manage organizational positions'],

            // Students & Guardians
            ['name' => 'students.view', 'group_name' => 'Students', 'display_name' => 'View Students', 'description' => 'Can view student roster and profiles'],
            ['name' => 'students.create', 'group_name' => 'Students', 'display_name' => 'Create Students', 'description' => 'Can admit new students'],
            ['name' => 'students.update', 'group_name' => 'Students', 'display_name' => 'Update Students', 'description' => 'Can update student details and guardian contacts'],
            ['name' => 'students.delete', 'group_name' => 'Students', 'display_name' => 'Delete Students', 'description' => 'Can archive student profiles'],
            ['name' => 'students.view-all-branches', 'group_name' => 'Students', 'display_name' => 'View All Branches Students', 'description' => 'Can view students across all branches'],

            // Staff
            ['name' => 'staff.view', 'group_name' => 'Staff', 'display_name' => 'View Staff', 'description' => 'Can view staff directory'],
            ['name' => 'staff.create', 'group_name' => 'Staff', 'display_name' => 'Create Staff', 'description' => 'Can onboard staff'],
            ['name' => 'staff.update', 'group_name' => 'Staff', 'display_name' => 'Update Staff', 'description' => 'Can update staff profiles'],
            ['name' => 'staff.delete', 'group_name' => 'Staff', 'display_name' => 'Delete Staff', 'description' => 'Can archive staff records'],

            // Courses & Curriculum
            ['name' => 'course-categories.manage', 'group_name' => 'Courses', 'display_name' => 'Manage Course Categories', 'description' => 'Can create and manage course categories'],
            ['name' => 'courses.view', 'group_name' => 'Courses', 'display_name' => 'View Courses', 'description' => 'Can browse course catalog'],
            ['name' => 'courses.create', 'group_name' => 'Courses', 'display_name' => 'Create Courses', 'description' => 'Can create course definitions'],
            ['name' => 'courses.update', 'group_name' => 'Courses', 'display_name' => 'Update Courses', 'description' => 'Can edit course curriculum and lessons'],
            ['name' => 'courses.delete', 'group_name' => 'Courses', 'display_name' => 'Delete Courses', 'description' => 'Can delete or archive courses'],
            ['name' => 'modules.manage', 'group_name' => 'Courses', 'display_name' => 'Manage Modules', 'description' => 'Can manage curriculum modules and reorder'],
            ['name' => 'lessons.manage', 'group_name' => 'Courses', 'display_name' => 'Manage Lessons', 'description' => 'Can manage curriculum lessons, resources and videos'],

            // Batches & Cohorts
            ['name' => 'batches.view', 'group_name' => 'Batches', 'display_name' => 'View Batches', 'description' => 'Can view cohort batches'],
            ['name' => 'batches.create', 'group_name' => 'Batches', 'display_name' => 'Create Batches', 'description' => 'Can schedule new course batches'],
            ['name' => 'batches.update', 'group_name' => 'Batches', 'display_name' => 'Update Batches', 'description' => 'Can update batch schedules and capacities'],
            ['name' => 'batches.delete', 'group_name' => 'Batches', 'display_name' => 'Delete Batches', 'description' => 'Can cancel or archive batches'],
            ['name' => 'batches.assign-trainers', 'group_name' => 'Batches', 'display_name' => 'Assign Batch Trainers', 'description' => 'Can assign lead and assistant trainers to cohorts'],

            // Enrollments
            ['name' => 'enrollments.view', 'group_name' => 'Enrollments', 'display_name' => 'View Enrollments', 'description' => 'Can view batch enrollment rosters'],
            ['name' => 'enrollments.create', 'group_name' => 'Enrollments', 'display_name' => 'Create Enrollments', 'description' => 'Can enroll students into batches'],
            ['name' => 'enrollments.update', 'group_name' => 'Enrollments', 'display_name' => 'Update Enrollments', 'description' => 'Can modify enrollment status and completions'],
            ['name' => 'enrollments.delete', 'group_name' => 'Enrollments', 'display_name' => 'Delete Enrollments', 'description' => 'Can cancel student enrollments'],
            ['name' => 'enrollments.review', 'group_name' => 'Enrollments', 'display_name' => 'Review Enrollments', 'description' => 'Can approve enrollment admission at branch level'],
            ['name' => 'enrollments.finance-clear', 'group_name' => 'Enrollments', 'display_name' => 'Clear Enrollment Finance', 'description' => 'Can confirm that enrollment fees are cleared'],
            ['name' => 'enrollments.complete', 'group_name' => 'Enrollments', 'display_name' => 'Complete Enrollments', 'description' => 'Can approve academic course completion'],
            ['name' => 'enrollments.certification-approve', 'group_name' => 'Enrollments', 'display_name' => 'Approve Certification Readiness', 'description' => 'Can approve eligible students for certification'],

            // Finance
            ['name' => 'finance.view', 'group_name' => 'Finance', 'display_name' => 'View Finance Records', 'description' => 'Can view fees, balances and payment history'],
            ['name' => 'finance.create', 'group_name' => 'Finance', 'display_name' => 'Record Payments', 'description' => 'Can record confirmed student payments'],
            ['name' => 'finance.update', 'group_name' => 'Finance', 'display_name' => 'Manage Finance Records', 'description' => 'Can manage fees and reconcile payments'],

            // Classes & Attendance
            ['name' => 'classes.view', 'group_name' => 'Classes & Attendance', 'display_name' => 'View Classes', 'description' => 'Can view class timetable'],
            ['name' => 'classes.manage', 'group_name' => 'Classes & Attendance', 'display_name' => 'Manage Classes', 'description' => 'Can schedule and manage class sessions'],
            ['name' => 'attendance.view', 'group_name' => 'Classes & Attendance', 'display_name' => 'View Attendance', 'description' => 'Can view attendance records'],
            ['name' => 'attendance.create', 'group_name' => 'Classes & Attendance', 'display_name' => 'Take Attendance', 'description' => 'Can mark and submit attendance'],
            ['name' => 'attendance.update', 'group_name' => 'Classes & Attendance', 'display_name' => 'Update Attendance', 'description' => 'Can adjust marked attendance'],
            ['name' => 'attendance.view-all-branches', 'group_name' => 'Classes & Attendance', 'display_name' => 'View Org-wide Attendance', 'description' => 'Can view attendance across all branches'],

            // Assessments, Quizzes & Grading
            ['name' => 'assessments.view', 'group_name' => 'Assessments', 'display_name' => 'View Assessments', 'description' => 'Can view quizzes, CATs, exams and assignments'],
            ['name' => 'assessments.create', 'group_name' => 'Assessments', 'display_name' => 'Create Assessments', 'description' => 'Can create assessments and question banks'],
            ['name' => 'assessments.update', 'group_name' => 'Assessments', 'display_name' => 'Update Assessments', 'description' => 'Can edit questions, marks and settings'],
            ['name' => 'assessments.delete', 'group_name' => 'Assessments', 'display_name' => 'Delete Assessments', 'description' => 'Can delete assessments'],
            ['name' => 'assessments.grade', 'group_name' => 'Assessments', 'display_name' => 'Grade Assessments', 'description' => 'Can grade submissions and enter scores'],

            // Certificates
            ['name' => 'certificates.view', 'group_name' => 'Certificates', 'display_name' => 'View Certificates', 'description' => 'Can view issued certificates'],
            ['name' => 'certificates.create-template', 'group_name' => 'Certificates', 'display_name' => 'Manage Certificate Templates', 'description' => 'Can design certificate templates'],
            ['name' => 'certificates.issue', 'group_name' => 'Certificates', 'display_name' => 'Issue Certificates', 'description' => 'Can generate and issue student certificates'],
            ['name' => 'certificates.revoke', 'group_name' => 'Certificates', 'display_name' => 'Revoke Certificates', 'description' => 'Can revoke invalid certificates'],

            // Reports
            ['name' => 'reports.view', 'group_name' => 'Reports', 'display_name' => 'View Reports', 'description' => 'Can view analytics and report dashboards'],
            ['name' => 'reports.export', 'group_name' => 'Reports', 'display_name' => 'Export Reports', 'description' => 'Can export reports to CSV/Excel/PDF'],
            ['name' => 'reports.view-all-branches', 'group_name' => 'Reports', 'display_name' => 'View All Branches Reports', 'description' => 'Can view organization-wide reports'],

            // Settings & Audits
            ['name' => 'settings.view', 'group_name' => 'Settings & Logs', 'display_name' => 'View Settings', 'description' => 'Can view system configuration'],
            ['name' => 'settings.update', 'group_name' => 'Settings & Logs', 'display_name' => 'Update Settings', 'description' => 'Can modify system settings'],
            ['name' => 'audit_logs.view', 'group_name' => 'Settings & Logs', 'display_name' => 'View Audit Logs', 'description' => 'Can view security audit trail'],

            // Student Portal Specific
            ['name' => 'student-portal.access', 'group_name' => 'Student Portal', 'display_name' => 'Access Student Portal', 'description' => 'Can log into student portal area'],
            ['name' => 'student-portal.view-grades', 'group_name' => 'Student Portal', 'display_name' => 'View Own Grades', 'description' => 'Can view personal academic gradebook'],
            ['name' => 'student-portal.take-quizzes', 'group_name' => 'Student Portal', 'display_name' => 'Take Quizzes & Exams', 'description' => 'Can attempt quizzes and submit assignments'],
        ];

        foreach ($permissions as $permData) {
            Permission::firstOrCreate(
                ['name' => $permData['name'], 'guard_name' => 'sanctum'],
                [
                    'group_name' => $permData['group_name'],
                    'display_name' => $permData['display_name'],
                    'description' => $permData['description'],
                ]
            );
        }

        // Create Default System Roles
        $roles = [
            [
                'name' => 'Super Admin',
                'display_name' => 'Super Administrator',
                'description' => 'Full unrestricted access to all organization entities and settings',
                'is_system_protected' => true,
                'permissions' => Permission::all()->pluck('name')->toArray(),
            ],
            [
                'name' => 'CEO',
                'display_name' => 'Chief Executive Officer',
                'description' => 'Executive governance, institutional KPIs and full multi-branch oversight',
                'is_system_protected' => true,
                'permissions' => [
                    'organization.view', 'organization.update',
                    'branches.view', 'branches.view-all-branches',
                    'departments.view',
                    'positions.manage',
                    'users.view',
                    'roles.view',
                    'students.view', 'students.view-all-branches',
                    'staff.view',
                    'courses.view',
                    'batches.view',
                    'enrollments.view', 'enrollments.review', 'enrollments.complete', 'enrollments.certification-approve',
                    'finance.view',
                    'classes.view',
                    'attendance.view', 'attendance.view-all-branches',
                    'assessments.view',
                    'certificates.view', 'certificates.issue',
                    'reports.view', 'reports.export', 'reports.view-all-branches',
                    'settings.view',
                    'audit_logs.view',
                ],
            ],
            [
                'name' => 'Administrator',
                'display_name' => 'System Administrator',
                'description' => 'Administrative operations across all departments and branches',
                'is_system_protected' => true,
                'permissions' => [
                    'users.view', 'users.create', 'users.update', 'users.manage-roles',
                    'roles.view', 'roles.create', 'roles.update',
                    'organization.view', 'branches.view', 'branches.create', 'branches.update', 'branches.view-all-branches',
                    'departments.view', 'departments.create', 'departments.update', 'positions.manage',
                    'students.view', 'students.create', 'students.update', 'students.view-all-branches',
                    'staff.view', 'staff.create', 'staff.update',
                    'courses.view', 'courses.create', 'course-categories.manage', 'courses.update', 'modules.manage', 'lessons.manage',
                    'batches.view', 'batches.create', 'batches.update', 'batches.assign-trainers',
                    'enrollments.view', 'enrollments.create', 'enrollments.update',
                    'enrollments.review', 'enrollments.finance-clear', 'enrollments.complete', 'enrollments.certification-approve',
                    'finance.view', 'finance.create', 'finance.update',
                    'classes.view', 'classes.manage', 'attendance.view', 'attendance.create', 'attendance.update', 'attendance.view-all-branches',
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.grade',
                    'certificates.view', 'certificates.create-template', 'certificates.issue',
                    'reports.view', 'reports.export', 'reports.view-all-branches',
                    'settings.view', 'audit_logs.view',
                ],
            ],
            [
                'name' => 'Branch Manager',
                'display_name' => 'Branch Manager',
                'description' => 'Complete operational control over assigned campus branch',
                'is_system_protected' => false,
                'permissions' => [
                    'users.view', 'users.create', 'users.update',
                    'branches.view', 'departments.view',
                    'students.view', 'students.create', 'students.update',
                    'staff.view',
                    'courses.view',
                    'batches.view', 'batches.create', 'batches.update', 'batches.assign-trainers',
                    'enrollments.view', 'enrollments.create', 'enrollments.update', 'enrollments.review',
                    'classes.view', 'classes.manage', 'attendance.view', 'attendance.create', 'attendance.update',
                    'assessments.view', 'assessments.grade',
                    'certificates.view', 'certificates.issue',
                    'reports.view', 'reports.export',
                ],
            ],
            [
                'name' => 'Academic Manager',
                'display_name' => 'Academic Manager',
                'description' => 'Oversees curriculum standards, assessments, cohorts and grading',
                'is_system_protected' => false,
                'permissions' => [
                    'courses.view', 'courses.create', 'course-categories.manage', 'courses.update', 'modules.manage', 'lessons.manage',
                    'batches.view', 'batches.create', 'batches.update', 'batches.assign-trainers',
                    'students.view', 'enrollments.view', 'enrollments.complete', 'enrollments.certification-approve',
                    'classes.view', 'attendance.view',
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.grade',
                    'certificates.view', 'certificates.create-template', 'certificates.issue',
                    'reports.view', 'reports.export',
                ],
            ],
            [
                'name' => 'Trainer',
                'display_name' => 'Course Trainer / Instructor',
                'description' => 'Manages assigned cohorts, marks attendance, delivers lessons and grades assessments',
                'is_system_protected' => false,
                'permissions' => [
                    'courses.view', 'modules.manage', 'lessons.manage',
                    'batches.view', 'enrollments.view', 'students.view',
                    'classes.view', 'classes.manage', 'attendance.view', 'attendance.create', 'attendance.update',
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.grade',
                ],
            ],
            [
                'name' => 'Front Office',
                'display_name' => 'Front Office / Receptionist',
                'description' => 'Handles student enquiries, registration, admissions and basic scheduling',
                'is_system_protected' => false,
                'permissions' => [
                    'students.view', 'students.create', 'students.update',
                    'courses.view', 'batches.view', 'enrollments.view', 'enrollments.create',
                    'classes.view',
                ],
            ],
            [
                'name' => 'Finance Officer',
                'display_name' => 'Finance Officer / Accounts',
                'description' => 'Records student payments, reconciles balances and clears enrollment finance',
                'is_system_protected' => false,
                'permissions' => [
                    'students.view', 'enrollments.view', 'finance.view', 'finance.create', 'finance.update', 'enrollments.finance-clear',
                    'reports.view', 'reports.export',
                ],
            ],
            [
                'name' => 'Admissions Officer',
                'display_name' => 'Admissions Officer',
                'description' => 'Owns student intake, document checks, branch review and cohort admission',
                'is_system_protected' => false,
                'permissions' => [
                    'students.view', 'students.create', 'students.update', 'courses.view', 'batches.view',
                    'enrollments.view', 'enrollments.create', 'enrollments.review',
                ],
            ],
            [
                'name' => 'Certification Officer',
                'display_name' => 'Examinations & Certification Officer',
                'description' => 'Verifies completion outcomes and approves students for certification',
                'is_system_protected' => false,
                'permissions' => [
                    'students.view', 'enrollments.view', 'enrollments.complete', 'enrollments.certification-approve',
                    'assessments.view', 'assessments.grade', 'certificates.view', 'certificates.issue', 'reports.view',
                ],
            ],
            [
                'name' => 'Student',
                'display_name' => 'Student',
                'description' => 'Student portal access, enrolled classes, lessons, quizzes and certificates',
                'is_system_protected' => true,
                'permissions' => [
                    'student-portal.access',
                    'student-portal.view-grades',
                    'student-portal.take-quizzes',
                ],
            ],
        ];

        foreach ($roles as $roleInfo) {
            $role = Role::firstOrCreate(
                ['name' => $roleInfo['name'], 'guard_name' => 'sanctum'],
                [
                    'uuid' => (string) Str::uuid(),
                    'display_name' => $roleInfo['display_name'],
                    'description' => $roleInfo['description'],
                    'is_system_protected' => $roleInfo['is_system_protected'],
                ]
            );

            $role->syncPermissions($roleInfo['permissions']);
        }
    }
}
