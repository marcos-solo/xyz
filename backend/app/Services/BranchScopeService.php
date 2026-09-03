<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class BranchScopeService
{
    /**
     * Determine if a user has global cross-branch visibility.
     */
    public static function canAccessAllBranches(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $user->hasRole('Super Admin')
            || $user->can('branches.view-all-branches')
            || $user->can('students.view-all-branches');
    }

    /**
     * Scope an Eloquent query by branch if the user does not have global privileges.
     */
    public static function apply(Builder $query, ?User $user, string $branchColumn = 'branch_id'): Builder
    {
        if (!$user || self::canAccessAllBranches($user)) {
            return $query;
        }

        if ($user->branch_id) {
            $query->where($branchColumn, $user->branch_id);
        }

        return $query;
    }
}
