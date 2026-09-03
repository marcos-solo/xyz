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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Organization
        $org = Organization::create([
            'name' => 'Institute of Advanced Technology Ltd',
            'code' => 'IAT',
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
        ]);

        // System Settings
        $settings = [
            ['key' => 'institution_name', 'value' => 'Institute of Advanced Technology Ltd', 'type' => 'string'],
            ['key' => 'student_number_format', 'value' => '{PREFIX}-{YEAR}-{SEQ:4}', 'type' => 'string'],
            ['key' => 'certificate_number_format', 'value' => 'CERT-{YEAR}-{SEQ:5}', 'type' => 'string'],
            ['key' => 'min_attendance_certificate', 'value' => '75', 'type' => 'integer'],
            ['key' => 'min_progress_certificate', 'value' => '80', 'type' => 'integer'],
            ['key' => 'allow_late_submissions', 'value' => '1', 'type' => 'boolean'],
        ];
        foreach ($settings as $setting) {
            SystemSetting::create(array_merge($setting, ['organization_id' => $org->id]));
        }

        // 2. Create Positions
        $posCeo = Position::create(['organization_id' => $org->id, 'name' => 'Chief Executive Officer', 'description' => 'Executive Management']);
        $posBm = Position::create(['organization_id' => $org->id, 'name' => 'Branch Manager', 'description' => 'Branch Operations & Supervision']);
        $posAm = Position::create(['organization_id' => $org->id, 'name' => 'Academic Manager', 'description' => 'Curriculum and Training Supervision']);
        $posTrainer = Position::create(['organization_id' => $org->id, 'name' => 'Senior Trainer', 'description' => 'Instruction & Assessment']);
        $posAsstTrainer = Position::create(['organization_id' => $org->id, 'name' => 'Assistant Trainer', 'description' => 'Lab Assistance & Tutoring']);
        $posFrontOffice = Position::create(['organization_id' => $org->id, 'name' => 'Admissions Officer', 'description' => 'Student Intake & Registration']);

        // 3. Create Branches
        $branchNrb = Branch::create([
            'organization_id' => $org->id,
            'name' => 'Nairobi Main Campus',
            'code' => 'NRB',
            'location' => 'Nairobi CBD',
            'phone' => '+254 711 000100',
            'email' => 'nairobi@iat.ac.ke',
            'status' => 'active',
        ]);

        $branchEmbu = Branch::create([
            'organization_id' => $org->id,
            'name' => 'Embu Campus',
            'code' => 'EMB',
            'location' => 'Embu Town Centre',
            'phone' => '+254 711 000200',
            'email' => 'embu@iat.ac.ke',
            'status' => 'active',
        ]);

        $branchMeru = Branch::create([
            'organization_id' => $org->id,
            'name' => 'Meru Campus',
            'code' => 'MRU',
            'location' => 'Meru Town',
            'phone' => '+254 711 000300',
            'email' => 'meru@iat.ac.ke',
            'status' => 'active',
        ]);

        $branchMsa = Branch::create([
            'organization_id' => $org->id,
            'name' => 'Mombasa Coastal Campus',
            'code' => 'MSA',
            'location' => 'Nyali, Mombasa',
            'phone' => '+254 711 000400',
            'email' => 'mombasa@iat.ac.ke',
            'status' => 'active',
        ]);

        // 4. Create Departments
        $deptItNrb = Department::create(['branch_id' => $branchNrb->id, 'name' => 'Information Technology', 'code' => 'IT-NRB']);
        $deptBaNrb = Department::create(['branch_id' => $branchNrb->id, 'name' => 'Business Management', 'code' => 'BA-NRB']);
        $deptItEmbu = Department::create(['branch_id' => $branchEmbu->id, 'name' => 'Information Technology', 'code' => 'IT-EMB']);
        $deptItMeru = Department::create(['branch_id' => $branchMeru->id, 'name' => 'Information Technology', 'code' => 'IT-MRU']);

        $defaultPassword = Hash::make(env('DEV_DEFAULT_PASSWORD', 'Password123!'));

        // 5. Super Admin
        $superAdmin = User::create([
            'first_name' => 'Super',
            'middle_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'superadmin@apexlms.test',
            'phone' => '+254 700 000001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posCeo->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('Super Admin');

        StaffProfile::create([
            'user_id' => $superAdmin->id,
            'employee_number' => 'EMP-0001',
            'employment_date' => '2020-01-01',
            'employment_type' => 'full_time',
            'job_title' => 'System Architect & Super Admin',
            'national_id' => 'ID-00000001',
            'address' => 'IAT Towers, Nairobi',
            'status' => 'active',
        ]);

        // 5b. Chief Executive Officer (CEO - Multi-Branch Executive Oversight)
        $ceoUser = User::create([
            'first_name' => 'Dr. Catherine',
            'middle_name' => 'Wanjiku',
            'last_name' => 'Mutua',
            'email' => 'ceo@apexlms.test',
            'phone' => '+254 700 000000',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posCeo->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $ceoUser->assignRole('CEO');

        StaffProfile::create([
            'user_id' => $ceoUser->id,
            'employee_number' => 'EMP-CEO-001',
            'employment_date' => '2018-01-15',
            'employment_type' => 'full_time',
            'job_title' => 'Chief Executive Officer & Executive Director',
            'national_id' => 'ID-10000000',
            'address' => 'IAT Executive Suites, Nairobi',
            'status' => 'active',
        ]);

        // 6. Branch Managers
        // Nairobi Branch Manager
        $bmNairobi = User::create([
            'first_name' => 'Marcus',
            'middle_name' => 'Kamau',
            'last_name' => 'Njoroge',
            'email' => 'bm.nairobi@apexlms.test',
            'phone' => '+254 722 100001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posBm->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $bmNairobi->assignRole('Branch Manager');
        $branchNrb->update(['manager_id' => $bmNairobi->id]);
        StaffProfile::create([
            'user_id' => $bmNairobi->id,
            'employee_number' => 'EMP-0010',
            'employment_date' => '2021-03-01',
            'employment_type' => 'full_time',
            'job_title' => 'Branch Manager - Nairobi',
            'status' => 'active',
        ]);

        // Embu Branch Manager (John Mwangi from spec example)
        $bmEmbu = User::create([
            'first_name' => 'John',
            'middle_name' => 'Kariuki',
            'last_name' => 'Mwangi',
            'email' => 'bm.embu@apexlms.test',
            'phone' => '+254 722 200001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchEmbu->id,
            'department_id' => $deptItEmbu->id,
            'position_id' => $posBm->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $bmEmbu->assignRole('Branch Manager');
        $branchEmbu->update(['manager_id' => $bmEmbu->id]);
        StaffProfile::create([
            'user_id' => $bmEmbu->id,
            'employee_number' => 'EMP-0020',
            'employment_date' => '2022-01-15',
            'employment_type' => 'full_time',
            'job_title' => 'Branch Manager - Embu',
            'status' => 'active',
        ]);

        // 7. Academic Manager
        $acadManager = User::create([
            'first_name' => 'Dr. Catherine',
            'middle_name' => 'Wanjiku',
            'last_name' => 'Mutua',
            'email' => 'academic.manager@apexlms.test',
            'phone' => '+254 722 300001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posAm->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $acadManager->assignRole('Academic Manager');
        StaffProfile::create([
            'user_id' => $acadManager->id,
            'employee_number' => 'EMP-0030',
            'employment_date' => '2021-06-01',
            'employment_type' => 'full_time',
            'job_title' => 'Academic Dean & Manager',
            'status' => 'active',
        ]);

        // 8. Trainers
        // Lead Trainer 1 (Nairobi - Network & Security)
        $trainerNrb = User::create([
            'first_name' => 'David',
            'middle_name' => 'Otieno',
            'last_name' => 'Ochieng',
            'email' => 'trainer.nairobi@apexlms.test',
            'phone' => '+254 723 111001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posTrainer->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $trainerNrb->assignRole('Trainer');
        StaffProfile::create([
            'user_id' => $trainerNrb->id,
            'employee_number' => 'EMP-0101',
            'employment_date' => '2022-04-01',
            'employment_type' => 'full_time',
            'job_title' => 'Lead Cisco & Cyber Trainer',
            'specialization' => 'CCNA, CCNP, Network Security, CyberOps',
            'status' => 'active',
        ]);

        // Lead Trainer 2 (Embu - Web & Data Analytics)
        $trainerEmbu = User::create([
            'first_name' => 'Faith',
            'middle_name' => 'Muthoni',
            'last_name' => 'Kiprono',
            'email' => 'trainer.embu@apexlms.test',
            'phone' => '+254 723 222001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchEmbu->id,
            'department_id' => $deptItEmbu->id,
            'position_id' => $posTrainer->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $trainerEmbu->assignRole('Trainer');
        StaffProfile::create([
            'user_id' => $trainerEmbu->id,
            'employee_number' => 'EMP-0102',
            'employment_date' => '2023-02-01',
            'employment_type' => 'full_time',
            'job_title' => 'Lead Software Engineering Trainer',
            'specialization' => 'Full-Stack Web Dev, Python, Power BI',
            'status' => 'active',
        ]);

        // Assistant Trainer (Nairobi)
        $asstTrainerNrb = User::create([
            'first_name' => 'Samuel',
            'middle_name' => 'Kipchumba',
            'last_name' => 'Korir',
            'email' => 'asst.trainer@apexlms.test',
            'phone' => '+254 723 333001',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptItNrb->id,
            'position_id' => $posAsstTrainer->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $asstTrainerNrb->assignRole('Trainer');
        StaffProfile::create([
            'user_id' => $asstTrainerNrb->id,
            'employee_number' => 'EMP-0103',
            'employment_date' => '2024-01-10',
            'employment_type' => 'contract',
            'job_title' => 'Assistant Lab Trainer',
            'status' => 'active',
        ]);

        // 9. Front Office
        $frontOffice = User::create([
            'first_name' => 'Grace',
            'middle_name' => 'Akinyi',
            'last_name' => 'Odhiambo',
            'email' => 'frontoffice@apexlms.test',
            'phone' => '+254 724 000111',
            'password' => $defaultPassword,
            'organization_id' => $org->id,
            'branch_id' => $branchNrb->id,
            'department_id' => $deptBaNrb->id,
            'position_id' => $posFrontOffice->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $frontOffice->assignRole('Front Office');
        StaffProfile::create([
            'user_id' => $frontOffice->id,
            'employee_number' => 'EMP-0201',
            'employment_date' => '2023-08-01',
            'employment_type' => 'full_time',
            'job_title' => 'Front Desk & Admissions Specialist',
            'status' => 'active',
        ]);

        // 10. Sample Guardians
        $guardianA = Guardian::create([
            'organization_id' => $org->id,
            'first_name' => 'Joseph',
            'last_name' => 'Kariuki',
            'email' => 'j.kariuki@guardian.test',
            'phone' => '+254 720 999111',
            'address' => 'Westlands, Nairobi',
            'occupation' => 'Business Consultant',
        ]);

        $guardianB = Guardian::create([
            'organization_id' => $org->id,
            'first_name' => 'Mary',
            'last_name' => 'Wambui',
            'email' => 'm.wambui@guardian.test',
            'phone' => '+254 720 999222',
            'address' => 'Embu Town',
            'occupation' => 'Education Officer',
        ]);

        // 11. Students (John Doe & Jane Doe from prompt examples + additional students)
        $studentsData = [
            [
                'first_name' => 'John',
                'middle_name' => 'K.',
                'last_name' => 'Mwangi',
                'email' => 'student.john@apexlms.test',
                'phone' => '+254 712 111222',
                'student_number' => 'SOFS-2026-0001',
                'branch_id' => $branchNrb->id,
                'gender' => 'male',
                'dob' => '2002-05-14',
                'guardian_id' => $guardianA->id,
                'relationship' => 'Father',
            ],
            [
                'first_name' => 'Jane',
                'middle_name' => 'Akinyi',
                'last_name' => 'Oduor',
                'email' => 'student.jane@apexlms.test',
                'phone' => '+254 712 333444',
                'student_number' => 'SOFS-2026-0002',
                'branch_id' => $branchNrb->id,
                'gender' => 'female',
                'dob' => '2003-08-22',
                'guardian_id' => $guardianA->id,
                'relationship' => 'Sponsor',
            ],
            [
                'first_name' => 'Alex',
                'middle_name' => 'Mutua',
                'last_name' => 'Kioko',
                'email' => 'student.alex@apexlms.test',
                'phone' => '+254 712 555666',
                'student_number' => 'SOFS-2026-0003',
                'branch_id' => $branchEmbu->id,
                'gender' => 'male',
                'dob' => '2001-11-30',
                'guardian_id' => $guardianB->id,
                'relationship' => 'Mother',
            ],
            [
                'first_name' => 'Brian',
                'middle_name' => 'Kipkemboi',
                'last_name' => 'Ruto',
                'email' => 'student.brian@apexlms.test',
                'phone' => '+254 712 777888',
                'student_number' => 'SOFS-2026-0004',
                'branch_id' => $branchEmbu->id,
                'gender' => 'male',
                'dob' => '2002-02-18',
                'guardian_id' => $guardianB->id,
                'relationship' => 'Guardian',
            ],
            [
                'first_name' => 'Diana',
                'middle_name' => 'Chebet',
                'last_name' => 'Koech',
                'email' => 'student.diana@apexlms.test',
                'phone' => '+254 712 999000',
                'student_number' => 'SOFS-2026-0005',
                'branch_id' => $branchMeru->id,
                'gender' => 'female',
                'dob' => '2003-04-10',
                'guardian_id' => $guardianA->id,
                'relationship' => 'Legal Guardian',
            ],
        ];

        foreach ($studentsData as $st) {
            $studentUser = User::create([
                'first_name' => $st['first_name'],
                'middle_name' => $st['middle_name'],
                'last_name' => $st['last_name'],
                'email' => $st['email'],
                'phone' => $st['phone'],
                'password' => $defaultPassword,
                'organization_id' => $org->id,
                'branch_id' => $st['branch_id'],
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $studentUser->assignRole('Student');

            $profile = StudentProfile::create([
                'user_id' => $studentUser->id,
                'student_number' => $st['student_number'],
                'admission_date' => '2026-01-05',
                'date_of_birth' => $st['dob'],
                'gender' => $st['gender'],
                'national_id' => 'STU-NAT-' . rand(10000000, 99999999),
                'emergency_contact_name' => 'Primary Guardian',
                'emergency_contact_phone' => '+254 720 000999',
                'status' => 'active',
            ]);

            $profile->guardians()->attach($st['guardian_id'], [
                'relationship' => $st['relationship'],
                'is_emergency_contact' => true,
                'is_primary_contact' => true,
            ]);
        }
    }
}
