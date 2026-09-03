<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Organization;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $org = Organization::first();
        return ApiResponse::success($org);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('Super Admin') && !$user->can('organization.update')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url'],
            'address' => ['nullable', 'string'],
            'settings' => ['nullable', 'array'],
        ]);

        $old = $org->toArray();
        $org->update($validated);
        AuditLogService::log('organization.update', $org, $old, $org->toArray());

        return ApiResponse::success($org, 'Organization settings updated successfully.');
    }
}
