<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\CourseProgress;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    private function batchModules(Course $course, CourseBatch $batch): Collection
    {
        $modules = $course->units()
            ->with(['modules.lessons', 'modules.unit'])
            ->orderBy('order')
            ->get()
            ->flatMap(fn ($unit) => $unit->modules->sortBy('order')->values())
            ->merge($course->modules()->with('lessons')->orderBy('order')->get());

        $batchName = strtolower($batch->name);
        $unitTitle = null;
        $moduleKeyword = null;

        if (str_contains($batchName, 'knowledge') || str_contains($batchName, ' ak')) {
            $unitTitle = 'Fundamental Level';
            $moduleKeyword = 'Applied Knowledge';
        } elseif (str_contains($batchName, 'skill') || str_contains($batchName, ' as')) {
            $unitTitle = 'Fundamental Level';
            $moduleKeyword = 'Applied Skills';
        } elseif (str_contains($batchName, 'fundamental')) {
            $unitTitle = 'Fundamental Level';
        } elseif (str_contains($batchName, 'strategic') || str_contains($batchName, ' sp')) {
            $unitTitle = 'Strategic Professional Level';
        } elseif (str_contains($batchName, 'foundation') || str_contains($batchName, 'fia')) {
            $unitTitle = 'Foundation Level';
        }

        if ($unitTitle) {
            $modules = $modules->filter(function ($module) use ($unitTitle, $moduleKeyword): bool {
                $matchesUnit = str_contains(strtolower((string) $module->unit?->title), strtolower($unitTitle));
                $matchesModule = ! $moduleKeyword || str_contains(strtolower($module->title), strtolower($moduleKeyword));

                return $matchesUnit && $matchesModule;
            })->values();
        }

        if ($batch->curriculum_lesson_uuids) {
            $curriculumLessonUuids = $batch->curriculum_lesson_uuids;
            $modules->each(fn ($module) => $module->setRelation(
                'lessons',
                $module->lessons->whereIn('uuid', $curriculumLessonUuids)->values()
            ));
        }

        return $modules->values();
    }

    private function canManageLessons(Request $request): bool
    {
        return $request->user()->can('lessons.manage')
            || $request->user()->hasAnyRole(['Admin', 'Administrator', 'Super Admin', 'CEO']);
    }

    public function store(Request $request, CourseModule $module): JsonResponse
    {
        if (! $this->canManageLessons($request)) {
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
        if (! $this->canManageLessons($request)) {
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

    public function uploadVideo(Request $request): JsonResponse
    {
        if (! $this->canManageLessons($request)) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'video' => ['required', 'file', 'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime', 'max:512000'],
        ]);

        $path = $validated['video']->store('lesson-videos', 'public');

        return ApiResponse::success([
            'video_url' => Storage::disk('public')->url($path),
            'file_path' => $path,
        ], 'Video uploaded successfully.', 201);
    }

    /**
     * Drag-and-drop reorder lessons within a module.
     */
    public function reorder(Request $request, CourseModule $module): JsonResponse
    {
        if (! $this->canManageLessons($request)) {
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

        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $lesson->load('module.course');

        if ($batch->course_id !== $lesson->module->course_id) {
            return response()->json([
                'success' => false,
                'message' => 'This lesson does not belong to the selected course batch.',
            ], 403);
        }

        if (! $batch->enrollments()
            ->where('student_id', $user->id)
            ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified'])
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Admissions must approve your application before learning access is enabled.',
            ], 403);
        }

        $course = $lesson->module->course;
        $modules = $this->batchModules($course, $batch);
        $modulePosition = $modules->search(fn ($module) => $module->id === $lesson->module_id);
        $includedLessonIds = $modules->flatMap(fn ($module) => $module->lessons->pluck('id'));
        if ($modulePosition === false || ! $includedLessonIds->contains($lesson->id)) {
            return ApiResponse::error('This lesson is not part of the selected intake curriculum.', 422);
        }

        $previousLessonIds = $modules->take($modulePosition)->flatMap(fn ($module) => $module->lessons->pluck('id'));
        $completedPreviousLessons = LessonProgress::where('user_id', $user->id)
            ->where('batch_id', $batch->id)
            ->where('status', 'completed')
            ->whereIn('lesson_id', $previousLessonIds)
            ->count();

        if ($completedPreviousLessons < $previousLessonIds->count()) {
            return ApiResponse::error('Complete the previous module before moving on.', 422);
        }

        $progress = LessonProgress::firstOrNew([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'batch_id' => $batch->id,
        ]);

        if (! $progress->exists) {
            $progress->started_at = now();
        }

        $progress->status = $validated['status'];
        $progress->last_accessed_at = now();
        if ($validated['status'] === 'completed') {
            $progress->completed_at = now();
        }
        $progress->save();

        // Recalculate Course Progress summary
        $curriculumModules = $this->batchModules($course, $batch);
        $curriculumLessonIds = $curriculumModules->flatMap(fn ($module) => $module->lessons->pluck('id'))->unique();
        $totalLessons = $curriculumLessonIds->count();
        $completedLessons = LessonProgress::where('user_id', $user->id)
            ->where('batch_id', $batch->id)
            ->where('status', 'completed')
            ->whereIn('lesson_id', $curriculumLessonIds)
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

    public function destroy(Request $request, Lesson $lesson): JsonResponse
    {
        if (! $this->canManageLessons($request)) {
            return ApiResponse::forbidden();
        }

        $lesson->delete();

        return ApiResponse::success(null, 'Lesson deleted.');
    }
}
