<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseModule;
use App\Models\CourseProgress;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function store(Request $request, CourseModule $module): JsonResponse
    {
        if (!$request->user()->can('lessons.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content_type' => ['required', 'in:video,pdf,document,presentation,audio,external_link,text,scorm'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url'],
            'file_path' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url'],
            'duration' => ['nullable', 'integer', 'min:1'],
            'order' => ['nullable', 'integer'],
            'is_preview' => ['nullable', 'boolean'],
        ]);

        $maxOrder = $module->lessons()->max('order') ?? 0;

        $lesson = Lesson::create([
            'module_id' => $module->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content_type' => $validated['content_type'],
            'content' => $validated['content'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'file_path' => $validated['file_path'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'order' => $validated['order'] ?? ($maxOrder + 1),
            'is_preview' => $validated['is_preview'] ?? false,
            'status' => 'active',
        ]);

        return ApiResponse::success($lesson, 'Lesson created successfully.', 201);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        return ApiResponse::success($lesson->load(['module.course', 'resources']));
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        if (!$request->user()->can('lessons.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content_type' => ['sometimes', 'required', 'in:video,pdf,document,presentation,audio,external_link,text,scorm'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url'],
            'file_path' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url'],
            'duration' => ['nullable', 'integer', 'min:1'],
            'order' => ['nullable', 'integer'],
            'is_preview' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $lesson->update($validated);

        return ApiResponse::success($lesson, 'Lesson updated successfully.');
    }

    /**
     * Drag-and-drop reorder lessons within a module.
     */
    public function reorder(Request $request, CourseModule $module): JsonResponse
    {
        if (!$request->user()->can('lessons.manage')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'lesson_uuids' => ['required', 'array'],
            'lesson_uuids.*' => ['string', 'exists:lessons,uuid'],
        ]);

        foreach ($validated['lesson_uuids'] as $index => $uuid) {
            Lesson::where('uuid', $uuid)->where('module_id', $module->id)->update(['order' => $index + 1]);
        }

        return ApiResponse::success(
            $module->lessons()->get(),
            'Lessons reordered successfully.'
        );
    }

    /**
     * Mark lesson progress (started / completed) for authenticated student.
     */
    public function updateProgress(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'status' => ['required', 'in:in_progress,completed'],
        ]);

        $batch = \App\Models\CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $lesson->load('module.course');

        if ($batch->course_id !== $lesson->module->course_id) {
            return response()->json([
                'success' => false,
                'message' => 'This lesson does not belong to the selected course batch.',
            ], 403);
        }

        if (!$batch->enrollments()
            ->where('student_id', $user->id)
            ->whereIn('status', ['Pending', 'Active'])
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this course batch.',
            ], 403);
        }

        $progress = LessonProgress::firstOrNew([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'batch_id' => $batch->id,
        ]);

        if (!$progress->exists) {
            $progress->started_at = now();
        }

        $progress->status = $validated['status'];
        $progress->last_accessed_at = now();
        if ($validated['status'] === 'completed') {
            $progress->completed_at = now();
        }
        $progress->save();

        // Recalculate Course Progress summary
        $course = $lesson->module->course;
        $totalLessons = Lesson::whereHas('module', fn($q) => $q->where('course_id', $course->id))->count();
        $completedLessons = LessonProgress::where('user_id', $user->id)
            ->where('batch_id', $batch->id)
            ->where('status', 'completed')
            ->count();

        $percentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;

        $cp = CourseProgress::updateOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id, 'batch_id' => $batch->id],
            [
                'progress_percentage' => $percentage,
                'completed_lessons_count' => $completedLessons,
                'total_lessons_count' => $totalLessons,
                'last_accessed_at' => now(),
            ]
        );

        return ApiResponse::success([
            'lesson_progress' => $progress,
            'course_progress' => $cp,
        ], 'Learning progress recorded.');
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $lesson->delete();
        return ApiResponse::success(null, 'Lesson deleted.');
    }
}
