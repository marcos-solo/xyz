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

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->string('target_type')->toString());
        }

        if ($request->filled('from_date')) {
            $query->whereDate('publish_at', '>=', $request->date('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('publish_at', '<=', $request->date('to_date'));
        }

        if ($user->hasRole('Student')) {
            $query->where('status', 'published')
                ->where('publish_at', '<=', now())
                ->where(function ($q) use ($user) {
                    $q->where('target_type', 'all')
                        ->orWhere(fn ($sq) => $sq->where('target_type', 'branch')->where('target_id', $user->branch_id))
                        ->orWhere(fn ($sq) => $sq->where('target_type', 'role')->where('target_id', 7)); // Student role
                });
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $paginated = $query->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Announcements retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
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
