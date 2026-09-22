<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->string('program_level', 100)->nullable()->after('description');
            $table->text('entry_requirements')->nullable()->after('program_level');
            $table->unsignedInteger('paper_count')->nullable()->after('entry_requirements');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->dropColumn(['program_level', 'entry_requirements', 'paper_count']);
        });
    }
};
