<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Organization;
use App\Models\SystemSetting;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        return ApiResponse::success($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->can('settings.update')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();
        $validated = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($validated['settings'] as $key => $val) {
            SystemSetting::updateOrCreate(
                ['organization_id' => $org->id, 'key' => $key],
                ['value' => is_array($val) ? json_encode($val) : (string) $val]
            );
        }

        AuditLogService::log('settings.update', $org, null, $validated['settings']);

        return ApiResponse::success(SystemSetting::all()->pluck('value', 'key'), 'Settings updated successfully.');
    }
}
