<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('audit_logs.view')) {
            return ApiResponse::forbidden();
        }

        $query = AuditLog::with('user')->latest('created_at');
        $this->applyFilters($query, $request);

        $perPage = min($request->get('per_page', 25), 100);
        $paginated = $query->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Audit trail retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function exportCsv(Request $request)
    {
        $user = $request->user();
        if (! $user->can('audit_logs.view')) {
            return ApiResponse::forbidden();
        }

        $query = AuditLog::with('user')->latest('created_at');
        $this->applyFilters($query, $request);

        $records = $query->get();
        $filename = 'audit_logs_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Action', 'Operator', 'Entity', 'Entity ID', 'IP Address', 'Created At', 'Old Values', 'New Values']);

            foreach ($records as $log) {
                fputcsv($handle, [
                    $log->action,
                    $log->user?->full_name ?? 'System Operator',
                    $log->entity_type,
                    $log->entity_id,
                    $log->ip_address ?? 'N/A',
                    $log->created_at?->toDateTimeString(),
                    json_encode($log->old_values ?? []),
                    json_encode($log->new_values ?? []),
                ]);
            }

            fclose($handle);
        }, $filename, $headers);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->can('audit_logs.manage')) {
            return ApiResponse::forbidden();
        }

        $request->validate([
            'action' => ['nullable', 'string'],
            'user_id' => ['nullable', 'integer'],
            'entity_type' => ['nullable', 'string'],
            'entity_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
            'before_date' => ['nullable', 'date'],
            'all' => ['nullable', 'boolean'],
        ]);

        $clearAll = $request->boolean('all', false);
        $hasAnyFilter = $request->filled('action')
            || $request->filled('user_id')
            || $request->filled('entity_type')
            || $request->filled('entity_id')
            || $request->filled('search')
            || $request->filled('from_date')
            || $request->filled('to_date')
            || $request->filled('before_date');

        if (! $clearAll && ! $hasAnyFilter) {
            return ApiResponse::error('Please provide a date range or filter before clearing audit logs, or explicitly clear all logs.', 422);
        }

        $query = AuditLog::query();

        if (! $clearAll) {
            $this->applyFilters($query, $request);
        }

        if ($request->filled('before_date')) {
            $query->whereDate('created_at', '<', $request->date('before_date'));
        }

        $deleted = $query->delete();

        return ApiResponse::success(['deleted' => $deleted], 'Audit logs cleared successfully.');
    }

    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('action')) {
            $query->where('action', 'like', "%{$request->action}%");
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', 'like', '%'.$request->string('entity_type')->toString().'%');
        }

        if ($request->filled('entity_id')) {
            $query->where('entity_id', $request->entity_id);
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search) {
                $builder->where('action', 'like', "%{$search}%")
                    ->orWhere('entity_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->date('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->date('to_date'));
        }
    }
}
