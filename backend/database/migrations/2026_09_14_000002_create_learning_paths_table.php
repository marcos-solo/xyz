<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('course_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('duration')->default(40);
            $table->enum('duration_unit', ['hours', 'weeks', 'months'])->default('hours');
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced', 'Professional'])->default('Intermediate');
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('learning_path_id')->nullable()->after('category_id')->constrained('learning_paths')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['learning_path_id']);
            $table->dropColumn('learning_path_id');
        });

        Schema::dropIfExists('learning_paths');
    }
};
