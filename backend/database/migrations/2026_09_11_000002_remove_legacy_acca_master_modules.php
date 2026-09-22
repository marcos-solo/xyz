<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $masterId = DB::table('courses')->where('code', 'ACCA')->value('id');

        if (! $masterId) {
            return;
        }

        DB::table('courses')->where('id', $masterId)->update(['paper_count' => 22, 'updated_at' => now()]);
        DB::table('course_modules')
            ->where('course_id', $masterId)
            ->whereNull('unit_id')
            ->update(['deleted_at' => now(), 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Legacy modules are intentionally not restored after consolidation.
    }
};
