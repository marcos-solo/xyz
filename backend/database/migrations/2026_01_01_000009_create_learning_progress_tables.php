<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id', 'batch_id']);
        });

        Schema::create('course_progress', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->decimal('progress_percentage', 5, 2)->default(0.00);
            $table->unsignedInteger('completed_lessons_count')->default(0);
            $table->unsignedInteger('total_lessons_count')->default(0);
            $table->unsignedInteger('completed_modules_count')->default(0);
            $table->unsignedInteger('total_modules_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'batch_id']);
            $table->index('progress_percentage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_progress');
        Schema::dropIfExists('lesson_progress');
    }
};
