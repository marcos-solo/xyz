<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
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

        if (!Hash::check($validated['current_password'], $user->password)) {
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
