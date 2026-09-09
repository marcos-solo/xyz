<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'like', '%@apexlms.test')
            ->update(['email' => DB::raw("REPLACE(email, '@apexlms.test', '@iatlms.test')")]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('email', 'like', '%@iatlms.test')
            ->update(['email' => DB::raw("REPLACE(email, '@iatlms.test', '@apexlms.test')")]);
    }
};
