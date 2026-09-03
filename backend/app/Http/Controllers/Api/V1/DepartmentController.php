<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Department;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::with('branch');

        if ($request->has('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->where('branch_id', $branch->id);
            }
        }

        return ApiResponse::success($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $branchId = null;
        if ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $branchId = $branch->id;
            }
        }

        $dept = Department::create([
            'branch_id' => $branchId,
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'status' => 'active',
        ]);

        AuditLogService::log('department.create', $dept, null, $dept->toArray());

        return ApiResponse::success($dept->load('branch'), 'Department created.', 201);
    }

    public function show(Department $department): JsonResponse
    {
        return ApiResponse::success($department->load('branch'));
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $request->validate([
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $old = $department->toArray();

        $updateData = [
            'name' => $request->name ?? $department->name,
            'code' => $request->code ?? $department->code,
            'description' => $request->description ?? $department->description,
        ];

        if ($request->has('branch_uuid')) {
            if ($request->filled('branch_uuid')) {
                $branch = Branch::where('uuid', $request->branch_uuid)->first();
                $updateData['branch_id'] = $branch ? $branch->id : null;
            } else {
                $updateData['branch_id'] = null;
            }
        }

        $department->update($updateData);
        AuditLogService::log('department.update', $department, $old, $department->toArray());

        return ApiResponse::success($department->load('branch'), 'Department updated successfully.');
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->users()->exists()) {
            return ApiResponse::error('Cannot delete department with assigned users/staff.', 422);
        }

        $department->delete();
        AuditLogService::log('department.delete', $department);

        return ApiResponse::success(null, 'Department deleted successfully.');
    }
}
