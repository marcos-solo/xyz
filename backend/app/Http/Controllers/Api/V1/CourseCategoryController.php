<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseCategory;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success(CourseCategory::withCount('courses')->get());
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('course-categories.manage')) {
            return ApiResponse::forbidden();
        }

        $org = Organization::first();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $category = CourseCategory::create([
            'organization_id' => $org->id,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'status' => 'active',
        ]);

        return ApiResponse::success($category, 'Course category created.', 201);
    }
}
