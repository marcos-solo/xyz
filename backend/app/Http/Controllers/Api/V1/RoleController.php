<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * List all dynamic and system roles.
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->get()
            ->map(fn($role) => [
                'uuid' => $role->uuid,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'is_system_protected' => (bool) $role->is_system_protected,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->pluck('name'),
                'permissions_count' => $role->permissions->count(),
            ]);

        return ApiResponse::success($roles);
    }

    /**
     * Create a new dynamic custom role with selected permissions.
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('roles.create')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $org->id,
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'guard_name' => 'sanctum',
            'is_system_protected' => false,
        ]);

        $role->syncPermissions($validated['permissions']);

        AuditLogService::log('role.create', $role, null, [
            'name' => $role->name,
            'permissions' => $validated['permissions'],
        ]);

        return ApiResponse::success($role->load('permissions'), 'Custom role created successfully.', 201);
    }

    /**
     * Show single role and its permission matrix.
     */
    public function show(Role $role): JsonResponse
    {
        return ApiResponse::success([
            'uuid' => $role->uuid,
            'name' => $role->name,
            'display_name' => $role->display_name,
            'description' => $role->description,
            'is_system_protected' => (bool) $role->is_system_protected,
            'permissions' => $role->permissions->pluck('name'),
        ]);
    }

    /**
     * Update role details and assigned permissions.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('roles.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', "unique:roles,name,{$role->id}"],
            'display_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $old = $role->toArray();
        $old['permissions'] = $role->permissions->pluck('name')->toArray();

        // If system protected, retain system name
        if (!$role->is_system_protected && isset($validated['name'])) {
            $role->name = $validated['name'];
        }
        if (isset($validated['display_name'])) {
            $role->display_name = $validated['display_name'];
        }
        if (isset($validated['description'])) {
            $role->description = $validated['description'];
        }
        $role->save();

        $role->syncPermissions($validated['permissions']);

        AuditLogService::log('role.update', $role, $old, [
            'name' => $role->name,
            'permissions' => $validated['permissions'],
        ]);

        return ApiResponse::success($role->load('permissions'), 'Role permissions updated successfully.');
    }

    /**
     * Clone an existing role to easily build variations.
     */
    public function duplicate(Request $request, Role $role): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('roles.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'display_name' => ['required', 'string', 'max:255'],
        ]);

        $newRole = Role::create([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $role->organization_id,
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => "Cloned from {$role->display_name}",
            'guard_name' => 'sanctum',
            'is_system_protected' => false,
        ]);

        $newRole->syncPermissions($role->permissions->pluck('name'));

        AuditLogService::log('role.duplicate', $newRole, ['source_role' => $role->name], ['new_role' => $newRole->name]);

        return ApiResponse::success($newRole->load('permissions'), 'Role duplicated successfully.', 201);
    }

    /**
     * Delete custom role (if not protected).
     */
    public function destroy(Request $request, Role $role): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('roles.delete')) {
            return ApiResponse::forbidden();
        }

        if ($role->is_system_protected) {
            return ApiResponse::error('System-protected roles cannot be deleted.', 422);
        }

        if ($role->users()->count() > 0) {
            return ApiResponse::error('Cannot delete role while active users are assigned to it.', 422);
        }

        $role->delete();
        AuditLogService::log('role.delete', $role);

        return ApiResponse::success(null, 'Role deleted successfully.');
    }
}
