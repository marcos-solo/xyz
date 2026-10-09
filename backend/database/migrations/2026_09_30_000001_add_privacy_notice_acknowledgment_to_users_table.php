<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('privacy_notice_accepted_at')->nullable()->after('email_verified_at');
            $table->string('privacy_notice_version', 40)->nullable()->after('privacy_notice_accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['privacy_notice_accepted_at', 'privacy_notice_version']);
        });
    }
};
