<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    public static function log(string $action, Model $entity, ?array $oldValues = null, ?array $newValues = null): AuditLog
    {
        $user = auth('sanctum')->user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'organization_id' => $user?->organization_id ?? $entity->organization_id ?? 1,
            'action' => $action,
            'entity_type' => get_class($entity),
            'entity_id' => $entity->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => substr((string) Request::userAgent(), 0, 500),
        ]);
    }
}
