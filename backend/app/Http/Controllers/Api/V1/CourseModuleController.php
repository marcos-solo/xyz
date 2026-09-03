<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseUnit;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseModuleController extends Controller
{
    private function canManageCurriculum(Request $request): bool
    {
        return $request->user()->can('modules.manage')
            || $request->user()->hasAnyRole(['Admin', 'Administrator', 'Super Admin', 'CEO']);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'unit_uuid' => ['nullable', 'exists:course_units,uuid'],
        ]);

        $unit = !empty($validated['unit_uuid'])
            ? CourseUnit::where('uuid', $validated['unit_uuid'])->where('course_id', $course->id)->firstOrFail()
            : null;
        $maxOrder = ($unit ? $unit->modules() : $course->modules())->max('order') ?? 0;

        $module = CourseModule::create([
            'course_id' => $course->id,
            'unit_id' => $unit?->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order' => $validated['order'] ?? ($maxOrder + 1),
            'status' => 'active',
        ]);

        return ApiResponse::success($module, 'Module created successfully.', 201);
    }

    public function update(Request $request, CourseModule $module): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $module->update($validated);

        return ApiResponse::success($module, 'Module updated successfully.');
    }

    /**
     * Drag-and-drop reorder module array.
     */
    public function reorder(Request $request, Course $course): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'module_uuids' => ['required', 'array'],
            'module_uuids.*' => ['string', 'exists:course_modules,uuid'],
        ]);

        foreach ($validated['module_uuids'] as $index => $uuid) {
            CourseModule::where('uuid', $uuid)->where('course_id', $course->id)->update(['order' => $index + 1]);
        }

        return ApiResponse::success(
            $course->modules()->with('lessons')->get(),
            'Modules reordered successfully.'
        );
    }

    public function destroy(Request $request, CourseModule $module): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $module->delete();
        return ApiResponse::success(null, 'Module deleted.');
    }
}
