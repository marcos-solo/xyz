<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('topic')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('delivery_mode', ['Physical', 'Online', 'Hybrid'])->default('Physical');
            $table->string('location')->nullable();
            $table->string('meeting_url', 500)->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['batch_id', 'date']);
            $table->index('trainer_id');
        });

        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('class_session_id')->unique()->constrained('class_sessions')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->cascadeOnDelete();
            $table->foreignId('taken_by')->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->enum('status', ['open', 'closed'])->default('closed');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['batch_id', 'session_date']);
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('attendance_session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['Present', 'Absent', 'Late', 'Excused'])->default('Present');
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['attendance_session_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendance_sessions');
        Schema::dropIfExists('class_sessions');
    }
};
