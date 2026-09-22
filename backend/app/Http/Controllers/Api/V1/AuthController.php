<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\EnrollmentFinance;
use App\Models\Organization;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\StudentNumberGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registrationOptions(): JsonResponse
    {
        $courses = Course::query()
            ->where('status', 'active')
            ->whereHas('batches', fn ($query) => $query->whereIn('status', ['upcoming', 'ongoing']))
            ->with([
                'learningPath:id,uuid,title,slug',
                'batches' => fn ($query) => $query
                    ->whereIn('status', ['upcoming', 'ongoing'])
                    ->with('branch')
                    ->withCount(['enrollments as active_enrollments_count' => fn ($enrollment) => $enrollment->whereIn('status', ['Pending', 'Active'])])
                    ->orderBy('start_date'),
            ])
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'code', 'description', 'learning_path_id']);

        return ApiResponse::success($courses, 'Registration options retrieved.');
    }

    public function registerStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'course_uuid' => ['required', 'exists:courses,uuid'],
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
        ]);

        $course = Course::where('uuid', $validated['course_uuid'])
            ->where('status', 'active')
            ->firstOrFail();
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])
            ->where('course_id', $course->id)
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->lockForUpdate()
            ->first();

        if (! $batch) {
            return ApiResponse::error('The selected intake is not available for this course.', 422);
        }

        $occupiedPlaces = $batch->enrollments()
            ->whereIn('status', ['Pending', 'Active'])
            ->count();
        if ($occupiedPlaces >= $batch->capacity) {
            return ApiResponse::error('The selected intake is full. Please choose another intake.', 422);
        }

        $organization = Organization::find($batch->organization_id);
        $student = DB::transaction(function () use ($validated, $organization, $batch) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'organization_id' => $organization->id,
                'branch_id' => $batch->branch_id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('Student');

            $studentNumber = StudentNumberGeneratorService::generate($organization->id, $batch->branch_id);
            StudentProfile::create([
                'user_id' => $user->id,
                'student_number' => $studentNumber,
                'admission_date' => now()->toDateString(),
                'status' => 'active',
            ]);

            $enrollment = Enrollment::create([
                'student_id' => $user->id,
                'batch_id' => $batch->id,
                'enrollment_number' => 'ENR-'.now()->format('Y').'-'.str_pad((string) (Enrollment::withTrashed()->whereYear('created_at', now()->format('Y'))->count() + 1), 4, '0', STR_PAD_LEFT),
                'enrollment_date' => now()->toDateString(),
                'status' => 'Pending',
                'workflow_stage' => 'registered',
                'workflow_updated_by' => null,
                'workflow_updated_at' => now(),
            ]);
            EnrollmentFinance::create([
                'enrollment_id' => $enrollment->id,
                'currency' => $organization->settings['currency'] ?? 'KES',
            ]);

            return $user->load(['organization', 'branch', 'roles.permissions', 'studentProfile']);
        });

        $token = $student->createToken('auth_token')->plainTextToken;

        AuditLogService::log('student.self_register', $student, null, [
            'course_uuid' => $course->uuid,
            'batch_uuid' => $batch->uuid,
        ]);

        return ApiResponse::success([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'uuid' => $student->uuid,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'full_name' => $student->full_name,
                'email' => $student->email,
                'roles' => $student->roles->pluck('name'),
                'permissions' => $student->getAllPermissions()->pluck('name')->unique()->values(),
                'is_student' => true,
                'student_number' => $student->studentProfile?->student_number,
            ],
        ], 'Registration submitted. Your application is awaiting Admissions review.', 201);
    }

    /**
     * Authenticate user and issue Sanctum bearer token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])
            ->with(['organization', 'branch', 'roles.permissions', 'staffProfile', 'studentProfile'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return ApiResponse::error('Invalid email or password credentials.', 422, [
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if ($user->status !== 'active') {
            return ApiResponse::error("Your account is currently {$user->status}. Please contact an administrator.", 403);
        }

        // Record last login metadata
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Revoke old tokens if single session preferred, or create new device token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Flatten all user permissions (direct + role-inherited)
        $allPermissions = $user->getAllPermissions()->pluck('name')->unique()->values();

        AuditLogService::log('auth.login', $user, null, ['ip' => $request->ip()]);

        return ApiResponse::success([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'uuid' => $user->uuid,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'organization' => $user->organization ? [
                    'uuid' => $user->organization->uuid,
                    'name' => $user->organization->name,
                    'code' => $user->organization->code,
                ] : null,
                'branch' => $user->branch ? [
                    'uuid' => $user->branch->uuid,
                    'name' => $user->branch->name,
                    'code' => $user->branch->code,
                ] : null,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $allPermissions,
                'profile_photo_path' => $user->profile_photo_path,
                'is_staff' => (bool) $user->staffProfile,
                'is_student' => (bool) $user->studentProfile,
                'student_number' => $user->studentProfile?->student_number,
                'employee_number' => $user->staffProfile?->employee_number,
            ],
        ], 'Login successful.');
    }

    /**
     * Get authenticated user profile & permissions.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['organization', 'branch', 'roles.permissions', 'staffProfile', 'studentProfile']);
        $allPermissions = $user->getAllPermissions()->pluck('name')->unique()->values();

        return ApiResponse::success([
            'uuid' => $user->uuid,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'organization' => $user->organization ? [
                'uuid' => $user->organization->uuid,
                'name' => $user->organization->name,
                'code' => $user->organization->code,
            ] : null,
            'branch' => $user->branch ? [
                'uuid' => $user->branch->uuid,
                'name' => $user->branch->name,
                'code' => $user->branch->code,
            ] : null,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $allPermissions,
            'profile_photo_path' => $user->profile_photo_path,
            'is_staff' => (bool) $user->staffProfile,
            'is_student' => (bool) $user->studentProfile,
            'student_number' => $user->studentProfile?->student_number,
            'employee_number' => $user->staffProfile?->employee_number,
        ]);
    }

    /**
     * Log out authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Successfully logged out.');
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $user->update($validated);

        return ApiResponse::success($user, 'Profile updated successfully.');
    }

    /**
     * Change authenticated user password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return ApiResponse::error('The provided current password does not match.', 422, [
                'current_password' => ['Incorrect current password.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        AuditLogService::log('user.password_change', $user);

        return ApiResponse::success(null, 'Password updated successfully.');
    }
}
