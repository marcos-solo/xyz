<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseUnitController extends Controller
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
        ]);

        $unit = $course->units()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order' => $validated['order'] ?? (($course->units()->max('order') ?? 0) + 1),
            'status' => 'active',
        ]);

        return ApiResponse::success($unit, 'Unit created successfully.', 201);
    }

    public function update(Request $request, CourseUnit $unit): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $unit->update($request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:active,inactive'],
        ]));

        return ApiResponse::success($unit, 'Unit updated successfully.');
    }

    public function destroy(Request $request, CourseUnit $unit): JsonResponse
    {
        if (!$this->canManageCurriculum($request)) {
            return ApiResponse::forbidden();
        }

        $unit->delete();
        return ApiResponse::success(null, 'Unit deleted.');
    }
}