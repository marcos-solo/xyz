<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Organization;
use App\Models\Position;
use App\Models\Role;
use App\Models\StaffProfile;
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

class UserController extends Controller
{
    /**
     * Paginated and filtered users list.
     */
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.view')) {
            return ApiResponse::forbidden();
        }

        $query = User::with(['branch', 'department', 'position', 'roles', 'staffProfile', 'studentProfile']);

        // Branch-level data isolation
        if (!BranchScopeService::canAccessAllBranches($authUser) && $authUser->branch_id) {
            $query->where('branch_id', $authUser->branch_id);
        } elseif ($request->filled('branch_uuid')) {
            $branch = Branch::where('uuid', $request->branch_uuid)->first();
            if ($branch) {
                $query->where('branch_id', $branch->id);
            }
        }

        // Search Filter
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                  ->orWhere('last_name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%")
                  ->orWhereHas('studentProfile', fn($sq) => $sq->where('student_number', 'like', "%{$term}%"))
                  ->orWhereHas('staffProfile', fn($sq) => $sq->where('employee_number', 'like', "%{$term}%"));
            });
        }

        // Role Filter
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        // Status Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 15), 100);
        $paginated = $query->paginate($perPage);

        return ApiResponse::success($paginated->items(), 'Users retrieved.', 200, [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Multi-step Wizard & Standard User Creation
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            // Step 1: Personal Info
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],

            // Step 2: Org Structure
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'department_uuid' => ['nullable', 'exists:departments,uuid'],
            'position_uuid' => ['nullable', 'exists:positions,uuid'],

            // Step 3: Account Credentials
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['nullable', 'in:active,inactive,suspended'],

            // Step 4: Roles
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],

            // Profile specific
            'user_type' => ['nullable', 'in:staff,student,general'],
            'employee_number' => ['nullable', 'string', 'unique:staff_profiles,employee_number'],
            'student_number' => ['nullable', 'string', 'unique:student_profiles,student_number'],
            'job_title' => ['nullable', 'string', 'max:255'],
        ]);

        $org = Organization::first();
        $branch = !empty($validated['branch_uuid']) ? Branch::where('uuid', $validated['branch_uuid'])->first() : null;
        $department = !empty($validated['department_uuid']) ? Department::where('uuid', $validated['department_uuid'])->first() : null;
        $position = !empty($validated['position_uuid']) ? Position::where('uuid', $validated['position_uuid'])->first() : null;

        $temporaryPassword = $validated['password'] ?? Str::random(12);

        $user = DB::transaction(function () use ($validated, $org, $branch, $department, $position, $temporaryPassword) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($temporaryPassword),
                'organization_id' => $org->id,
                'branch_id' => $branch?->id,
                'department_id' => $department?->id,
                'position_id' => $position?->id,
                'status' => $validated['status'] ?? 'active',
                'email_verified_at' => now(),
            ]);

            // Assign Spatie Roles
            $user->syncRoles($validated['roles']);

            // Create Staff Profile if requested or if trainer/manager/admin
            $isStaffRole = collect($validated['roles'])->intersect(['Super Admin', 'Administrator', 'Branch Manager', 'Academic Manager', 'Trainer', 'Front Office'])->isNotEmpty();
            if ($isStaffRole || ($validated['user_type'] ?? '') === 'staff') {
                StaffProfile::create([
                    'user_id' => $user->id,
                    'employee_number' => $validated['employee_number'] ?? 'EMP-' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
                    'employment_date' => now()->format('Y-m-d'),
                    'job_title' => $validated['job_title'] ?? $position?->name ?? 'Staff Member',
                    'status' => 'active',
                ]);
            }

            // Create Student Profile if role is Student
            if (in_array('Student', $validated['roles']) || ($validated['user_type'] ?? '') === 'student') {
                $studentNumber = $validated['student_number'] ?? StudentNumberGeneratorService::generate($org->id);
                StudentProfile::create([
                    'user_id' => $user->id,
                    'student_number' => $studentNumber,
                    'admission_date' => now()->format('Y-m-d'),
                    'status' => 'active',
                ]);
            }

            AuditLogService::log('user.create', $user, null, [
                'email' => $user->email,
                'roles' => $validated['roles'],
            ]);

            return $user;
        });

        return ApiResponse::success(
            $user->load(['branch', 'department', 'position', 'roles', 'staffProfile', 'studentProfile']),
            'User account created successfully.',
            201,
            ['temporary_password' => $temporaryPassword]
        );
    }

    /**
     * Show detailed user record.
     */
    public function show(User $user): JsonResponse
    {
        return ApiResponse::success(
            $user->load(['organization', 'branch', 'department', 'position', 'roles.permissions', 'staffProfile', 'studentProfile.guardians'])
        );
    }

    /**
     * Update user details and role assignments.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', "unique:users,email,{$user->id}"],
            'phone' => ['nullable', 'string', 'max:50'],
            'branch_uuid' => ['nullable', 'exists:branches,uuid'],
            'department_uuid' => ['nullable', 'exists:departments,uuid'],
            'position_uuid' => ['nullable', 'exists:positions,uuid'],
            'status' => ['nullable', 'in:active,inactive,suspended,archived'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $old = $user->toArray();

        if (array_key_exists('branch_uuid', $validated)) {
            $user->branch_id = $validated['branch_uuid'] ? Branch::where('uuid', $validated['branch_uuid'])->value('id') : null;
        }
        if (array_key_exists('department_uuid', $validated)) {
            $user->department_id = $validated['department_uuid'] ? Department::where('uuid', $validated['department_uuid'])->value('id') : null;
        }
        if (array_key_exists('position_uuid', $validated)) {
            $user->position_id = $validated['position_uuid'] ? Position::where('uuid', $validated['position_uuid'])->value('id') : null;
        }

        $user->fill(collect($validated)->except(['branch_uuid', 'department_uuid', 'position_uuid', 'roles'])->toArray());
        $user->save();

        if (!empty($validated['roles']) && $authUser->can('users.manage-roles')) {
            // Protect last Super Admin from having role stripped
            if ($user->hasRole('Super Admin') && !in_array('Super Admin', $validated['roles'])) {
                $superAdminCount = User::role('Super Admin')->count();
                if ($superAdminCount <= 1) {
                    return ApiResponse::error('Cannot revoke Super Admin role from the last remaining system administrator.', 422);
                }
            }
            $user->syncRoles($validated['roles']);
        }

        AuditLogService::log('user.update', $user, $old, $user->toArray());

        return ApiResponse::success(
            $user->load(['branch', 'department', 'position', 'roles', 'staffProfile', 'studentProfile']),
            'User updated successfully.'
        );
    }

    /**
     * Fast toggle status (active, inactive, suspended).
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,suspended,archived'],
        ]);

        // Prevent disabling yourself or last Super Admin
        if ($user->id === $authUser->id) {
            return ApiResponse::error('You cannot deactivate your own account.', 422);
        }

        $oldStatus = $user->status;
        $user->update(['status' => $validated['status']]);

        AuditLogService::log('user.status_change', $user, ['status' => $oldStatus], ['status' => $user->status]);

        return ApiResponse::success($user, "User status updated to {$user->status}.");
    }

    /**
     * Admin-triggered password reset.
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'new_password' => ['nullable', 'string', 'min:8'],
        ]);

        $newPassword = $validated['new_password'] ?? Str::random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        AuditLogService::log('user.admin_password_reset', $user);

        return ApiResponse::success(['temporary_password' => $newPassword], 'Password reset successfully.');
    }

    /**
     * Soft delete user.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        if (!$authUser->can('users.delete')) {
            return ApiResponse::forbidden();
        }

        if ($user->id === $authUser->id) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        if ($user->hasRole('Super Admin')) {
            return ApiResponse::error('Super Admin accounts cannot be deleted directly.', 422);
        }

        $user->delete();
        AuditLogService::log('user.delete', $user);

        return ApiResponse::success(null, 'User record archived.');
    }
}
