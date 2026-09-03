<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\StudentProfile;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;

class StudentNumberGeneratorService
{
    public static function generate(?int $organizationId = null): string
    {
        $org = $organizationId ? Organization::find($organizationId) : Organization::first();
        $prefix = $org?->code ?? 'LMS';
        $year = Carbon::now()->format('Y');

        // Check if there is a custom format setting
        $customFormat = SystemSetting::where('organization_id', $org?->id)
            ->where('key', 'student_number_format')
            ->value('value') ?? '{PREFIX}-{YEAR}-{SEQ:4}';

        // Count existing students in the current year to determine sequence
        $countThisYear = StudentProfile::whereYear('created_at', $year)->count() + 1;
        $sequence = str_pad((string) $countThisYear, 4, '0', STR_PAD_LEFT);

        $number = str_replace(
            ['{PREFIX}', '{YEAR}', '{SEQ:4}', '{SEQ:5}'],
            [$prefix, $year, $sequence, str_pad((string) $countThisYear, 5, '0', STR_PAD_LEFT)],
            $customFormat
        );

        // Ensure uniqueness
        while (StudentProfile::where('student_number', $number)->exists()) {
            $countThisYear++;
            $sequence = str_pad((string) $countThisYear, 4, '0', STR_PAD_LEFT);
            $number = str_replace(
                ['{PREFIX}', '{YEAR}', '{SEQ:4}', '{SEQ:5}'],
                [$prefix, $year, $sequence, str_pad((string) $countThisYear, 5, '0', STR_PAD_LEFT)],
                $customFormat
            );
        }

        return $number;
    }
}
