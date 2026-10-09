<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\ClassSession;
use App\Models\CourseBatch;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = ClassSession::with(['batch.course', 'batch.branch', 'trainer', 'attendanceSession.records']);
        $query->whereHas('batch.course');

        if (! BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('batch', fn ($q) => $q->where('branch_id', $authUser->branch_id));
        }

        // Student personal timetable scope: automatically filter to enrolled batches unless all_batches=1
        if ($authUser?->hasRole('Student') && ! $request->boolean('all_batches')) {
            $enrolledBatchIds = $authUser->enrollments()
                ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified'])
                ->pluck('batch_id');
            $query->whereIn('batch_id', $enrolledBatchIds);
        }

        // My schedule filter (for trainers or students explicitly requesting their schedule)
        if ($request->boolean('my_schedule')) {
            if ($authUser->hasRole('Trainer')) {
                $query->where('trainer_id', $authUser->id);
            } elseif ($authUser->hasRole('Student')) {
                $enrolledBatchIds = $authUser->enrollments()
                    ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified'])
                    ->pluck('batch_id');
                $query->whereIn('batch_id', $enrolledBatchIds);
            }
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
                $query->whereHas('batch', fn ($q) => $q->where('branch_id', $branch->id));
            }
        }

        if ($request->filled('delivery_mode')) {
            $query->where('delivery_mode', $request->delivery_mode);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('topic', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('batch', fn ($bq) => $bq->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"))
                    ->orWhereHas('trainer', fn ($tq) => $tq->where('full_name', 'like', "%{$search}%"));
            });
        }

        $perPage = min($request->get('per_page', 50), 200);
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
        if (! $authUser->can('classes.manage')) {
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
            'allow_conflicts' => ['nullable', 'boolean'],
        ]);

        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $trainerId = $validated['trainer_id'] ?? $authUser->id;

        // Check for conflicts
        if (empty($validated['allow_conflicts'])) {
            $conflicts = $this->detectConflicts(
                $validated['date'],
                $validated['start_time'],
                $validated['end_time'],
                $trainerId,
                $batch->id,
                $validated['location'] ?? null
            );

            if (! empty($conflicts)) {
                return ApiResponse::error('Scheduling conflict detected.', 422, ['conflicts' => $conflicts]);
            }
        }

        $session = ClassSession::create([
            'batch_id' => $batch->id,
            'trainer_id' => $trainerId,
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

    public function batchStore(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('classes.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'topic' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'days_of_week' => ['required', 'array', 'min:1'],
            'days_of_week.*' => ['required', 'string'], // e.g. ["Mon", "Wed", "Fri"] or ["1", "3", "5"]
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'delivery_mode' => ['required', 'in:Physical,Online,Hybrid'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ]);

        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $trainerId = $validated['trainer_id'] ?? $authUser->id;

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $daysOfWeek = array_map(fn ($d) => strtolower(substr($d, 0, 3)), $validated['days_of_week']);

        $createdSessions = [];
        $skippedConflicts = [];
        $current = $startDate->copy();
        $sessionNumber = 1;

        while ($current->lte($endDate)) {
            $dayShort = strtolower($current->format('D'));
            if (in_array($dayShort, $daysOfWeek)) {
                $dateStr = $current->toDateString();

                // Check conflict
                $conflicts = $this->detectConflicts(
                    $dateStr,
                    $validated['start_time'],
                    $validated['end_time'],
                    $trainerId,
                    $batch->id,
                    $validated['location'] ?? null
                );

                if (! empty($conflicts)) {
                    $skippedConflicts[] = [
                        'date' => $dateStr,
                        'reason' => implode('; ', $conflicts),
                    ];
                } else {
                    $sessionTitle = $validated['title'];
                    if (! str_contains($sessionTitle, '#')) {
                        $sessionTitle .= " (Session #{$sessionNumber})";
                    }

                    $session = ClassSession::create([
                        'batch_id' => $batch->id,
                        'trainer_id' => $trainerId,
                        'title' => $sessionTitle,
                        'topic' => $validated['topic'] ?? null,
                        'date' => $dateStr,
                        'start_time' => $validated['start_time'],
                        'end_time' => $validated['end_time'],
                        'delivery_mode' => $validated['delivery_mode'],
                        'location' => $validated['location'] ?? null,
                        'meeting_url' => $validated['meeting_url'] ?? null,
                        'notes' => $validated['notes'] ?? null,
                        'status' => 'scheduled',
                    ]);

                    $createdSessions[] = $session;
                    $sessionNumber++;
                }
            }
            $current->addDay();
        }

        AuditLogService::log('class_session.batch_schedule', $batch, null, [
            'created_count' => count($createdSessions),
            'skipped_count' => count($skippedConflicts),
        ]);

        return ApiResponse::success([
            'created_count' => count($createdSessions),
            'skipped_conflicts' => $skippedConflicts,
            'sessions' => $createdSessions,
        ], count($createdSessions).' class sessions generated successfully.', 201);
    }

    public function checkConflicts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'batch_uuid' => ['nullable', 'exists:course_batches,uuid'],
            'location' => ['nullable', 'string'],
            'exclude_session_uuid' => ['nullable', 'exists:class_sessions,uuid'],
        ]);

        $batchId = null;
        if (! empty($validated['batch_uuid'])) {
            $batchId = CourseBatch::where('uuid', $validated['batch_uuid'])->value('id');
        }

        $excludeId = null;
        if (! empty($validated['exclude_session_uuid'])) {
            $excludeId = ClassSession::where('uuid', $validated['exclude_session_uuid'])->value('id');
        }

        $conflicts = $this->detectConflicts(
            $validated['date'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['trainer_id'] ?? null,
            $batchId,
            $validated['location'] ?? null,
            $excludeId
        );

        return ApiResponse::success([
            'has_conflicts' => ! empty($conflicts),
            'conflicts' => $conflicts,
        ], 'Conflict check completed.');
    }

    public function update(Request $request, ClassSession $classSession): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('classes.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'batch_uuid' => ['nullable', 'exists:course_batches,uuid'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'topic' => ['nullable', 'string', 'max:255'],
            'date' => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'date_format:H:i'],
            'end_time' => ['sometimes', 'required', 'date_format:H:i', 'after:start_time'],
            'delivery_mode' => ['sometimes', 'required', 'in:Physical,Online,Hybrid'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url'],
            'status' => ['sometimes', 'required', 'in:scheduled,in_progress,completed,cancelled'],
            'notes' => ['nullable', 'string'],
            'allow_conflicts' => ['nullable', 'boolean'],
        ]);

        $date = $validated['date'] ?? $classSession->date->toDateString();
        $startTime = $validated['start_time'] ?? substr($classSession->start_time, 0, 5);
        $endTime = $validated['end_time'] ?? substr($classSession->end_time, 0, 5);
        $trainerId = $validated['trainer_id'] ?? $classSession->trainer_id;
        $batchId = ! empty($validated['batch_uuid'])
            ? CourseBatch::where('uuid', $validated['batch_uuid'])->value('id')
            : $classSession->batch_id;
        $location = array_key_exists('location', $validated) ? $validated['location'] : $classSession->location;

        if (empty($validated['allow_conflicts']) && ($date !== $classSession->date->toDateString() || $startTime !== substr($classSession->start_time, 0, 5))) {
            $conflicts = $this->detectConflicts($date, $startTime, $endTime, $trainerId, $batchId, $location, $classSession->id);
            if (! empty($conflicts)) {
                return ApiResponse::error('Scheduling conflict detected.', 422, ['conflicts' => $conflicts]);
            }
        }

        $oldData = $classSession->toArray();

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('topic', $validated)) {
            $updateData['topic'] = $validated['topic'];
        }
        if (isset($validated['date'])) {
            $updateData['date'] = $validated['date'];
        }
        if (isset($validated['start_time'])) {
            $updateData['start_time'] = $validated['start_time'];
        }
        if (isset($validated['end_time'])) {
            $updateData['end_time'] = $validated['end_time'];
        }
        if (isset($validated['delivery_mode'])) {
            $updateData['delivery_mode'] = $validated['delivery_mode'];
        }
        if (array_key_exists('location', $validated)) {
            $updateData['location'] = $validated['location'];
        }
        if (array_key_exists('meeting_url', $validated)) {
            $updateData['meeting_url'] = $validated['meeting_url'];
        }
        if (isset($validated['status'])) {
            $updateData['status'] = $validated['status'];
        }
        if (array_key_exists('notes', $validated)) {
            $updateData['notes'] = $validated['notes'];
        }
        if ($batchId) {
            $updateData['batch_id'] = $batchId;
        }
        if ($trainerId) {
            $updateData['trainer_id'] = $trainerId;
        }

        $classSession->update($updateData);

        AuditLogService::log('class_session.update', $classSession, $oldData, $classSession->toArray());

        return ApiResponse::success($classSession->fresh(['batch.course', 'trainer']), 'Class session updated.');
    }

    public function destroy(ClassSession $classSession): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->can('classes.manage')) {
            return ApiResponse::forbidden();
        }

        $oldData = $classSession->toArray();
        $classSession->delete();

        AuditLogService::log('class_session.delete', $classSession, $oldData, null);

        return ApiResponse::success(null, 'Class session removed from timetable.');
    }

    public function show(ClassSession $classSession): JsonResponse
    {
        return ApiResponse::success($classSession->load(['batch.course', 'trainer', 'attendanceSession.records.student']));
    }

    private function detectConflicts(
        string $date,
        string $startTime,
        string $endTime,
        ?int $trainerId = null,
        ?int $batchId = null,
        ?string $location = null,
        ?int $excludeId = null
    ): array {
        $conflicts = [];

        $overlapping = ClassSession::whereDate('date', $date)
            ->where('status', '!=', 'cancelled')
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->with(['trainer', 'batch']);

        // 1. Trainer overlap
        if ($trainerId) {
            $trainerOverlap = (clone $overlapping)->where('trainer_id', $trainerId)->first();
            if ($trainerOverlap) {
                $trainerName = $trainerOverlap->trainer?->full_name ?? 'Trainer';
                $tRange = substr($trainerOverlap->start_time, 0, 5).' - '.substr($trainerOverlap->end_time, 0, 5);
                $conflicts[] = "Trainer {$trainerName} is already scheduled for '{$trainerOverlap->title}' ({$tRange}).";
            }
        }

        // 2. Batch overlap (same intake cannot attend two classes simultaneously)
        if ($batchId) {
            $batchOverlap = (clone $overlapping)->where('batch_id', $batchId)->first();
            if ($batchOverlap) {
                $bName = $batchOverlap->batch?->name ?? 'This batch';
                $tRange = substr($batchOverlap->start_time, 0, 5).' - '.substr($batchOverlap->end_time, 0, 5);
                $conflicts[] = "Cohort '{$bName}' already has a session '{$batchOverlap->title}' scheduled ({$tRange}).";
            }
        }

        // 3. Physical room overlap
        if ($location && trim($location) !== '' && ! str_contains(strtolower($location), 'online') && ! str_contains(strtolower($location), 'meet')) {
            $roomOverlap = (clone $overlapping)->where('delivery_mode', 'Physical')->where('location', $location)->first();
            if ($roomOverlap) {
                $tRange = substr($roomOverlap->start_time, 0, 5).' - '.substr($roomOverlap->end_time, 0, 5);
                $conflicts[] = "Room '{$location}' is already booked for '{$roomOverlap->title}' ({$tRange}).";
            }
        }

        return $conflicts;
    }
}
