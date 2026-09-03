<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Organization;
use App\Models\Position;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success(Position::withCount('users')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $org = Organization::first();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $pos = Position::create(array_merge($validated, ['organization_id' => $org->id]));
        AuditLogService::log('position.create', $pos, null, $pos->toArray());

        return ApiResponse::success($pos, 'Position created successfully.', 201);
    }

    public function show(Position $position): JsonResponse
    {
        return ApiResponse::success($position->loadCount('users'));
    }

    public function update(Request $request, Position $position): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $old = $position->toArray();
        $position->update($validated);
        AuditLogService::log('position.update', $position, $old, $position->toArray());

        return ApiResponse::success($position, 'Position updated successfully.');
    }

    public function destroy(Position $position): JsonResponse
    {
        if ($position->users()->exists()) {
            return ApiResponse::error('Cannot delete position assigned to active staff members.', 422);
        }

        $position->delete();
        AuditLogService::log('position.delete', $position);

        return ApiResponse::success(null, 'Position deleted successfully.');
    }
}
