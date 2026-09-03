<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_categories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('course_categories')->restrictOnDelete();
            $table->string('code', 50);
            $table->string('name');
            $table->string('short_description', 500)->nullable();
            $table->longText('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('duration')->default(40);
            $table->enum('duration_unit', ['hours', 'days', 'weeks', 'months'])->default('hours');
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced', 'Professional'])->default('Beginner');
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'code']);
            $table->index('status');
        });

        Schema::create('course_modules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(1);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['course_id', 'order']);
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('module_id')->constrained('course_modules')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('content_type', ['video', 'pdf', 'document', 'presentation', 'audio', 'external_link', 'text', 'scorm'])->default('text');
            $table->longText('content')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->string('file_path')->nullable();
            $table->string('external_url', 500)->nullable();
            $table->unsignedInteger('duration')->nullable(); // in minutes
            $table->unsignedInteger('order')->default(1);
            $table->boolean('is_preview')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['module_id', 'order']);
        });

        Schema::create('lesson_resources', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title');
            $table->string('file_path');
            $table->string('file_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_resources');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('course_modules');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('course_categories');
    }
};
