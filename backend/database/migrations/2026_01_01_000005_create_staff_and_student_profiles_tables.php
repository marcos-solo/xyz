<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_number', 100)->unique();
            $table->date('employment_date');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'adjunct'])->default('full_time');
            $table->string('job_title')->nullable();
            $table->string('national_id', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 50)->nullable();
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->enum('status', ['active', 'on_leave', 'terminated', 'resigned'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('employee_number');
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('student_number', 100)->unique();
            $table->date('admission_date');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('national_id', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 50)->nullable();
            $table->enum('status', ['active', 'graduated', 'suspended', 'withdrawn', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('student_number');
        });

        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->nullable();
            $table->string('phone', 50);
            $table->text('address')->nullable();
            $table->string('occupation')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('guardian_id')->constrained('guardians')->cascadeOnDelete();
            $table->string('relationship', 100); // Father, Mother, Sponsor, Guardian
            $table->boolean('is_emergency_contact')->default(false);
            $table->boolean('is_primary_contact')->default(false);
            $table->timestamps();

            $table->unique(['student_profile_id', 'guardian_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('staff_profiles');
    }
};
