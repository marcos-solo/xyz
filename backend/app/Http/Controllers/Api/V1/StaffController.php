<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\StaffProfile;
use App\Models\Branch;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('staff.view')) {
            return ApiResponse::forbidden();
        }

        $query = StaffProfile::with(['user.branch', 'user.department', 'user.position', 'user.roles']);

        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('user', fn($q) => $q->where('branch_id', $authUser->branch_id));
        } elseif ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->whereHas('user', fn($q) => $q->where('branch_id', $branch->id));
            }
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('employee_number', 'like', "%{$term}%")
                  ->orWhere('job_title', 'like', "%{$term}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('first_name', 'like', "%{$term}%")->orWhere('last_name', 'like', "%{$term}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Staff list retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function show(StaffProfile $staff): JsonResponse
    {
        return ApiResponse::success($staff->load(['user.branch', 'user.department', 'user.position', 'user.roles', 'user.batchTrainers.batch.course']));
    }

    public function update(Request $request, StaffProfile $staff): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('staff.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'job_title' => ['sometimes', 'required', 'string', 'max:255'],
            'employee_number' => ['nullable', 'string', 'max:50'],
            'employment_type' => ['nullable', 'in:full_time,part_time,contract'],
            'specialization' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,on_leave,terminated'],
        ]);

        $old = $staff->toArray();
        $staff->update($validated);
        AuditLogService::log('staff.update', $staff, $old, $staff->toArray());

        return ApiResponse::success($staff->load(['user.branch', 'user.department', 'user.position', 'user.roles']), 'Staff profile updated.');
    }

    public function destroy(Request $request, StaffProfile $staff): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('staff.delete')) {
            return ApiResponse::forbidden();
        }

        $staff->update(['status' => 'terminated']);
        if ($staff->user) {
            $staff->user->update(['status' => 'inactive']);
        }

        AuditLogService::log('staff.delete', $staff);

        return ApiResponse::success(null, 'Staff member archived.');
    }
}
