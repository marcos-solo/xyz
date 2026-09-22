<?php

namespace Tests\Feature;

use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\FeedbackSubmittedNotification;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationAndFeedbackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_student_can_fetch_and_read_notifications(): void
    {
        $student = User::role('Student')->firstOrFail();

        // 1. Fetch notifications
        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'notifications',
                    'unread_count',
                ],
            ]);

        $unreadCount = $response->json('data.unread_count');
        $notifications = $response->json('data.notifications');

        if (count($notifications) > 0) {
            $firstId = $notifications[0]['id'];

            // 2. Mark single notification as read
            $this->actingAs($student, 'sanctum')
                ->postJson("/api/v1/notifications/{$firstId}/read")
                ->assertOk();

            // 3. Mark all as read
            $this->actingAs($student, 'sanctum')
                ->postJson('/api/v1/notifications/read-all')
                ->assertOk()
                ->assertJsonPath('data.unread_count', 0);
        }
    }

    public function test_student_can_submit_cohort_feedback_and_notify_staff(): void
    {
        Notification::fake();

        $student = User::role('Student')->firstOrFail();
        $batch = CourseBatch::whereHas('enrollments', fn ($q) => $q->where('student_id', $student->id))->first();

        if (! $batch) {
            $batch = CourseBatch::firstOrFail();
            Enrollment::create([
                'student_id' => $student->id,
                'batch_id' => $batch->id,
                'enrollment_number' => 'ENR-TEST-FB',
                'enrollment_date' => now()->toDateString(),
                'status' => 'Active',
                'workflow_stage' => 'in_training',
            ]);
        }

        $leadTrainer = User::role('Trainer')->firstOrFail();
        $academicManager = User::role('Academic Manager')->firstOrFail();
        $batch->trainers()->syncWithoutDetaching([$leadTrainer->id]);

        $payload = [
            'batch_id' => $batch->id,
            'period' => 'beginning',
            'unit_code' => 'CL',
            'rating' => 5,
            'category' => 'Course Delivery',
            'comments' => 'Clear case analysis and interactive session flow.',
            'metrics' => ['clarity' => 5, 'pacing' => 4],
        ];

        $res = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/feedbacks', $payload)
            ->assertCreated();

        $this->assertDatabaseHas('course_feedbacks', [
            'batch_id' => $batch->id,
            'student_id' => $student->id,
            'unit_code' => 'CL',
            'rating' => 5,
            'status' => 'submitted',
        ]);

        Notification::assertSentTo(
            [$leadTrainer, $academicManager],
            FeedbackSubmittedNotification::class
        );
    }

    public function test_academic_manager_can_view_feedback_list(): void
    {
        $academicManager = User::role('Academic Manager')->firstOrFail();

        $this->actingAs($academicManager, 'sanctum')
            ->getJson('/api/v1/feedbacks')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'feedbacks',
                    'stats' => [
                        'total',
                        'average_rating',
                    ],
                ],
            ]);
    }
}
