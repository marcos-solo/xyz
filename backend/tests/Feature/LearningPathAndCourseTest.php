<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\LearningPath;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningPathAndCourseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_can_create_and_list_learning_paths(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();
        $category = CourseCategory::firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/learning-paths', [
                'title' => 'Cloud Solutions Architect Track',
                'category_uuid' => $category->uuid,
                'description' => 'Architecting resilient enterprise cloud platforms.',
                'duration' => 80,
                'duration_unit' => 'hours',
                'level' => 'Advanced',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Cloud Solutions Architect Track');

        $listResponse = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/learning-paths');

        $listResponse->assertOk()
            ->assertJsonFragment(['title' => 'Cloud Solutions Architect Track']);
    }

    public function test_admin_can_create_course_assigned_to_learning_path(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();
        $category = CourseCategory::firstOrFail();
        $path = LearningPath::firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/courses', [
                'category_uuid' => $category->uuid,
                'learning_path_uuid' => $path->uuid,
                'code' => 'TEST-PATH-101',
                'name' => 'Advanced Path Course',
                'short_description' => 'A course assigned to a path.',
                'duration' => 4,
                'duration_unit' => 'weeks',
                'level' => 'Intermediate',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.learning_path.uuid', $path->uuid);

        $course = Course::where('code', 'TEST-PATH-101')->firstOrFail();
        $this->assertEquals($path->id, $course->learning_path_id);
    }

    public function test_registration_options_include_learning_path(): void
    {
        $response = $this->getJson('/api/v1/auth/registration-options');

        $response->assertOk();
        $courses = $response->json('data');
        $this->assertNotEmpty($courses);

        // At least one course should have a linked learning path
        $hasLearningPath = collect($courses)->contains(fn ($c) => ! empty($c['learning_path']));
        $this->assertTrue($hasLearningPath);
    }

    public function test_student_dashboard_returns_real_achievements_and_paths(): void
    {
        $student = User::role('Student')->firstOrFail();

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'student',
                    'gamification' => [
                        'points',
                        'current_streak',
                        'streak_days',
                        'achievements',
                    ],
                    'learning_paths',
                    'activities',
                ],
            ]);

        $data = $response->json('data');
        $this->assertIsArray($data['learning_paths']);
        $this->assertIsArray($data['gamification']['achievements']);
        // Verify achievements have realistic attributes
        $firstAch = $data['gamification']['achievements'][0];
        $this->assertArrayHasKey('target', $firstAch);
        $this->assertArrayHasKey('current', $firstAch);
        $this->assertArrayHasKey('progress_percentage', $firstAch);
    }
}
