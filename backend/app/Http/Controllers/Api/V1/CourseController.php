<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CourseProgress;
use App\Models\CourseUnit;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Organization;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    private function accaLessonContent(string $paper): string
    {
        $paperName = trim($paper);

        return "## {$paperName}\n\n".
            "### Learning outcomes\n".
            "- explain the core concept behind this paper\n".
            "- apply the key principles in real business scenarios\n".
            "- prepare a concise summary for revision and mock exam practice\n\n".
            "### Topic notes\n".
            "This paper is part of the ACCA pathway and should be studied as a practical business skill, not just a theory topic. Focus on the underlying accounting, management, and decision-making principles before moving into exam technique.\n\n".
            "Use this study note to organise your revision, highlight definitions, and connect each concept to the workplace context. Build a short checklist of formulas, journal entries, controls, and reporting structures you can revisit during revision.\n\n".
            "### Guided revision\n".
            "1. Review the syllabus area and identify the key objective.\n".
            "2. Work through one example question and one exam-style scenario.\n".
            "3. Summarise the answer in your own words and check it against the ACCA learning outcome.\n\n".
            "### Study reminder\n".
            "Keep notes short, accurate, and exam-focused. A strong revision file should blend definition, application, and professional judgement.\n";
    }

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = Course::with(['category', 'learningPath', 'creator'])
            ->withCount(['allModules', 'units', 'batches']);

        if ($authUser?->hasRole('Student')) {
            $query->whereHas('batches.enrollments', fn ($q) => $q
                ->where('student_id', $authUser->id)
                ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified']))
                ->where('status', 'active');
        }

        if ($request->filled('category_uuid')) {
            $cat = CourseCategory::where('uuid', $request->category_uuid)->first();
            if ($cat) {
                $query->where('category_id', $cat->id);
            }
        }

        if ($request->filled('learning_path_uuid')) {
            $path = LearningPath::where('uuid', $request->learning_path_uuid)->first();
            if ($path) {
                $query->where('learning_path_id', $path->id);
            }
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%")
                    ->orWhere('short_description', 'like', "%{$term}%");
            });
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        $courses = collect($paginated->items())->map(function ($course) use ($authUser) {
            if ($authUser?->hasRole('Student')) {
                $progress = CourseProgress::where('user_id', $authUser->id)
                    ->where('course_id', $course->id)
                    ->orderByDesc('progress_percentage')
                    ->first();
                $course->setAttribute('learning_progress', $progress ? [
                    'percentage' => (float) $progress->progress_percentage,
                    'completed_lessons' => $progress->completed_lessons_count,
                    'total_lessons' => $progress->total_lessons_count,
                ] : null);
            }

            return $course;
        });

        return ApiResponse::success($courses, 'Courses list retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('courses.create')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();

        $validated = $request->validate([
            'category_uuid' => ['required', 'exists:course_categories,uuid'],
            'learning_path_uuid' => ['nullable', 'exists:learning_paths,uuid'],
            'code' => ['required', 'string', 'max:50', Rule::unique('courses', 'code')->where(fn ($q) => $q->where('organization_id', $org->id))],
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'program_level' => ['nullable', 'string', 'max:100'],
            'entry_requirements' => ['nullable', 'string', 'max:1000'],
            'paper_count' => ['nullable', 'integer', 'min:1', 'max:100'],
            'duration' => ['required', 'integer', 'min:1'],
            'duration_unit' => ['required', 'in:hours,days,weeks,months'],
            'level' => ['required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,archived'],
        ]);

        $category = CourseCategory::where('uuid', $validated['category_uuid'])->firstOrFail();
        $learningPath = ! empty($validated['learning_path_uuid'])
            ? LearningPath::where('uuid', $validated['learning_path_uuid'])->first()
            : null;

        $course = Course::create([
            'organization_id' => $org->id,
            'category_id' => $category->id,
            'learning_path_id' => $learningPath?->id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'program_level' => $validated['program_level'] ?? null,
            'entry_requirements' => $validated['entry_requirements'] ?? null,
            'paper_count' => $validated['paper_count'] ?? null,
            'duration' => $validated['duration'],
            'duration_unit' => $validated['duration_unit'],
            'level' => $validated['level'],
            'status' => 'draft',
            'created_by' => $authUser->id,
        ]);

        if (strtolower($category->name) === 'acca') {
            $units = [
                ['title' => 'Foundation / FIA', 'description' => 'Foundation in Accountancy pathways.', 'modules' => [['title' => 'RQF Level 2', 'papers' => ['FA1 — Recording Financial Transactions', 'MA1 — Management Information']], ['title' => 'RQF Level 3', 'papers' => ['FA2 — Maintaining Financial Records', 'MA2 — Managing Costs and Finance']], ['title' => 'RQF Level 4', 'papers' => ['FBT — Business & Technology', 'FMA — Management Accounting', 'FFA — Financial Accounting']]]],
                ['title' => 'Applied Knowledge', 'description' => 'The three applied knowledge papers.', 'modules' => [['title' => 'Applied Knowledge Papers', 'papers' => ['AB/BT — Business & Technology', 'MA — Management Accounting', 'FA — Financial Accounting']]]],
                ['title' => 'Applied Skills', 'description' => 'The six applied skills papers.', 'modules' => [['title' => 'Applied Skills Papers', 'papers' => ['CL/LW — Corporate and Business Law', 'PM — Performance Management', 'TX — Taxation', 'FR — Financial Reporting', 'AA — Audit & Assurance', 'FM — Financial Management']]]],
                ['title' => 'Strategic Professional', 'description' => 'Essentials are mandatory. Choose two papers from Options.', 'modules' => [['title' => 'Essentials', 'papers' => ['SBR — Strategic Business Reporting', 'SBL — Strategic Business Leader']], ['title' => 'Options — Choose 2', 'papers' => ['AFM — Advanced Financial Management', 'APM — Advanced Performance Management', 'ATX — Advanced Taxation', 'AAA — Advanced Audit & Assurance']]]],
            ];

            foreach ($units as $unitOrder => $unitDefinition) {
                $unit = CourseUnit::create([
                    'course_id' => $course->id,
                    'title' => $unitDefinition['title'],
                    'description' => $unitDefinition['description'],
                    'order' => $unitOrder + 1,
                    'status' => 'active',
                ]);

                foreach ($unitDefinition['modules'] as $moduleOrder => $moduleDefinition) {
                    $module = CourseModule::create([
                        'course_id' => $course->id,
                        'unit_id' => $unit->id,
                        'title' => $moduleDefinition['title'],
                        'order' => $moduleOrder + 1,
                        'status' => 'active',
                    ]);

                    foreach ($moduleDefinition['papers'] as $paperOrder => $paper) {
                        Lesson::create([
                            'module_id' => $module->id,
                            'title' => $paper,
                            'content_type' => 'text',
                            'content' => $this->accaLessonContent($paper),
                            'duration' => 180,
                            'order' => $paperOrder + 1,
                            'is_preview' => $paperOrder === 0 && $moduleOrder === 0,
                        ]);
                    }
                }
            }
        }

        AuditLogService::log('course.create', $course, null, $course->toArray());

        return ApiResponse::success($course->load(['category', 'learningPath']), 'Course created successfully.', 201);
    }

    public function show(Course $course): JsonResponse
    {
        $authUser = request()->user();
        if ($authUser?->hasRole('Student') && $course->status !== 'active') {
            return ApiResponse::forbidden('This course is not available to students yet.');
        }

        if ($authUser?->hasRole('Student') && ! $course->batches()
            ->whereHas('enrollments', fn ($q) => $q
                ->where('student_id', $authUser->id)
                ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified']))
            ->exists()) {
            return ApiResponse::forbidden('Admissions must approve your application before learning access is enabled.');
        }

        $course->load([
            'category',
            'learningPath',
            'modules.lessons.resources',
            'units.modules.lessons.resources',
            'batches.branch',
            'batches.trainers',
            'creator',
        ]);

        if ($authUser?->hasRole('Student')) {
            $course->setRelation('batches', $course->batches()
                ->whereHas('enrollments', fn ($q) => $q
                    ->where('student_id', $authUser->id)
                    ->whereIn('workflow_stage', ['branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified']))
                ->with(['branch', 'trainers'])
                ->get());

            $studentBatch = $course->batches->first();
            $courseCategoryName = strtolower((string) ($course->category?->name ?? ''));

            if ($courseCategoryName === 'acca' && $studentBatch && ! request()->boolean('all_units')) {
                $batchName = strtolower($studentBatch->name);

                $matchedUnitTitle = null;
                $matchedModuleKeyword = null;

                if (str_contains($batchName, 'knowledge') || str_contains($batchName, 'ak')) {
                    $matchedUnitTitle = 'Fundamental Level';
                    $matchedModuleKeyword = 'Applied Knowledge';
                } elseif (str_contains($batchName, 'skill') || str_contains($batchName, 'as')) {
                    $matchedUnitTitle = 'Fundamental Level';
                    $matchedModuleKeyword = 'Applied Skills';
                } elseif (str_contains($batchName, 'fundamental')) {
                    $matchedUnitTitle = 'Fundamental Level';
                } elseif (str_contains($batchName, 'strategic') || str_contains($batchName, 'sp')) {
                    $matchedUnitTitle = 'Strategic Professional Level';
                } elseif (str_contains($batchName, 'foundation') || str_contains($batchName, 'fia')) {
                    $matchedUnitTitle = 'Foundation Level';
                }

                if ($matchedUnitTitle) {
                    $filteredUnits = $course->units
                        ->filter(fn ($unit) => str_contains(strtolower((string) $unit->title), strtolower($matchedUnitTitle)))
                        ->values();

                    if ($filteredUnits->isEmpty() && $matchedModuleKeyword) {
                        $filteredUnits = $course->units
                            ->filter(fn ($unit) => str_contains(strtolower((string) $unit->title), strtolower($matchedModuleKeyword)))
                            ->values();
                    }

                    if ($matchedModuleKeyword && $filteredUnits->isNotEmpty()) {
                        foreach ($filteredUnits as $unit) {
                            $filteredModules = $unit->modules
                                ->filter(fn ($m) => str_contains(strtolower((string) $m->title), strtolower($matchedModuleKeyword)))
                                ->values();
                            $unit->setRelation('modules', $filteredModules);
                        }
                    }

                    $course->setRelation('units', $filteredUnits);
                    $course->setRelation('modules', $course->modules
                        ->filter(function ($module) use ($filteredUnits, $matchedModuleKeyword) {
                            if (! $filteredUnits->contains('id', $module->unit_id)) {
                                return false;
                            }
                            if ($matchedModuleKeyword) {
                                return str_contains(strtolower((string) $module->title), strtolower($matchedModuleKeyword));
                            }

                            return true;
                        })
                        ->values());
                }
            }
        }

        if ($authUser?->hasRole('Student')) {
            $lessonIds = $course->modules->flatMap->lessons
                ->merge($course->units->flatMap->modules->flatMap->lessons)
                ->pluck('id');
            $batchIds = $course->batches->pluck('id');
            $completedLessonUuids = LessonProgress::where('user_id', $authUser->id)
                ->whereIn('lesson_id', $lessonIds)
                ->whereIn('batch_id', $batchIds)
                ->where('status', 'completed')
                ->with('lesson')
                ->get()
                ->pluck('lesson.uuid')
                ->unique()
                ->values()
                ->all();
            $progress = CourseProgress::where('user_id', $authUser->id)
                ->where('course_id', $course->id)
                ->orderByDesc('progress_percentage')
                ->first();
            $course->setAttribute('learning_progress', [
                'percentage' => $progress ? (float) $progress->progress_percentage : 0,
                'completed_lesson_uuids' => $completedLessonUuids,
            ]);
        }

        return ApiResponse::success($course);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('courses.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'category_uuid' => ['sometimes', 'required', 'exists:course_categories,uuid'],
            'learning_path_uuid' => ['nullable', 'exists:learning_paths,uuid'],
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('courses', 'code')
                ->where(fn ($q) => $q->where('organization_id', $course->organization_id))
                ->ignore($course->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'program_level' => ['nullable', 'string', 'max:100'],
            'entry_requirements' => ['nullable', 'string', 'max:1000'],
            'paper_count' => ['nullable', 'integer', 'min:1', 'max:100'],
            'duration' => ['sometimes', 'required', 'integer', 'min:1'],
            'duration_unit' => ['sometimes', 'required', 'in:hours,days,weeks,months'],
            'level' => ['sometimes', 'required', 'in:Beginner,Intermediate,Advanced,Professional'],
            'status' => ['nullable', 'in:draft,active,archived'],
        ]);

        $old = $course->toArray();

        if (! empty($validated['category_uuid'])) {
            $cat = CourseCategory::where('uuid', $validated['category_uuid'])->first();
            if ($cat) {
                $course->category_id = $cat->id;
            }
        }

        if (array_key_exists('learning_path_uuid', $validated)) {
            if ($validated['learning_path_uuid']) {
                $path = LearningPath::where('uuid', $validated['learning_path_uuid'])->first();
                $course->learning_path_id = $path?->id;
            } else {
                $course->learning_path_id = null;
            }
        }

        $course->fill(collect($validated)->except(['category_uuid', 'learning_path_uuid'])->toArray());
        $course->save();

        AuditLogService::log('course.update', $course, $old, $course->toArray());

        return ApiResponse::success($course->load(['category', 'learningPath']), 'Course updated successfully.');
    }

    public function approve(Request $request, Course $course): JsonResponse
    {
        if (! $request->user()->can('courses.approve')) {
            return ApiResponse::forbidden();
        }

        if ($course->status === 'archived') {
            return ApiResponse::error('Archived courses cannot be approved.', 422);
        }

        $course->update(['status' => 'active']);
        AuditLogService::log('course.approve', $course, ['status' => 'draft'], ['status' => 'active']);

        return ApiResponse::success($course->load('category'), 'Course approved and published to students.');
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('courses.delete')) {
            return ApiResponse::forbidden();
        }

        // Check if there are active batches
        if ($course->batches()->where('status', 'ongoing')->exists()) {
            return ApiResponse::error('Cannot delete course with active ongoing intakes. Archive instead.', 422);
        }

        $course->delete();
        AuditLogService::log('course.delete', $course);

        return ApiResponse::success(null, 'Course archived successfully.');
    }
}
