<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('unit_code')->nullable(); // e.g. FFA, FA2, CL, TX, FR, FM
            $table->enum('period', ['beginning', 'middle', 'exit', 'lesson', 'general'])->default('general');
            $table->unsignedTinyInteger('rating')->default(5); // 1-5 scale
            $table->string('category')->default('Course Delivery');
            $table->text('comments')->nullable();
            $table->json('metrics')->nullable();
            $table->enum('status', ['submitted', 'reviewed', 'actioned'])->default('submitted');
            $table->timestamps();

            $table->index(['batch_id', 'period']);
            $table->index(['trainer_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_feedbacks');
    }
};
