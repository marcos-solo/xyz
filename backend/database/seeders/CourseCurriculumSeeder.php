<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CourseUnit;
use App\Models\Lesson;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseCurriculumSeeder extends Seeder
{
    private function buildAccaLessonContent(string $paper): string
    {
        return "## {$paper}\n\n".
            "### Learning outcomes\n".
            "- explain the main concept of this paper\n".
            "- apply the method in a practical scenario\n".
            "- produce a concise revision summary for mock exam questions\n\n".
            "### Study notes\n".
            "This ACCA paper should be studied as a professional skill and not only a theoretical topic. Students should focus on the logic behind the process, identify how the concept applies in business decisions, and connect it to the broader ACCA syllabus.\n\n".
            "Create a revision sheet for each topic with definitions, examples, and short exam-style application points. This makes it easier to recall the principle when you are under time pressure in an assessment or mock exam.\n\n".
            "### Recommended approach\n".
            "1. Learn the principle and the business context.\n".
            "2. Practise one worked example and one exam question.\n".
            "3. Summarise the answer in your own words for quick revision.\n\n".
            "### Final reminder\n".
            "A strong ACCA study routine combines theory, practice, and regular revision. Keep your notes compact, relevant, and linked to real professional scenarios.\n";
    }

    public function run(): void
    {
        $org = Organization::first();
        $trainer = User::role('Trainer')->first();

        // 1. Categories
        $catNetworking = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => 'Networking & Infrastructure',
            'slug' => 'networking-infrastructure',
            'description' => 'Enterprise networking, Cisco systems, and network architecture',
            'status' => 'active',
        ]);

        $catSecurity = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => 'Cybersecurity & Defense',
            'slug' => 'cybersecurity-defense',
            'description' => 'Information security, ethical hacking, and threat mitigation',
            'status' => 'active',
        ]);

        $catSoftware = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => 'Software Engineering & Web',
            'slug' => 'software-engineering-web',
            'description' => 'Modern full-stack web applications, APIs, and cloud services',
            'status' => 'active',
        ]);

        $catData = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => 'Data Analytics & AI',
            'slug' => 'data-analytics-ai',
            'description' => 'Business intelligence, Power BI, SQL analytics, and visualization',
            'status' => 'active',
        ]);

        $catAcca = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => 'ACCA',
            'slug' => 'acca',
            'description' => 'ACCA foundation, applied knowledge, applied skills, and strategic professional pathways',
            'status' => 'active',
        ]);

        $courseAcca = Course::create([
            'organization_id' => $org->id,
            'category_id' => $catAcca->id,
            'code' => 'ACCA',
            'name' => 'ACCA',
            'short_description' => 'ACCA Foundation, Applied Knowledge, Applied Skills, and Strategic Professional pathways.',
            'description' => 'A single ACCA programme containing every level, paper, and intake.',
            'program_level' => 'Foundation / FIA, Applied Knowledge, Applied Skills, Strategic Professional',
            'paper_count' => 22,
            'duration' => 48,
            'duration_unit' => 'weeks',
            'level' => 'Professional',
            'status' => 'active',
            'created_by' => $trainer?->id,
        ]);

        $accaUnits = [
            ['title' => 'Foundation / FIA', 'description' => 'Foundation in Accountancy pathways.', 'modules' => [['title' => 'RQF Level 2', 'papers' => ['FA1 — Recording Financial Transactions', 'MA1 — Management Information']], ['title' => 'RQF Level 3', 'papers' => ['FA2 — Maintaining Financial Records', 'MA2 — Managing Costs and Finance']], ['title' => 'RQF Level 4', 'papers' => ['FBT — Business & Technology', 'FMA — Management Accounting', 'FFA — Financial Accounting']]]],
            ['title' => 'Applied Knowledge', 'description' => 'The three applied knowledge papers.', 'modules' => [['title' => 'Applied Knowledge Papers', 'papers' => ['AB/BT — Business & Technology', 'MA — Management Accounting', 'FA — Financial Accounting']]]],
            ['title' => 'Applied Skills', 'description' => 'The six applied skills papers.', 'modules' => [['title' => 'Applied Skills Papers', 'papers' => ['CL/LW — Corporate and Business Law', 'PM — Performance Management', 'TX — Taxation', 'FR — Financial Reporting', 'AA — Audit & Assurance', 'FM — Financial Management']]]],
            ['title' => 'Strategic Professional', 'description' => 'Essentials are mandatory. Choose two papers from Options.', 'modules' => [['title' => 'Essentials', 'papers' => ['SBR — Strategic Business Reporting', 'SBL — Strategic Business Leader']], ['title' => 'Options — Choose 2', 'papers' => ['AFM — Advanced Financial Management', 'APM — Advanced Performance Management', 'ATX — Advanced Taxation', 'AAA — Advanced Audit & Assurance']]]],
        ];

        foreach ($accaUnits as $unitIndex => $unitData) {
            $unit = CourseUnit::create(['course_id' => $courseAcca->id, 'title' => $unitData['title'], 'description' => $unitData['description'], 'order' => $unitIndex + 1, 'status' => 'active']);
            foreach ($unitData['modules'] as $moduleIndex => $moduleData) {
                $module = CourseModule::create(['course_id' => $courseAcca->id, 'unit_id' => $unit->id, 'title' => $moduleData['title'], 'order' => $moduleIndex + 1, 'status' => 'active']);
                foreach ($moduleData['papers'] as $paperIndex => $paper) {
                    Lesson::create(['module_id' => $module->id, 'title' => $paper, 'content_type' => 'text', 'content' => $this->buildAccaLessonContent($paper), 'duration' => 180, 'order' => $paperIndex + 1, 'is_preview' => $paperIndex === 0 && $moduleIndex === 0]);
                }
            }
        }

        // 2. Course 1: CCNA Networking
        $courseCcna = Course::create([
            'organization_id' => $org->id,
            'category_id' => $catNetworking->id,
            'code' => 'CCNA-200-301',
            'name' => 'Cisco Certified Network Associate (CCNA)',
            'short_description' => 'Master network fundamentals, IP connectivity, IP services, security, and automation.',
            'description' => 'This comprehensive CCNA training prepares students for modern enterprise network administration. Learn hands-on packet tracing, VLAN configuration, OSPF routing, ACLs, and cloud network architectures.',
            'duration' => 80,
            'duration_unit' => 'hours',
            'level' => 'Intermediate',
            'status' => 'active',
            'created_by' => $trainer?->id,
        ]);

        $modulesCcna = [
            [
                'title' => 'Module 1 — Networking Fundamentals',
                'description' => 'OSI model, TCP/IP, network topologies, IPv4/IPv6 subnetting',
                'order' => 1,
                'lessons' => [
                    [
                        'title' => '1.1 Introduction to Modern Computer Networks',
                        'content_type' => 'text',
                        'content' => '# Introduction to Computer Networks\n\nA network consists of two or more connected computing devices that communicate and share resources.\n\n### Key Concepts:\n- **OSI 7-Layer Architecture**\n- **TCP/IP Protocol Suite**\n- **Packet Switching vs Circuit Switching**',
                        'duration' => 45,
                        'order' => 1,
                        'is_preview' => true,
                    ],
                    [
                        'title' => '1.2 IPv4 Addressing and Binary Subnetting Masterclass',
                        'content_type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        'duration' => 60,
                        'order' => 2,
                        'is_preview' => false,
                    ],
                    [
                        'title' => '1.3 Subnetting Reference Sheet & Practice Guide',
                        'content_type' => 'pdf',
                        'file_path' => 'curriculum/ccna/ipv4_subnetting_guide.pdf',
                        'duration' => 30,
                        'order' => 3,
                        'is_preview' => false,
                    ],
                ],
            ],
            [
                'title' => 'Module 2 — Switching Technologies & VLANs',
                'description' => 'Ethernet switching, 802.1Q trunking, Spanning Tree Protocol (STP), EtherChannel',
                'order' => 2,
                'lessons' => [
                    [
                        'title' => '2.1 Ethernet Frames and MAC Address Tables',
                        'content_type' => 'text',
                        'content' => '## How Layer 2 Switches Forward Traffic\n\nSwitches inspect source MAC addresses to populate the CAM table, and forward based on destination MAC addresses.',
                        'duration' => 40,
                        'order' => 1,
                        'is_preview' => false,
                    ],
                    [
                        'title' => '2.2 Configuring VLANs and 802.1Q Trunks in Cisco IOS',
                        'content_type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        'duration' => 55,
                        'order' => 2,
                        'is_preview' => false,
                    ],
                ],
            ],
            [
                'title' => 'Module 3 — IP Routing and OSPFv2',
                'description' => 'Static routing, default routes, Single-Area OSPFv2 dynamic routing',
                'order' => 3,
                'lessons' => [
                    [
                        'title' => '3.1 Routing Concepts and Administrative Distance',
                        'content_type' => 'text',
                        'content' => '## Understanding IP Routing\n\nRouters determine the best path to remote networks using routing tables populated by static routes or dynamic protocols.',
                        'duration' => 50,
                        'order' => 1,
                        'is_preview' => false,
                    ],
                    [
                        'title' => '3.2 Multi-Area OSPF Configuration Lab',
                        'content_type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        'duration' => 65,
                        'order' => 2,
                        'is_preview' => false,
                    ],
                ],
            ],
            [
                'title' => 'Module 4 — Network Security & Access Control Lists',
                'description' => 'Standard & Extended ACLs, Port Security, DHCP Snooping, Dynamic ARP Inspection',
                'order' => 4,
                'lessons' => [
                    [
                        'title' => '4.1 Implementing Standard and Extended Named ACLs',
                        'content_type' => 'text',
                        'content' => '## Access Control Lists (ACLs)\n\nACLs filter packet traffic based on IP headers, port numbers, and protocol types.',
                        'duration' => 45,
                        'order' => 1,
                        'is_preview' => false,
                    ],
                ],
            ],
        ];

        foreach ($modulesCcna as $modData) {
            $lessons = $modData['lessons'];
            unset($modData['lessons']);
            $module = CourseModule::create(array_merge($modData, ['course_id' => $courseCcna->id]));

            foreach ($lessons as $lessData) {
                Lesson::create(array_merge($lessData, ['module_id' => $module->id]));
            }
        }

        // 3. Course 2: Cybersecurity Fundamentals
        $courseCyber = Course::create([
            'organization_id' => $org->id,
            'category_id' => $catSecurity->id,
            'code' => 'CYBER-101',
            'name' => 'Cybersecurity Fundamentals & Threat Defense',
            'short_description' => 'Learn threat modeling, network defense, incident response, and ethical defense strategies.',
            'description' => 'A hands-on introduction to cyber threats, malware analysis, firewall security architectures, and security operations center (SOC) analysis.',
            'duration' => 60,
            'duration_unit' => 'hours',
            'level' => 'Beginner',
            'status' => 'active',
            'created_by' => $trainer?->id,
        ]);

        $modCyber1 = CourseModule::create([
            'course_id' => $courseCyber->id,
            'title' => 'Module 1 — Threat Landscape and Cryptography',
            'description' => 'Understanding threat vectors, encryption, digital signatures, and PKI',
            'order' => 1,
        ]);
        Lesson::create([
            'module_id' => $modCyber1->id,
            'title' => '1.1 The CIA Triad and Common Attack Vectors',
            'content_type' => 'text',
            'content' => '## Confidentiality, Integrity, and Availability\n\nThe cornerstone of cyber defense systems.',
            'duration' => 30,
            'order' => 1,
            'is_preview' => true,
        ]);

        // 4. Course 3: Data Analysis Using Power BI
        $courseData = Course::create([
            'organization_id' => $org->id,
            'category_id' => $catData->id,
            'code' => 'BI-300',
            'name' => 'Data Analysis and Visualization Using Power BI',
            'short_description' => 'Transform raw datasets into actionable business intelligence dashboards with Power Query and DAX.',
            'description' => 'Comprehensive data analytics training focusing on ETL pipelines, star schema data modeling, advanced DAX calculations, and interactive visual storytelling.',
            'duration' => 45,
            'duration_unit' => 'hours',
            'level' => 'Intermediate',
            'status' => 'active',
            'created_by' => $trainer?->id,
        ]);

        $modData1 = CourseModule::create([
            'course_id' => $courseData->id,
            'title' => 'Module 1 — Data Transformation with Power Query',
            'description' => 'Connecting to diverse sources, data cleaning, and ETL transformations',
            'order' => 1,
        ]);
        Lesson::create([
            'module_id' => $modData1->id,
            'title' => '1.1 Data Ingestion & Shape Transformation',
            'content_type' => 'text',
            'content' => '## Power Query ETL Best Practices\n\nLearn M-code foundations and automated data preparation.',
            'duration' => 40,
            'order' => 1,
            'is_preview' => true,
        ]);
    }
}
