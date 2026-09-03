<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseCurriculumSeeder extends Seeder
{
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
