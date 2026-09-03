<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grading_schemes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('grading_scale_ranges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scheme_id')->constrained('grading_schemes')->cascadeOnDelete();
            $table->string('grade_letter', 10);
            $table->decimal('min_percentage', 5, 2);
            $table->decimal('max_percentage', 5, 2);
            $table->decimal('gpa_point', 3, 2)->nullable();
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['scheme_id', 'min_percentage', 'max_percentage'], 'idx_grade_scheme_range');
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['Quiz', 'Assignment', 'CAT', 'Exam', 'Practical', 'Project', 'Final Examination'])->default('Quiz');
            $table->decimal('weight_percentage', 5, 2)->default(20.00);
            $table->decimal('total_marks', 6, 2)->default(100.00);
            $table->decimal('pass_mark', 6, 2)->default(50.00);
            $table->unsignedInteger('time_limit')->nullable(); // in minutes
            $table->unsignedInteger('attempts_allowed')->default(1);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('randomize_options')->default(false);
            $table->boolean('show_immediate_results')->default(true);
            $table->boolean('show_correct_answers')->default(false);
            $table->timestamp('due_date')->nullable();
            $table->string('resource_file_path')->nullable();
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['batch_id', 'type']);
            $table->index('status');
        });

        Schema::create('assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->longText('question_text');
            $table->enum('question_type', ['Multiple Choice', 'Multiple Select', 'True/False', 'Short Answer', 'Essay', 'Practical/Manual Grading'])->default('Multiple Choice');
            $table->decimal('marks', 5, 2)->default(1.00);
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['Easy', 'Medium', 'Hard'])->default('Medium');
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();

            $table->index(['assessment_id', 'order']);
        });

        Schema::create('assessment_options', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();

            $table->index('question_id');
        });

        Schema::create('assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('score', 6, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->boolean('passed')->nullable();
            $table->enum('status', ['in_progress', 'submitted', 'graded', 'abandoned'])->default('in_progress');
            $table->timestamps();

            $table->unique(['assessment_id', 'student_id', 'attempt_number'], 'uk_assess_student_attempt');
        });

        Schema::create('assessment_answers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('attempt_id')->constrained('assessment_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('assessment_options')->nullOnDelete();
            $table->json('selected_options_json')->nullable();
            $table->longText('text_answer')->nullable();
            $table->decimal('marks_awarded', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();

            $table->index(['attempt_id', 'question_id']);
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->longText('submission_text')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type', 100)->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->decimal('score', 6, 2)->nullable();
            $table->string('grade', 10)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->enum('status', ['submitted', 'graded', 'resubmitted'])->default('submitted');
            $table->timestamps();

            $table->unique(['assessment_id', 'student_id'], 'uk_assignment_student');
            $table->index(['batch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assessment_answers');
        Schema::dropIfExists('assessment_attempts');
        Schema::dropIfExists('assessment_options');
        Schema::dropIfExists('assessment_questions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('grading_scale_ranges');
        Schema::dropIfExists('grading_schemes');
    }
};
