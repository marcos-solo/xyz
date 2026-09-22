<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Organization;
use App\Models\StudentProfile;
use Illuminate\Support\Carbon;

class StudentNumberGeneratorService
{
    public static function generate(?int $organizationId = null, ?int $branchId = null): string
    {
        $org = $organizationId ? Organization::find($organizationId) : Organization::first();
        $branch = $branchId ? Branch::find($branchId) : null;
        $prefix = 'IAT/'.strtoupper($branch?->code ?? $org?->code ?? 'HQ');
        $year = Carbon::now()->format('Y');

        // Count existing students in the current year to determine sequence
        $countThisYear = StudentProfile::whereYear('student_profiles.created_at', $year)
            ->when($branch, fn ($query) => $query->whereHas('user', fn ($userQuery) => $userQuery->where('branch_id', $branch->id)))
            ->count() + 1;
        $sequence = str_pad((string) $countThisYear, 4, '0', STR_PAD_LEFT);
        $number = "{$prefix}/{$year}/{$sequence}";

        // Ensure uniqueness
        while (StudentProfile::where('student_number', $number)->exists()) {
            $countThisYear++;
            $sequence = str_pad((string) $countThisYear, 4, '0', STR_PAD_LEFT);
            $number = "{$prefix}/{$year}/{$sequence}";
        }

        return $number;
    }
}
