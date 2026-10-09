<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\Position;
use App\Models\StaffProfile;
use App\Models\StudentProfile;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | 1. Organization
            |--------------------------------------------------------------------------
            */

            $org = Organization::updateOrCreate(
                ['code' => 'IAT'],
                [
                    'name' => 'Institute of Advanced Technology Ltd',
                    'email' => 'contact@iat.ac.ke',
                    'phone' => '+254 700 123456',
                    'website' => 'https://www.iat.ac.ke',
                    'address' => 'IAT Towers, University Way, Nairobi, Kenya',
                    'status' => 'active',
                    'settings' => [
                        'timezone' => 'Africa/Nairobi',
                        'currency' => 'KES',
                        'date_format' => 'Y-m-d',
                        'student_id_prefix' => 'IAT',
                        'certificate_prefix' => 'CERT-IAT',
                    ],
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 2. System Settings
            |--------------------------------------------------------------------------
            */

            $settings = [
                [
                    'key' => 'institution_name',
                    'value' => 'Institute of Advanced Technology Ltd',
                    'type' => 'string',
                ],
                [
                    'key' => 'student_number_format',
                    'value' => '{PREFIX}-{YEAR}-{SEQ:4}',
                    'type' => 'string',
                ],
                [
                    'key' => 'certificate_number_format',
                    'value' => 'CERT-{YEAR}-{SEQ:5}',
                    'type' => 'string',
                ],
                [
                    'key' => 'min_attendance_certificate',
                    'value' => '75',
                    'type' => 'integer',
                ],
                [
                    'key' => 'min_progress_certificate',
                    'value' => '80',
                    'type' => 'integer',
                ],
                [
                    'key' => 'allow_late_submissions',
                    'value' => '1',
                    'type' => 'boolean',
                ],
            ];

            foreach ($settings as $setting) {
                SystemSetting::updateOrCreate(
                    [
                        'organization_id' => $org->id,
                        'key' => $setting['key'],
                    ],
                    [
                        'value' => $setting['value'],
                        'type' => $setting['type'],
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 3. Positions
            |--------------------------------------------------------------------------
            */

            $positions = [];

            $positionData = [
                'ceo' => [
                    'name' => 'Chief Executive Officer',
                    'description' => 'Executive Management',
                ],
                'bm' => [
                    'name' => 'Branch Manager',
                    'description' => 'Branch Operations & Supervision',
                ],
                'am' => [
                    'name' => 'Academic Manager',
                    'description' => 'Curriculum and Training Supervision',
                ],
                'trainer' => [
                    'name' => 'Senior Trainer',
                    'description' => 'Instruction & Assessment',
                ],
                'assistant_trainer' => [
                    'name' => 'Assistant Trainer',
                    'description' => 'Lab Assistance & Tutoring',
                ],
                'front_office' => [
                    'name' => 'Front Office Admissions',
                    'description' => 'Student Intake & Registration',
                ],
                'finance' => [
                    'name' => 'Finance Officer',
                    'description' => 'Fees, Receipting & Reconciliation',
                ],
                'admissions' => [
                    'name' => 'Admissions Officer',
                    'description' => 'Admissions Review & Enrollment Approval',
                ],
                'certification' => [
                    'name' => 'Certification Officer',
                    'description' => 'Examinations & Certification Readiness',
                ],
            ];

            foreach ($positionData as $key => $data) {
                $positions[$key] = Position::updateOrCreate(
                    [
                        'organization_id' => $org->id,
                        'name' => $data['name'],
                    ],
                    [
                        'description' => $data['description'],
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 4. Branches
            |--------------------------------------------------------------------------
            */

            $branches = [];

            $branchData = [
                'NRB' => [
                    'name' => 'Nairobi Main Campus',
                    'location' => 'Nairobi CBD',
                    'phone' => '+254 711 000100',
                    'email' => 'nairobi@iat.ac.ke',
                ],
                'EMB' => [
                    'name' => 'Embu Campus',
                    'location' => 'Embu Town Centre',
                    'phone' => '+254 711 000200',
                    'email' => 'embu@iat.ac.ke',
                ],
                'MRU' => [
                    'name' => 'Meru Campus',
                    'location' => 'Meru Town',
                    'phone' => '+254 711 000300',
                    'email' => 'meru@iat.ac.ke',
                ],
                'MSA' => [
                    'name' => 'Mombasa Coastal Campus',
                    'location' => 'Nyali, Mombasa',
                    'phone' => '+254 711 000400',
                    'email' => 'mombasa@iat.ac.ke',
                ],
            ];

            foreach ($branchData as $code => $data) {
                $branches[$code] = Branch::updateOrCreate(
                    [
                        'organization_id' => $org->id,
                        'code' => $code,
                    ],
                    [
                        'name' => $data['name'],
                        'location' => $data['location'],
                        'phone' => $data['phone'],
                        'email' => $data['email'],
                        'status' => 'active',
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 5. Departments
            |--------------------------------------------------------------------------
            */

            $departments = [];

            $departmentData = [
                'IT-NRB' => [
                    'branch' => 'NRB',
                    'name' => 'Information Technology',
                ],
                'BA-NRB' => [
                    'branch' => 'NRB',
                    'name' => 'Business Management',
                ],
                'IT-EMB' => [
                    'branch' => 'EMB',
                    'name' => 'Information Technology',
                ],
                'IT-MRU' => [
                    'branch' => 'MRU',
                    'name' => 'Information Technology',
                ],
            ];

            foreach ($departmentData as $code => $data) {
                $departments[$code] = Department::updateOrCreate(
                    [
                        'branch_id' => $branches[$data['branch']]->id,
                        'code' => $code,
                    ],
                    [
                        'name' => $data['name'],
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Default Password
            |--------------------------------------------------------------------------
            */

            $defaultPassword = Hash::make(
                env('DEV_DEFAULT_PASSWORD', 'Password123!')
            );

            /*
            |--------------------------------------------------------------------------
            | Helper: Create / Update User
            |--------------------------------------------------------------------------
            |
            | Existing users keep their current password.
            |
            */

            $getUser = function (array $data) use ($defaultPassword, $org) {

                $user = User::firstOrCreate(
                    [
                        'email' => $data['email'],
                    ],
                    [
                        'first_name' => $data['first_name'],
                        'middle_name' => $data['middle_name'] ?? null,
                        'last_name' => $data['last_name'],
                        'phone' => $data['phone'] ?? null,
                        'password' => $defaultPassword,
                        'organization_id' => $org->id,
                        'branch_id' => $data['branch_id'] ?? null,
                        'department_id' => $data['department_id'] ?? null,
                        'position_id' => $data['position_id'] ?? null,
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]
                );

                $user->update([
                    'first_name' => $data['first_name'],
                    'middle_name' => $data['middle_name'] ?? null,
                    'last_name' => $data['last_name'],
                    'phone' => $data['phone'] ?? null,
                    'organization_id' => $org->id,
                    'branch_id' => $data['branch_id'] ?? null,
                    'department_id' => $data['department_id'] ?? null,
                    'position_id' => $data['position_id'] ?? null,
                    'status' => 'active',
                ]);

                return $user;
            };

            /*
            |--------------------------------------------------------------------------
            | 6. Super Admin
            |--------------------------------------------------------------------------
            */

            $superAdmin = $getUser([
                'first_name' => 'Super',
                'middle_name' => 'System',
                'last_name' => 'Administrator',
                'email' => 'superadmin@iatlms.test',
                'phone' => '+254 700 000001',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['ceo']->id,
            ]);

            $superAdmin->assignRole('Super Admin');

            StaffProfile::updateOrCreate(
                ['user_id' => $superAdmin->id],
                [
                    'employee_number' => 'EMP-0001',
                    'employment_date' => '2020-01-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'System Architect & Super Admin',
                    'national_id' => 'ID-00000001',
                    'address' => 'IAT Towers, Nairobi',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 7. CEO
            |--------------------------------------------------------------------------
            */

            $ceoUser = $getUser([
                'first_name' => 'Dr. Catherine',
                'middle_name' => 'Wanjiku',
                'last_name' => 'Mutua',
                'email' => 'ceo@iatlms.test',
                'phone' => '+254 700 000000',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['ceo']->id,
            ]);

            $ceoUser->assignRole('CEO');

            StaffProfile::updateOrCreate(
                ['user_id' => $ceoUser->id],
                [
                    'employee_number' => 'EMP-CEO-001',
                    'employment_date' => '2018-01-15',
                    'employment_type' => 'full_time',
                    'job_title' => 'Chief Executive Officer & Executive Director',
                    'national_id' => 'ID-10000000',
                    'address' => 'IAT Executive Suites, Nairobi',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 8. Branch Managers
            |--------------------------------------------------------------------------
            */

            $bmNairobi = $getUser([
                'first_name' => 'Marcus',
                'middle_name' => 'Kamau',
                'last_name' => 'Njoroge',
                'email' => 'bm.nairobi@iatlms.test',
                'phone' => '+254 722 100001',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['bm']->id,
            ]);

            $bmNairobi->assignRole('Branch Manager');

            $branches['NRB']->update([
                'manager_id' => $bmNairobi->id,
            ]);

            StaffProfile::updateOrCreate(
                ['user_id' => $bmNairobi->id],
                [
                    'employee_number' => 'EMP-0010',
                    'employment_date' => '2021-03-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'Branch Manager - Nairobi',
                    'status' => 'active',
                ]
            );

            $bmEmbu = $getUser([
                'first_name' => 'John',
                'middle_name' => 'Kariuki',
                'last_name' => 'Mwangi',
                'email' => 'bm.embu@iatlms.test',
                'phone' => '+254 722 200001',
                'branch_id' => $branches['EMB']->id,
                'department_id' => $departments['IT-EMB']->id,
                'position_id' => $positions['bm']->id,
            ]);

            $bmEmbu->assignRole('Branch Manager');

            $branches['EMB']->update([
                'manager_id' => $bmEmbu->id,
            ]);

            StaffProfile::updateOrCreate(
                ['user_id' => $bmEmbu->id],
                [
                    'employee_number' => 'EMP-0020',
                    'employment_date' => '2022-01-15',
                    'employment_type' => 'full_time',
                    'job_title' => 'Branch Manager - Embu',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 9. Academic Manager
            |--------------------------------------------------------------------------
            */

            $acadManager = $getUser([
                'first_name' => 'Dr. Catherine',
                'middle_name' => 'Wanjiku',
                'last_name' => 'Mutua',
                'email' => 'academic.manager@iatlms.test',
                'phone' => '+254 722 300001',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['am']->id,
            ]);

            $acadManager->assignRole('Academic Manager');

            StaffProfile::updateOrCreate(
                ['user_id' => $acadManager->id],
                [
                    'employee_number' => 'EMP-0030',
                    'employment_date' => '2021-06-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'Academic Dean & Manager',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 10. Trainers
            |--------------------------------------------------------------------------
            */

            $trainerNrb = $getUser([
                'first_name' => 'David',
                'middle_name' => 'Otieno',
                'last_name' => 'Ochieng',
                'email' => 'trainer.nairobi@iatlms.test',
                'phone' => '+254 723 111001',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['trainer']->id,
            ]);

            $trainerNrb->assignRole('Trainer');

            StaffProfile::updateOrCreate(
                ['user_id' => $trainerNrb->id],
                [
                    'employee_number' => 'EMP-0101',
                    'employment_date' => '2022-04-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'Lead Cisco & Cyber Trainer',
                    'specialization' => 'CCNA, CCNP, Network Security, CyberOps',
                    'status' => 'active',
                ]
            );

            $trainerEmbu = $getUser([
                'first_name' => 'Faith',
                'middle_name' => 'Muthoni',
                'last_name' => 'Kiprono',
                'email' => 'trainer.embu@iatlms.test',
                'phone' => '+254 723 222001',
                'branch_id' => $branches['EMB']->id,
                'department_id' => $departments['IT-EMB']->id,
                'position_id' => $positions['trainer']->id,
            ]);

            $trainerEmbu->assignRole('Trainer');

            StaffProfile::updateOrCreate(
                ['user_id' => $trainerEmbu->id],
                [
                    'employee_number' => 'EMP-0102',
                    'employment_date' => '2023-02-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'Lead Software Engineering Trainer',
                    'specialization' => 'Full-Stack Web Dev, Python, Power BI',
                    'status' => 'active',
                ]
            );

            $asstTrainer = $getUser([
                'first_name' => 'Samuel',
                'middle_name' => 'Kipchumba',
                'last_name' => 'Korir',
                'email' => 'asst.trainer@iatlms.test',
                'phone' => '+254 723 333001',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['IT-NRB']->id,
                'position_id' => $positions['assistant_trainer']->id,
            ]);

            $asstTrainer->assignRole('Trainer');

            StaffProfile::updateOrCreate(
                ['user_id' => $asstTrainer->id],
                [
                    'employee_number' => 'EMP-0103',
                    'employment_date' => '2024-01-10',
                    'employment_type' => 'contract',
                    'job_title' => 'Assistant Lab Trainer',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 11. Front Office
            |--------------------------------------------------------------------------
            */

            $frontOffice = $getUser([
                'first_name' => 'Grace',
                'middle_name' => 'Akinyi',
                'last_name' => 'Odhiambo',
                'email' => 'frontoffice@iatlms.test',
                'phone' => '+254 724 000111',
                'branch_id' => $branches['NRB']->id,
                'department_id' => $departments['BA-NRB']->id,
                'position_id' => $positions['front_office']->id,
            ]);

            $frontOffice->assignRole('Front Office');

            StaffProfile::updateOrCreate(
                ['user_id' => $frontOffice->id],
                [
                    'employee_number' => 'EMP-0201',
                    'employment_date' => '2023-08-01',
                    'employment_type' => 'full_time',
                    'job_title' => 'Front Desk & Admissions Specialist',
                    'status' => 'active',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 12. Finance, Admissions, Certification
            |--------------------------------------------------------------------------
            */

            $workflowStaff = [
                [
                    'first_name' => 'Peter',
                    'middle_name' => 'K.',
                    'last_name' => 'Omondi',
                    'email' => 'finance@iatlms.test',
                    'phone' => '+254 724 000222',
                    'position' => 'finance',
                    'role' => 'Finance Officer',
                    'employee_number' => 'EMP-0301',
                    'job_title' => 'Finance & Accounts Officer',
                ],
                [
                    'first_name' => 'Lydia',
                    'middle_name' => 'N.',
                    'last_name' => 'Wambui',
                    'email' => 'admissions@iatlms.test',
                    'phone' => '+254 724 000333',
                    'position' => 'admissions',
                    'role' => 'Admissions Officer',
                    'employee_number' => 'EMP-0302',
                    'job_title' => 'Admissions Review Officer',
                ],
                [
                    'first_name' => 'Michael',
                    'middle_name' => 'T.',
                    'last_name' => 'Kiptoo',
                    'email' => 'certification@iatlms.test',
                    'phone' => '+254 724 000444',
                    'position' => 'certification',
                    'role' => 'Certification Officer',
                    'employee_number' => 'EMP-0303',
                    'job_title' => 'Examinations & Certification Officer',
                ],
            ];

            foreach ($workflowStaff as $staff) {

                $user = $getUser([
                    'first_name' => $staff['first_name'],
                    'middle_name' => $staff['middle_name'],
                    'last_name' => $staff['last_name'],
                    'email' => $staff['email'],
                    'phone' => $staff['phone'],
                    'branch_id' => $branches['NRB']->id,
                    'department_id' => $departments['BA-NRB']->id,
                    'position_id' => $positions[$staff['position']]->id,
                ]);

                $user->assignRole($staff['role']);

                StaffProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'employee_number' => $staff['employee_number'],
                        'employment_date' => '2026-01-05',
                        'employment_type' => 'full_time',
                        'job_title' => $staff['job_title'],
                        'status' => 'active',
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 13. Guardians
            |--------------------------------------------------------------------------
            */

            $guardianA = Guardian::updateOrCreate(
                [
                    'organization_id' => $org->id,
                    'email' => 'j.kariuki@guardian.test',
                ],
                [
                    'first_name' => 'Joseph',
                    'last_name' => 'Kariuki',
                    'phone' => '+254 720 999111',
                    'address' => 'Westlands, Nairobi',
                    'occupation' => 'Business Consultant',
                ]
            );

            $guardianB = Guardian::updateOrCreate(
                [
                    'organization_id' => $org->id,
                    'email' => 'm.wambui@guardian.test',
                ],
                [
                    'first_name' => 'Mary',
                    'last_name' => 'Wambui',
                    'phone' => '+254 720 999222',
                    'address' => 'Embu Town',
                    'occupation' => 'Education Officer',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 14. Students
            |--------------------------------------------------------------------------
            */

            $studentsData = [
                [
                    'first_name' => 'John',
                    'middle_name' => 'K.',
                    'last_name' => 'Mwangi',
                    'email' => 'student.john@iatlms.test',
                    'phone' => '+254 712 111222',
                    'student_number' => 'SOFS-2026-0001',
                    'branch' => 'NRB',
                    'gender' => 'male',
                    'dob' => '2002-05-14',
                    'guardian' => $guardianA,
                    'relationship' => 'Father',
                ],
                [
                    'first_name' => 'Jane',
                    'middle_name' => 'Akinyi',
                    'last_name' => 'Oduor',
                    'email' => 'student.jane@iatlms.test',
                    'phone' => '+254 712 333444',
                    'student_number' => 'SOFS-2026-0002',
                    'branch' => 'NRB',
                    'gender' => 'female',
                    'dob' => '2003-08-22',
                    'guardian' => $guardianA,
                    'relationship' => 'Sponsor',
                ],
                [
                    'first_name' => 'Alex',
                    'middle_name' => 'Mutua',
                    'last_name' => 'Kioko',
                    'email' => 'student.alex@iatlms.test',
                    'phone' => '+254 712 555666',
                    'student_number' => 'SOFS-2026-0003',
                    'branch' => 'EMB',
                    'gender' => 'male',
                    'dob' => '2001-11-30',
                    'guardian' => $guardianB,
                    'relationship' => 'Mother',
                ],
                [
                    'first_name' => 'Brian',
                    'middle_name' => 'Kipkemboi',
                    'last_name' => 'Ruto',
                    'email' => 'student.brian@iatlms.test',
                    'phone' => '+254 712 777888',
                    'student_number' => 'SOFS-2026-0004',
                    'branch' => 'EMB',
                    'gender' => 'male',
                    'dob' => '2002-02-18',
                    'guardian' => $guardianB,
                    'relationship' => 'Guardian',
                ],
                [
                    'first_name' => 'Diana',
                    'middle_name' => 'Chebet',
                    'last_name' => 'Koech',
                    'email' => 'student.diana@iatlms.test',
                    'phone' => '+254 712 999000',
                    'student_number' => 'SOFS-2026-0005',
                    'branch' => 'MRU',
                    'gender' => 'female',
                    'dob' => '2003-04-10',
                    'guardian' => $guardianA,
                    'relationship' => 'Legal Guardian',
                ],
            ];

            foreach ($studentsData as $student) {

                $studentUser = $getUser([
                    'first_name' => $student['first_name'],
                    'middle_name' => $student['middle_name'],
                    'last_name' => $student['last_name'],
                    'email' => $student['email'],
                    'phone' => $student['phone'],
                    'branch_id' => $branches[$student['branch']]->id,
                ]);

                $studentUser->assignRole('Student');

                $profile = StudentProfile::firstOrCreate(
                    [
                        'user_id' => $studentUser->id,
                    ],
                    [
                        'student_number' => $student['student_number'],
                        'admission_date' => '2026-01-05',
                        'date_of_birth' => $student['dob'],
                        'gender' => $student['gender'],
                        'national_id' => 'STU-NAT-'.rand(10000000, 99999999),
                        'emergency_contact_name' => 'Primary Guardian',
                        'emergency_contact_phone' => '+254 720 000999',
                        'status' => 'active',
                    ]
                );

                $profile->update([
                    'student_number' => $student['student_number'],
                    'admission_date' => '2026-01-05',
                    'date_of_birth' => $student['dob'],
                    'gender' => $student['gender'],
                    'emergency_contact_name' => 'Primary Guardian',
                    'emergency_contact_phone' => '+254 720 000999',
                    'status' => 'active',
                ]);

                $profile->guardians()->syncWithoutDetaching([
                    $student['guardian']->id => [
                        'relationship' => $student['relationship'],
                        'is_emergency_contact' => true,
                        'is_primary_contact' => true,
                    ],
                ]);
            }

            $this->command?->info(
                'OrganizationSeeder completed successfully.'
            );
        });
    }
}
