<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get list of notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $user->notifications();

        if ($request->boolean('unread_only')) {
            $query = $user->unreadNotifications();
        }

        $perPage = min((int) $request->get('per_page', 20), 50);
        $paginated = $query->paginate($perPage);

        $notifications = collect($paginated->items())->map(function ($n) {
            $data = is_array($n->data) ? $n->data : json_decode($n->data, true) ?? [];

            return [
                'id' => $n->id,
                'type' => $data['type'] ?? 'general',
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'action_url' => $data['action_url'] ?? null,
                'data' => $data,
                'read_at' => $n->read_at?->toIso8601String(),
                'is_read' => $n->read_at !== null,
                'created_at' => $n->created_at?->toIso8601String(),
                'created_at_human' => $n->created_at?->diffForHumans(),
            ];
        });

        return ApiResponse::success([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ], 'Notifications retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return ApiResponse::error('Notification not found.', 404);
        }

        $notification->markAsRead();

        return ApiResponse::success([
            'unread_count' => $user->unreadNotifications()->count(),
        ], 'Notification marked as read.');
    }

    /**
     * Mark all notifications for the user as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return ApiResponse::success([
            'unread_count' => 0,
        ], 'All notifications marked as read.');
    }
}
