<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Organization;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Branch::with(['manager', 'departments'])->withCount(['users', 'batches']);

        if (! BranchScopeService::canAccessAllBranches($user) && $user->branch_id) {
            $query->where('id', $user->branch_id);
        }

        $branches = $query->get();

        return ApiResponse::success($branches);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('branches.create')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'uppercase'],
            'location' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $branch = Branch::create(array_merge($validated, ['organization_id' => $org->id]));
        AuditLogService::log('branch.create', $branch, null, $branch->toArray());

        return ApiResponse::success($branch->load('manager'), 'Branch created successfully.', 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        return ApiResponse::success($branch->load(['manager', 'departments', 'batches.course']));
    }

    public function update(Request $request, Branch $branch): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('branches.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $old = $branch->toArray();
        $branch->update($validated);
        AuditLogService::log('branch.update', $branch, $old, $branch->toArray());

        return ApiResponse::success($branch->load('manager'), 'Branch updated successfully.');
    }

    public function destroy(Request $request, Branch $branch): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('branches.delete')) {
            return ApiResponse::forbidden();
        }

        if ($branch->batches()->where('status', 'ongoing')->exists()) {
            return ApiResponse::error('Cannot delete branch with ongoing course intakes.', 422);
        }

        $branch->delete();
        AuditLogService::log('branch.delete', $branch);

        return ApiResponse::success(null, 'Branch archived successfully.');
    }
}
