<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Assessment;
use App\Models\CourseBatch;
use App\Models\Organization;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = Assessment::with(['batch.course', 'batch.branch', 'creator'])
            ->withCount(['questions', 'attempts', 'submissions']);

        if ($authUser->hasRole('Student')) {
            $query->where('status', 'published')
                ->whereHas('batch.enrollments', fn($q) => $q
                    ->where('student_id', $authUser->id)
                    ->whereIn('status', ['Pending', 'Active']));
        }

        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('batch', fn($q) => $q->where('branch_id', $authUser->branch_id));
        }

        if ($request->filled('batch_uuid')) {
            $batch = CourseBatch::where('uuid', $request->batch_uuid)->first();
            if ($batch) {
                $query->where('batch_id', $batch->id);
            }
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Assessments retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('assessments.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:Quiz,Assignment,CAT,Exam,Practical,Project,Final Examination'],
            'weight_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'total_marks' => ['required', 'numeric', 'min:1'],
            'pass_mark' => ['required', 'numeric', 'min:0'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
            'attempts_allowed' => ['nullable', 'integer', 'min:1'],
            'randomize_questions' => ['nullable', 'boolean'],
            'randomize_options' => ['nullable', 'boolean'],
            'show_immediate_results' => ['nullable', 'boolean'],
            'show_correct_answers' => ['nullable', 'boolean'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,published,closed'],
        ]);

        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();

        $assessment = Assessment::create([
            'organization_id' => $batch->organization_id,
            'batch_id' => $batch->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'weight_percentage' => $validated['weight_percentage'],
            'total_marks' => $validated['total_marks'],
            'pass_mark' => $validated['pass_mark'],
            'time_limit' => $validated['time_limit'] ?? null,
            'attempts_allowed' => $validated['attempts_allowed'] ?? 1,
            'randomize_questions' => $validated['randomize_questions'] ?? false,
            'randomize_options' => $validated['randomize_options'] ?? false,
            'show_immediate_results' => $validated['show_immediate_results'] ?? true,
            'show_correct_answers' => $validated['show_correct_answers'] ?? false,
            'due_date' => $validated['due_date'] ?? null,
            'status' => $validated['status'] ?? 'published',
            'created_by' => $authUser->id,
        ]);

        AuditLogService::log('assessment.create', $assessment, null, $assessment->toArray());

        return ApiResponse::success($assessment->load(['batch.course']), 'Assessment created successfully.', 201);
    }

    public function show(Assessment $assessment): JsonResponse
    {
        return ApiResponse::success($assessment->load([
            'batch.course',
            'questions.options',
            'attempts.student',
            'submissions.student',
        ]));
    }

    public function update(Request $request, Assessment $assessment): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('assessments.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', 'required', 'in:Quiz,Assignment,CAT,Exam,Practical,Project,Final Examination'],
            'weight_percentage' => ['sometimes', 'required', 'numeric', 'min:0', 'max:100'],
            'total_marks' => ['sometimes', 'required', 'numeric', 'min:1'],
            'pass_mark' => ['sometimes', 'required', 'numeric', 'min:0'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
            'attempts_allowed' => ['nullable', 'integer', 'min:1'],
            'randomize_questions' => ['nullable', 'boolean'],
            'randomize_options' => ['nullable', 'boolean'],
            'show_immediate_results' => ['nullable', 'boolean'],
            'show_correct_answers' => ['nullable', 'boolean'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,published,closed'],
        ]);

        $old = $assessment->toArray();
        $assessment->update($validated);

        AuditLogService::log('assessment.update', $assessment, $old, $assessment->toArray());

        return ApiResponse::success($assessment, 'Assessment updated.');
    }

    public function destroy(Assessment $assessment): JsonResponse
    {
        $assessment->delete();
        return ApiResponse::success(null, 'Assessment deleted.');
    }
}
