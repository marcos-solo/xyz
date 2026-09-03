<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('title')->default('Certificate of Completion');
            $table->text('description')->nullable();
            $table->string('signatory_name');
            $table->string('signatory_title');
            $table->string('signature_image_path')->nullable();
            $table->string('background_image_path')->nullable();
            $table->json('requirements_config'); // {"min_course_progress": 80, "min_attendance": 75, "min_final_score": 50}
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('certificate_number', 100)->unique();
            $table->string('verification_code', 100)->unique();
            $table->foreignId('template_id')->constrained('certificate_templates')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('batch_id')->constrained('course_batches')->restrictOnDelete();
            $table->date('issue_date');
            $table->date('expiry_date')->nullable();
            $table->string('final_grade', 10)->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('qr_code_path')->nullable();
            $table->enum('status', ['issued', 'revoked'])->default('issued');
            $table->text('revoked_reason')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('verification_code');
            $table->index('certificate_number');
            $table->index(['student_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('certificate_templates');
    }
};
