<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_units', function (Blueprint $table) {
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

        Schema::table('course_modules', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->after('course_id')->constrained('course_units')->nullOnDelete();
            $table->index(['unit_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::table('course_modules', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropIndex(['unit_id', 'order']);
            $table->dropColumn('unit_id');
        });

        Schema::dropIfExists('course_units');
    }
};