<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\BranchScopeService;
use App\Services\StudentNumberGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Paginated students roster.
     */
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('students.view')) {
            return ApiResponse::forbidden();
        }

        $query = StudentProfile::with([
            'user.branch',
            'guardians',
            'user.enrollments.batch.course',
        ]);

        // Branch Isolation
        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->whereHas('user', fn($q) => $q->where('branch_id', $authUser->branch_id));
        } elseif ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->whereHas('user', fn($q) => $q->where('branch_id', $branch->id));
            }
        }

        // Search
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('student_number', 'like', "%{$term}%")
                  ->orWhereHas('user', function ($uq) use ($term) {
                      $uq->where('first_name', 'like', "%{$term}%")
                         ->orWhere('last_name', 'like', "%{$term}%")
                         ->orWhere('email', 'like', "%{$term}%")
                         ->orWhere('phone', 'like', "%{$term}%");
                  });
            });
        }

        // Course filter
        if ($request->filled('course_uuid')) {
            $query->whereHas('user.enrollments.batch.course', function ($cq) use ($request) {
                $cq->where('uuid', $request->course_uuid);
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->latest()->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Students list retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Admit a new student.
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('students.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'branch_uuid' => ['required', 'exists:branches,uuid'],
            'admission_date' => ['required', 'date'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'national_id' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'guardian_relationship' => ['nullable', 'string', 'max:100'],
        ]);

        $org = Organization::first();
        $branch = Branch::where('uuid', $validated['branch_uuid'])->firstOrFail();
        $studentNumber = StudentNumberGeneratorService::generate($org->id);
        $temporaryPassword = Str::random(10);

        $student = DB::transaction(function () use ($validated, $org, $branch, $studentNumber, $temporaryPassword) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($temporaryPassword),
                'organization_id' => $org->id,
                'branch_id' => $branch->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $user->assignRole('Student');

            $profile = StudentProfile::create([
                'user_id' => $user->id,
                'student_number' => $studentNumber,
                'admission_date' => $validated['admission_date'],
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'national_id' => $validated['national_id'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'status' => 'active',
            ]);

            if (!empty($validated['guardian_name']) && !empty($validated['guardian_phone'])) {
                $nameParts = explode(' ', trim($validated['guardian_name']), 2);
                $guardian = Guardian::create([
                    'organization_id' => $org->id,
                    'first_name' => $nameParts[0],
                    'last_name' => $nameParts[1] ?? 'Guardian',
                    'phone' => $validated['guardian_phone'],
                ]);

                $profile->guardians()->attach($guardian->id, [
                    'relationship' => $validated['guardian_relationship'] ?? 'Guardian',
                    'is_emergency_contact' => true,
                    'is_primary_contact' => true,
                ]);
            }

            AuditLogService::log('student.create', $profile, null, [
                'student_number' => $studentNumber,
                'student_name' => $user->full_name,
            ]);

            return $profile;
        });

        return ApiResponse::success(
            $student->load(['user.branch', 'guardians']),
            "Student admitted with Student Number: {$studentNumber}",
            201,
            ['student_number' => $studentNumber, 'temporary_password' => $temporaryPassword]
        );
    }

    /**
     * Show student profile with academic history.
     */
    public function show(StudentProfile $student): JsonResponse
    {
        return ApiResponse::success($student->load([
            'user.branch',
            'guardians',
            'user.enrollments.batch.course',
            'user.attendanceRecords.session.classSession',
            'user.courseProgress.course',
            'user.certificates.course',
        ]));
    }

    /**
     * Update student profile.
     */
    public function update(Request $request, StudentProfile $student): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('students.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'national_id' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:active,graduated,suspended,withdrawn,inactive'],
        ]);

        $old = $student->toArray();

        $student->user->update(collect($validated)->only(['first_name', 'middle_name', 'last_name', 'phone'])->toArray());
        $student->update(collect($validated)->except(['first_name', 'middle_name', 'last_name', 'phone'])->toArray());

        AuditLogService::log('student.update', $student, $old, $student->toArray());

        return ApiResponse::success($student->load(['user.branch', 'guardians']), 'Student profile updated.');
    }
}
