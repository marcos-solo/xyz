<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradebookAndAssessmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_trainer_can_view_batch_gradebook(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();
        $batch = CourseBatch::whereHas('assessments')->whereHas('enrollments')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/batches/{$batch->uuid}/gradebook");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'batch' => ['uuid', 'name', 'code'],
                    'assessments',
                    'matrix',
                ],
            ]);
    }

    public function test_trainer_can_record_assessment_marks_and_recalculate_gradebook(): void
    {
        $admin = User::role('Super Admin')->firstOrFail();
        $batch = CourseBatch::whereHas('assessments')->whereHas('enrollments')->firstOrFail();
        $assessment = Assessment::where('batch_id', $batch->id)->firstOrFail();
        $enrollment = Enrollment::where('batch_id', $batch->id)->firstOrFail();
        $student = $enrollment->student;

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/batches/{$batch->uuid}/gradebook/mark", [
                'student_uuid' => $student->uuid,
                'assessment_uuid' => $assessment->uuid,
                'score' => 88.5,
                'feedback' => 'Commendable exam work and accurate double-entry reconciliation.',
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Assessment mark recorded successfully.',
            ]);

        // Verify the student row in the returned matrix reflects the mark
        $matrix = $response->json('data.matrix');
        $studentRow = collect($matrix)->firstWhere('student_uuid', $student->uuid);

        $this->assertNotNull($studentRow);
        $this->assertEquals(88.5, $studentRow['assessments'][$assessment->uuid]['score']);
        $this->assertGreaterThan(0, $studentRow['total_weighted_score']);
    }
}
