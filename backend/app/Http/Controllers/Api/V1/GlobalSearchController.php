<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $term = trim($request->get('q', ''));
        if (strlen($term) < 2) {
            return ApiResponse::success([
                'students' => [],
                'staff' => [],
                'courses' => [],
                'batches' => [],
                'certificates' => [],
            ]);
        }

        // Students
        $students = User::role('Student')
            ->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhereHas('studentProfile', fn ($sq) => $sq->where('student_number', 'like', "%{$term}%"));
            })
            ->with('studentProfile', 'branch')
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'type' => 'student',
                'uuid' => $u->uuid,
                'title' => $u->full_name,
                'subtitle' => $u->studentProfile?->student_number.' • '.($u->branch?->name ?? 'Main'),
                'url' => "/students/{$u->studentProfile?->uuid}",
            ]);

        // Staff
        $staff = User::whereHas('staffProfile')
            ->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->with('staffProfile', 'branch')
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'type' => 'staff',
                'uuid' => $u->uuid,
                'title' => $u->full_name,
                'subtitle' => $u->staffProfile?->job_title.' • '.($u->branch?->name ?? 'Main'),
                'url' => "/staff/{$u->staffProfile?->uuid}",
            ]);

        // Courses
        $courses = Course::where('name', 'like', "%{$term}%")
            ->orWhere('code', 'like', "%{$term}%")
            ->take(5)
            ->get()
            ->map(fn ($c) => [
                'type' => 'course',
                'uuid' => $c->uuid,
                'title' => $c->name,
                'subtitle' => "Code: {$c->code} • Level: {$c->level}",
                'url' => "/courses/{$c->uuid}",
            ]);

        // Batches
        $batches = CourseBatch::where('name', 'like', "%{$term}%")
            ->orWhere('code', 'like', "%{$term}%")
            ->with('branch', 'course')
            ->take(5)
            ->get()
            ->map(fn ($b) => [
                'type' => 'batch',
                'uuid' => $b->uuid,
                'title' => $b->name,
                'subtitle' => "Intake: {$b->code} • {$b->branch?->name}",
                'url' => "/batches/{$b->uuid}",
            ]);

        // Certificates
        $certificates = Certificate::where('certificate_number', 'like', "%{$term}%")
            ->orWhere('verification_code', 'like', "%{$term}%")
            ->with('student', 'course')
            ->take(5)
            ->get()
            ->map(fn ($c) => [
                'type' => 'certificate',
                'uuid' => $c->uuid,
                'title' => $c->certificate_number,
                'subtitle' => "Student: {$c->student?->full_name} • {$c->course?->name}",
                'url' => '/certificates',
            ]);

        return ApiResponse::success([
            'students' => $students,
            'staff' => $staff,
            'courses' => $courses,
            'batches' => $batches,
            'certificates' => $certificates,
        ]);
    }
}
