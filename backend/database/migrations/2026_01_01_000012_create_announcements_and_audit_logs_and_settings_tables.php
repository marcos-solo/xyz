<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('title');
            $table->longText('message');
            $table->enum('target_type', ['all', 'branch', 'department', 'course', 'batch', 'role', 'users'])->default('all');
            $table->unsignedBigInteger('target_id')->nullable();
            $table->timestamp('publish_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['published', 'draft', 'archived'])->default('published');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['target_type', 'target_id']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->cascadeOnDelete();
            $table->string('action', 100); // user.create, role.update, marks.change, certificate.revoke
            $table->string('entity_type', 255);
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('key', 100);
            $table->longText('value')->nullable();
            $table->enum('type', ['string', 'integer', 'boolean', 'json', 'file'])->default('string');
            $table->timestamps();

            $table->unique(['organization_id', 'key']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('announcements');
    }
};
