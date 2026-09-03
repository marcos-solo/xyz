<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ClassSession;
use App\Models\CourseBatch;
use App\Models\Branch;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = ClassSession::with(['batch.course', 'batch.branch', 'trainer', 'attendanceSession']);

        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('batch', fn($q) => $q->where('branch_id', $authUser->branch_id));
        }

        if ($request->filled('batch_uuid')) {
            $batch = CourseBatch::where('uuid', $request->batch_uuid)->first();
            if ($batch) {
                $query->where('batch_id', $batch->id);
            }
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }

        if ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->whereHas('batch', fn($q) => $q->where('branch_id', $branch->id));
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->orderBy('date')->orderBy('start_time')->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Class sessions retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('classes.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'topic' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'delivery_mode' => ['required', 'in:Physical,Online,Hybrid'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ]);

        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();

        $session = ClassSession::create([
            'batch_id' => $batch->id,
            'trainer_id' => $validated['trainer_id'] ?? $authUser->id,
            'title' => $validated['title'],
            'topic' => $validated['topic'] ?? null,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'delivery_mode' => $validated['delivery_mode'],
            'location' => $validated['location'] ?? null,
            'meeting_url' => $validated['meeting_url'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'scheduled',
        ]);

        AuditLogService::log('class_session.create', $session, null, $session->toArray());

        return ApiResponse::success($session->load(['batch.course', 'trainer']), 'Class session scheduled.', 201);
    }

    public function show(ClassSession $classSession): JsonResponse
    {
        return ApiResponse::success($classSession->load(['batch.course', 'trainer', 'attendanceSession.records.student']));
    }
}
