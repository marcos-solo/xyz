<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('workflow_stage', 40)->default('registered')->after('status');
            $table->foreignId('workflow_updated_by')->nullable()->after('workflow_stage')->constrained('users')->nullOnDelete();
            $table->timestamp('workflow_updated_at')->nullable()->after('workflow_updated_by');
            $table->foreignId('finance_cleared_by')->nullable()->after('workflow_updated_at')->constrained('users')->nullOnDelete();
            $table->timestamp('finance_cleared_at')->nullable()->after('finance_cleared_by');
            $table->index('workflow_stage');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['workflow_updated_by']);
            $table->dropForeign(['finance_cleared_by']);
            $table->dropIndex(['workflow_stage']);
            $table->dropColumn([
                'workflow_stage',
                'workflow_updated_by',
                'workflow_updated_at',
                'finance_cleared_by',
                'finance_cleared_at',
            ]);
        });
    }
};
