<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Announcement;
use App\Models\Organization;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Announcement::with('creator')->latest('publish_at');

        if ($user->hasRole('Student')) {
            $query->where('status', 'published')
                ->where('publish_at', '<=', now())
                ->where(function ($q) use ($user) {
                    $q->where('target_type', 'all')
                      ->orWhere(fn($sq) => $sq->where('target_type', 'branch')->where('target_id', $user->branch_id))
                      ->orWhere(fn($sq) => $sq->where('target_type', 'role')->where('target_id', 7)); // Student role
                });
        }

        return ApiResponse::success($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $org = Organization::first();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'target_type' => ['required', 'in:all,branch,department,course,batch,role,users'],
            'target_id' => ['nullable', 'integer'],
            'publish_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $announcement = Announcement::create(array_merge($validated, [
            'organization_id' => $org->id,
            'created_by' => $user->id,
            'status' => 'published',
        ]));

        AuditLogService::log('announcement.create', $announcement);

        return ApiResponse::success($announcement->load('creator'), 'Announcement posted.', 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return ApiResponse::success($announcement->load('creator'));
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'message' => ['sometimes', 'required', 'string'],
            'target_type' => ['sometimes', 'required', 'in:all,branch,department,course,batch,role,users'],
            'target_id' => ['nullable', 'integer'],
            'publish_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $old = $announcement->toArray();
        $announcement->update($validated);
        AuditLogService::log('announcement.update', $announcement, $old, $announcement->toArray());

        return ApiResponse::success($announcement->load('creator'), 'Announcement updated.');
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();
        AuditLogService::log('announcement.delete', $announcement);

        return ApiResponse::success(null, 'Announcement deleted.');
    }
}
