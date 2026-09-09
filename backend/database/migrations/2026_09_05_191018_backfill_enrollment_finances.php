<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $enrollmentIds = DB::table('enrollments')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('enrollment_finances')
                    ->whereColumn('enrollment_finances.enrollment_id', 'enrollments.id');
            })
            ->pluck('id');

        foreach ($enrollmentIds as $enrollmentId) {
            DB::table('enrollment_finances')->insert([
                'enrollment_id' => $enrollmentId,
                'total_fee' => 0,
                'amount_paid' => 0,
                'currency' => 'KES',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('enrollment_finances')
            ->where('total_fee', 0)
            ->where('amount_paid', 0)
            ->where('status', 'pending')
            ->delete();
    }
};
