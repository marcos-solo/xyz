<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseCategory;
use App\Models\Enrollment;
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
                    'enrollments' => [
                        '*' => [
                            'progress_percentage',
                            'course_timeline',
                        ],
                    ],
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

    public function test_student_course_plan_only_includes_their_acca_cohort_level(): void
    {
        $student = User::where('email', 'student.john@iatlms.test')->firstOrFail();
        $strategicBatch = CourseBatch::where('code', 'ACCA-SP-2026-SEP-NRB')->firstOrFail();
        $trainer = User::role('Trainer')->firstOrFail();
        $strategicBatch->trainers()->syncWithoutDetaching([$trainer->id]);

        Enrollment::create([
            'student_id' => $student->id,
            'batch_id' => $strategicBatch->id,
            'enrollment_number' => 'ENR-ACCA-SP-TIMELINE-TEST',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Active',
            'workflow_stage' => 'in_training',
            'workflow_updated_at' => now(),
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/dashboard')
            ->assertOk();

        $strategicPlan = collect($response->json('data.enrollments'))
            ->firstWhere('batch_name', $strategicBatch->name);
        $this->assertSame($trainer->uuid, $strategicPlan['trainers'][0]['uuid']);
        $this->assertSame($trainer->email, $strategicPlan['trainers'][0]['email']);
        $paperTitles = collect($strategicPlan['course_timeline'])
            ->where('type', 'coursework')
            ->pluck('title');

        $this->assertCount(2, $paperTitles);
        $this->assertContains('SBR — Strategic Business Reporting', $paperTitles->all());
        $this->assertContains('SBL — Strategic Business Leader', $paperTitles->all());
        $this->assertNotContains('FA1: Recording Financial Transactions', $paperTitles);
        $this->assertNotContains('BT: Business & Technology', $paperTitles);
    }

    public function test_student_course_plan_uses_the_strategic_options_saved_for_their_batch(): void
    {
        $student = User::where('email', 'student.john@iatlms.test')->firstOrFail();
        $strategicBatch = CourseBatch::where('code', 'ACCA-SP-2026-SEP-NRB')->firstOrFail();
        $strategicPapers = $strategicBatch->course->units()
            ->where('title', 'Strategic Professional Level')
            ->with('modules.lessons')
            ->firstOrFail();
        $essentials = $strategicPapers->modules->firstWhere('title', 'Essentials')->lessons;
        $options = $strategicPapers->modules->first(fn ($module) => str_starts_with($module->title, 'Options'))->lessons;
        $strategicBatch->update([
            'curriculum_lesson_uuids' => $essentials->pluck('uuid')->merge($options->take(2)->pluck('uuid'))->all(),
        ]);

        Enrollment::create([
            'student_id' => $student->id,
            'batch_id' => $strategicBatch->id,
            'enrollment_number' => 'ENR-ACCA-SP-OPTIONS-TEST',
            'enrollment_date' => now()->toDateString(),
            'status' => 'Active',
            'workflow_stage' => 'in_training',
            'workflow_updated_at' => now(),
        ]);

        $response = $this->actingAs($student, 'sanctum')->getJson('/api/v1/dashboard')->assertOk();
        $strategicPlan = collect($response->json('data.enrollments'))->firstWhere('batch_name', $strategicBatch->name);
        $paperTitles = collect($strategicPlan['course_timeline'])->where('type', 'coursework')->pluck('title');

        $this->assertCount(4, $paperTitles);
        $this->assertEqualsCanonicalizing(
            $essentials->pluck('title')->merge($options->take(2)->pluck('title'))->all(),
            $paperTitles->all(),
        );
    }

    public function test_admin_can_save_only_two_strategic_option_papers_on_a_batch(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();
        $course = Course::where('code', 'ACCA')->firstOrFail();
        $branch = Branch::firstOrFail();
        $strategicUnit = $course->units()->where('title', 'Strategic Professional Level')->with('modules.lessons')->firstOrFail();
        $essentials = $strategicUnit->modules->firstWhere('title', 'Essentials')->lessons;
        $options = $strategicUnit->modules->first(fn ($module) => str_starts_with($module->title, 'Options'))->lessons;
        $selectedUuids = $essentials->pluck('uuid')->merge($options->take(2)->pluck('uuid'))->values()->all();

        $payload = [
            'course_uuid' => $course->uuid,
            'branch_uuid' => $branch->uuid,
            'name' => 'Strategic Professional Test Cohort',
            'code' => 'ACCA-SP-SELECTION-TEST',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'capacity' => 20,
            'status' => 'upcoming',
            'curriculum_lesson_uuids' => $selectedUuids,
        ];

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/batches', $payload)
            ->assertCreated()
            ->assertJsonPath('data.curriculum_lesson_uuids', $selectedUuids);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/batches', array_merge($payload, [
                'code' => 'ACCA-SP-INVALID-OPTIONS',
                'curriculum_lesson_uuids' => $essentials->pluck('uuid')->merge($options->take(1)->pluck('uuid'))->values()->all(),
            ]))
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Strategic Professional batches require both Essentials papers and exactly two option papers.');
    }
}
