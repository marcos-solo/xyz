<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 50);
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('capacity')->default(30);
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'code']);
            $table->index(['start_date', 'end_date']);
            $table->index('status');
        });

        Schema::create('batch_trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role_type', ['Lead Trainer', 'Assistant Trainer', 'Guest Trainer'])->default('Lead Trainer');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['batch_id', 'trainer_id']);
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->string('enrollment_number', 100)->unique();
            $table->date('enrollment_date');
            $table->enum('status', ['Pending', 'Active', 'Completed', 'Suspended', 'Withdrawn', 'Cancelled'])->default('Active');
            $table->date('completion_date')->nullable();
            $table->string('final_grade', 10)->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['student_id', 'batch_id', 'deleted_at'], 'uk_active_student_batch');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('batch_trainers');
        Schema::dropIfExists('course_batches');
    }
};
