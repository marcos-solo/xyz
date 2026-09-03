<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Get all available granular permissions grouped by category.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::all();

        $grouped = $permissions->groupBy('group_name')->map(function ($items, $group) {
            return [
                'group' => $group,
                'permissions' => $items->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'display_name' => $p->display_name ?? $p->name,
                    'description' => $p->description,
                ]),
            ];
        })->values();

        return ApiResponse::success($grouped);
    }
}
