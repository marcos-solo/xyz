<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use App\Models\AssignmentSubmission;
use App\Models\CourseBatch;
use App\Models\GradingScaleRange;
use App\Models\GradingScheme;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssessmentAndGradingSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::first();
        $batch = CourseBatch::where('code', 'CCNA-2026-JAN-NRB')->first();
        $trainer = User::where('email', 'trainer.nairobi@iatlms.test')->first();

        $studentJohn = User::where('email', 'student.john@iatlms.test')->first();
        $studentJane = User::where('email', 'student.jane@iatlms.test')->first();

        // 1. Standard Grading Scheme
        $scheme = GradingScheme::create([
            'organization_id' => $org->id,
            'name' => 'Standard Academic Percentage Scheme (Kenya TVET / Higher Ed)',
            'is_default' => true,
        ]);

        $ranges = [
            ['grade_letter' => 'A', 'min_percentage' => 80.00, 'max_percentage' => 100.00, 'gpa_point' => 4.00, 'description' => 'Distinction / Excellent'],
            ['grade_letter' => 'B', 'min_percentage' => 70.00, 'max_percentage' => 79.99, 'gpa_point' => 3.00, 'description' => 'Credit / Very Good'],
            ['grade_letter' => 'C', 'min_percentage' => 60.00, 'max_percentage' => 69.99, 'gpa_point' => 2.00, 'description' => 'Pass / Good'],
            ['grade_letter' => 'D', 'min_percentage' => 50.00, 'max_percentage' => 59.99, 'gpa_point' => 1.00, 'description' => 'Satisfactory'],
            ['grade_letter' => 'F', 'min_percentage' => 0.00, 'max_percentage' => 49.99, 'gpa_point' => 0.00, 'description' => 'Fail / Unsatisfactory'],
        ];
        foreach ($ranges as $range) {
            GradingScaleRange::create(array_merge($range, ['scheme_id' => $scheme->id]));
        }

        // 2. Assessments
        // Assessment 1: Quiz (Weight: 20%)
        $quiz = Assessment::create([
            'organization_id' => $org->id,
            'batch_id' => $batch->id,
            'title' => 'CCNA Module 1 Quiz: Network Protocols & Subnetting',
            'description' => 'Timed quiz covering OSI layers, TCP vs UDP, and binary IPv4 subnetting calculations.',
            'type' => 'Quiz',
            'weight_percentage' => 20.00,
            'total_marks' => 100.00,
            'pass_mark' => 60.00,
            'time_limit' => 30, // 30 mins
            'attempts_allowed' => 2,
            'randomize_questions' => true,
            'randomize_options' => true,
            'show_immediate_results' => true,
            'show_correct_answers' => true,
            'due_date' => now()->addDays(10),
            'status' => 'published',
            'created_by' => $trainer->id,
        ]);

        // Question 1: Multiple Choice
        $q1 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'Which OSI model layer is responsible for logical IP addressing and best path determination?',
            'question_type' => 'Multiple Choice',
            'marks' => 25.00,
            'explanation' => 'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and routing.',
            'difficulty' => 'Easy',
            'order' => 1,
        ]);
        $opt1_1 = AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Data Link Layer (Layer 2)', 'is_correct' => false, 'order' => 1]);
        $opt1_2 = AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Network Layer (Layer 3)', 'is_correct' => true, 'order' => 2]);
        $opt1_3 = AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Transport Layer (Layer 4)', 'is_correct' => false, 'order' => 3]);
        $opt1_4 = AssessmentOption::create(['question_id' => $q1->id, 'option_text' => 'Session Layer (Layer 5)', 'is_correct' => false, 'order' => 4]);

        // Question 2: Subnetting calculation
        $q2 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'What is the usable host range for the subnet 192.168.10.64/26?',
            'question_type' => 'Multiple Choice',
            'marks' => 25.00,
            'explanation' => 'With /26, block size is 64. Subnet: 192.168.10.64, First usable: .65, Last usable: .126, Broadcast: .127.',
            'difficulty' => 'Medium',
            'order' => 2,
        ]);
        $opt2_1 = AssessmentOption::create(['question_id' => $q2->id, 'option_text' => '192.168.10.65 to 192.168.10.126', 'is_correct' => true, 'order' => 1]);
        $opt2_2 = AssessmentOption::create(['question_id' => $q2->id, 'option_text' => '192.168.10.64 to 192.168.10.127', 'is_correct' => false, 'order' => 2]);
        $opt2_3 = AssessmentOption::create(['question_id' => $q2->id, 'option_text' => '192.168.10.65 to 192.168.10.127', 'is_correct' => false, 'order' => 3]);
        $opt2_4 = AssessmentOption::create(['question_id' => $q2->id, 'option_text' => '192.168.10.1 to 192.168.10.62', 'is_correct' => false, 'order' => 4]);

        // Question 3: True / False
        $q3 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'UDP (User Datagram Protocol) provides guaranteed delivery via 3-way handshakes and sequence numbers.',
            'question_type' => 'True/False',
            'marks' => 25.00,
            'explanation' => 'False. TCP provides connection-oriented reliable delivery; UDP is connectionless and best-effort.',
            'difficulty' => 'Easy',
            'order' => 3,
        ]);
        $opt3_1 = AssessmentOption::create(['question_id' => $q3->id, 'option_text' => 'True', 'is_correct' => false, 'order' => 1]);
        $opt3_2 = AssessmentOption::create(['question_id' => $q3->id, 'option_text' => 'False', 'is_correct' => true, 'order' => 2]);

        // Question 4: Short Answer
        $q4 = AssessmentQuestion::create([
            'assessment_id' => $quiz->id,
            'question_text' => 'What is the default administrative distance of an internal OSPF route in Cisco IOS?',
            'question_type' => 'Multiple Choice',
            'marks' => 25.00,
            'explanation' => 'The default administrative distance for OSPF is 110.',
            'difficulty' => 'Medium',
            'order' => 4,
        ]);
        $opt4_1 = AssessmentOption::create(['question_id' => $q4->id, 'option_text' => '90', 'is_correct' => false, 'order' => 1]);
        $opt4_2 = AssessmentOption::create(['question_id' => $q4->id, 'option_text' => '110', 'is_correct' => true, 'order' => 2]);
        $opt4_3 = AssessmentOption::create(['question_id' => $q4->id, 'option_text' => '120', 'is_correct' => false, 'order' => 3]);
        $opt4_4 = AssessmentOption::create(['question_id' => $q4->id, 'option_text' => '1', 'is_correct' => false, 'order' => 4]);

        // Assessment 2: CAT (Weight: 20%)
        $cat = Assessment::create([
            'organization_id' => $org->id,
            'batch_id' => $batch->id,
            'title' => 'CCNA Continuous Assessment Test 1 (CAT 1)',
            'description' => 'Mid-term evaluation covering Switching, VLANs, Inter-VLAN Routing, and Static Routing.',
            'type' => 'CAT',
            'weight_percentage' => 20.00,
            'total_marks' => 100.00,
            'pass_mark' => 50.00,
            'time_limit' => 60,
            'due_date' => now()->addDays(20),
            'status' => 'published',
            'created_by' => $trainer->id,
        ]);

        // Assessment 3: Assignment (Weight: 20%)
        $assignment = Assessment::create([
            'organization_id' => $org->id,
            'batch_id' => $batch->id,
            'title' => 'Enterprise Campus Network Topology Design & Packet Tracer Lab',
            'description' => 'Design a multi-branch network topology with 3 VLANs, DHCP snooping, trunking, and OSPF routing. Submit your .pkt file and design PDF.',
            'type' => 'Assignment',
            'weight_percentage' => 20.00,
            'total_marks' => 100.00,
            'pass_mark' => 50.00,
            'due_date' => now()->addDays(14),
            'status' => 'published',
            'created_by' => $trainer->id,
        ]);

        // Assessment 4: Final Exam (Weight: 40%)
        $exam = Assessment::create([
            'organization_id' => $org->id,
            'batch_id' => $batch->id,
            'title' => 'CCNA 200-301 Comprehensive Final Examination',
            'description' => 'Official final examination assessing all Cisco CCNA curriculum competencies.',
            'type' => 'Final Examination',
            'weight_percentage' => 40.00,
            'total_marks' => 100.00,
            'pass_mark' => 70.00,
            'time_limit' => 120,
            'due_date' => now()->addDays(45),
            'status' => 'published',
            'created_by' => $trainer->id,
        ]);

        // 3. Quiz Attempts
        // John: Quiz 80% (3 out of 4 correct -> score 80 / 100)
        $attemptJohn = AssessmentAttempt::create([
            'assessment_id' => $quiz->id,
            'student_id' => $studentJohn->id,
            'attempt_number' => 1,
            'started_at' => now()->subDays(5),
            'submitted_at' => now()->subDays(5)->addMinutes(18),
            'score' => 80.00,
            'percentage' => 80.00,
            'passed' => true,
            'status' => 'graded',
        ]);
        AssessmentAnswer::create(['attempt_id' => $attemptJohn->id, 'question_id' => $q1->id, 'selected_option_id' => $opt1_2->id, 'marks_awarded' => 25.00]);
        AssessmentAnswer::create(['attempt_id' => $attemptJohn->id, 'question_id' => $q2->id, 'selected_option_id' => $opt2_1->id, 'marks_awarded' => 25.00]);
        AssessmentAnswer::create(['attempt_id' => $attemptJohn->id, 'question_id' => $q3->id, 'selected_option_id' => $opt3_2->id, 'marks_awarded' => 25.00]);
        AssessmentAnswer::create(['attempt_id' => $attemptJohn->id, 'question_id' => $q4->id, 'selected_option_id' => $opt4_1->id, 'marks_awarded' => 5.00, 'feedback' => 'Close, but OSPF default AD is 110.']);

        // Jane: Quiz 90%
        $attemptJane = AssessmentAttempt::create([
            'assessment_id' => $quiz->id,
            'student_id' => $studentJane->id,
            'attempt_number' => 1,
            'started_at' => now()->subDays(5),
            'submitted_at' => now()->subDays(5)->addMinutes(15),
            'score' => 90.00,
            'percentage' => 90.00,
            'passed' => true,
            'status' => 'graded',
        ]);

        // CAT attempts
        AssessmentAttempt::create([
            'assessment_id' => $cat->id,
            'student_id' => $studentJohn->id,
            'attempt_number' => 1,
            'started_at' => now()->subDays(3),
            'submitted_at' => now()->subDays(3)->addMinutes(45),
            'score' => 75.00,
            'percentage' => 75.00,
            'passed' => true,
            'status' => 'graded',
        ]);
        AssessmentAttempt::create([
            'assessment_id' => $cat->id,
            'student_id' => $studentJane->id,
            'attempt_number' => 1,
            'started_at' => now()->subDays(3),
            'submitted_at' => now()->subDays(3)->addMinutes(40),
            'score' => 88.00,
            'percentage' => 88.00,
            'passed' => true,
            'status' => 'graded',
        ]);

        // Assignment Submissions
        AssignmentSubmission::create([
            'assessment_id' => $assignment->id,
            'student_id' => $studentJohn->id,
            'batch_id' => $batch->id,
            'submission_text' => 'Completed Packet Tracer simulation for 3-tier campus LAN with redundant core switches and OSPF routing areas.',
            'file_path' => 'submissions/john_mwangi_pkt_lab.pkt',
            'submitted_at' => now()->subDays(2),
            'score' => 90.00,
            'grade' => 'A',
            'feedback' => 'Outstanding VLAN and STP design. Very clean configuration scripts.',
            'graded_by' => $trainer->id,
            'graded_at' => now()->subDay(),
            'status' => 'graded',
        ]);

        AssignmentSubmission::create([
            'assessment_id' => $assignment->id,
            'student_id' => $studentJane->id,
            'batch_id' => $batch->id,
            'submission_text' => 'Packet tracer lab with DHCP failover configuration and access control lists.',
            'file_path' => 'submissions/jane_oduor_lab.pkt',
            'submitted_at' => now()->subDays(2),
            'score' => 85.00,
            'grade' => 'A',
            'feedback' => 'Great execution of Access Control Lists.',
            'graded_by' => $trainer->id,
            'graded_at' => now()->subDay(),
            'status' => 'graded',
        ]);

        // Final Exam attempts
        AssessmentAttempt::create([
            'assessment_id' => $exam->id,
            'student_id' => $studentJohn->id,
            'attempt_number' => 1,
            'started_at' => now()->subDay(),
            'submitted_at' => now()->subDay()->addMinutes(110),
            'score' => 78.00,
            'percentage' => 78.00,
            'passed' => true,
            'status' => 'graded',
        ]);

        AssessmentAttempt::create([
            'assessment_id' => $exam->id,
            'student_id' => $studentJane->id,
            'attempt_number' => 1,
            'started_at' => now()->subDay(),
            'submitted_at' => now()->subDay()->addMinutes(95),
            'score' => 92.00,
            'percentage' => 92.00,
            'passed' => true,
            'status' => 'graded',
        ]);
    }
}
