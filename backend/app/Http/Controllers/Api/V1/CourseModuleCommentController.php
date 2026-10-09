<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseBatch;
use App\Models\CourseModule;
use App\Models\CourseModuleComment;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CourseModuleCommentController extends Controller
{
    private const ACCESSIBLE_STAGES = [
        'branch_review',
        'finance_cleared',
        'in_training',
        'course_completed',
        'certification_ready',
        'certified',
    ];

    public function index(Request $request, CourseModule $module): JsonResponse
    {
        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
        ]);
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])
            ->where('course_id', $module->course_id)
            ->firstOrFail();

        $user = $request->user();
        $students = $this->studentsForBatch($batch);

        if ($user->hasRole('Student')) {
            if (! $this->studentIsEnrolled($batch, $user->id)) {
                return ApiResponse::forbidden('You are not enrolled in this intake.');
            }

            $students = $students->where('id', $user->id)->values();
        } elseif ($user->hasRole('Trainer')) {
            if (! $batch->trainers()->where('users.id', $user->id)->exists()) {
                return ApiResponse::forbidden('You are not assigned to this intake.');
            }
        } elseif (! $user->hasAnyRole(['Admin', 'Administrator', 'Super Admin', 'CEO'])) {
            return ApiResponse::forbidden();
        }

        $query = CourseModuleComment::with([
            'author:id,uuid,first_name,last_name',
            'student:id,uuid,first_name,last_name',
        ])
            ->where('module_id', $module->id)
            ->where('batch_id', $batch->id);

        if ($user->hasRole('Student')) {
            $query->where('student_id', $user->id);
        } else {
            $query->whereIn('student_id', $students->pluck('id'));
        }

        return ApiResponse::success([
            'comments' => $query->oldest()->get(),
            'students' => $user->hasRole('Trainer') ? $students->values() : [],
        ]);
    }

    public function store(Request $request, CourseModule $module): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'student_uuid' => [$user->hasRole('Student') ? 'nullable' : 'required', 'exists:users,uuid'],
            'body' => ['required', 'string', 'max:2000'],
        ]);
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])
            ->where('course_id', $module->course_id)
            ->firstOrFail();

        if ($user->hasRole('Student')) {
            if (! $this->studentIsEnrolled($batch, $user->id)) {
                return ApiResponse::forbidden('You are not enrolled in this intake.');
            }
            $student = $user;
        } elseif ($user->hasRole('Trainer')) {
            if (! $batch->trainers()->where('users.id', $user->id)->exists()) {
                return ApiResponse::forbidden('You are not assigned to this intake.');
            }
            $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
            if (! $this->studentIsEnrolled($batch, $student->id)) {
                return ApiResponse::forbidden('The selected student is not enrolled in this intake.');
            }
        } elseif ($user->hasAnyRole(['Admin', 'Administrator', 'Super Admin', 'CEO'])) {
            $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
            if (! $this->studentIsEnrolled($batch, $student->id)) {
                return ApiResponse::forbidden('The selected student is not enrolled in this intake.');
            }
        } else {
            return ApiResponse::forbidden();
        }

        $comment = CourseModuleComment::create([
            'module_id' => $module->id,
            'batch_id' => $batch->id,
            'student_id' => $student->id,
            'author_id' => $user->id,
            'body' => $validated['body'],
        ]);

        return ApiResponse::success(
            $comment->load(['author:id,uuid,first_name,last_name', 'student:id,uuid,first_name,last_name']),
            'Module comment posted.',
            201
        );
    }

    private function studentIsEnrolled(CourseBatch $batch, int $studentId): bool
    {
        return $batch->enrollments()
            ->where('student_id', $studentId)
            ->whereIn('workflow_stage', self::ACCESSIBLE_STAGES)
            ->exists();
    }

    private function studentsForBatch(CourseBatch $batch): Collection
    {
        $studentIds = Enrollment::where('batch_id', $batch->id)
            ->whereIn('workflow_stage', self::ACCESSIBLE_STAGES)
            ->pluck('student_id');

        return User::whereIn('id', $studentIds)
            ->orderBy('first_name')
            ->get(['id', 'uuid', 'first_name', 'last_name']);
    }
}
