<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CourseBatch;
use App\Models\CourseProgress;
use App\Models\Enrollment;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CertificateGenerationService
{
    /**
     * Check if a student meets the criteria for certificate issuance.
     */
    public static function checkEligibility(User $student, CourseBatch $batch, CertificateTemplate $template): array
    {
        $requirements = $template->requirements_config ?? [
            'min_course_progress' => 80,
            'min_attendance' => 75,
            'min_final_score' => 50,
        ];

        // 1. Check Course Progress
        $courseProgress = CourseProgress::where('user_id', $student->id)
            ->where('batch_id', $batch->id)
            ->first();
        $progressPct = (float) ($courseProgress?->progress_percentage ?? 0);
        $progressPass = $progressPct >= ($requirements['min_course_progress'] ?? 80);

        // 2. Check Attendance
        $totalSessions = AttendanceSession::where('batch_id', $batch->id)->count();
        $attendedCount = 0;
        if ($totalSessions > 0) {
            $attendedCount = AttendanceRecord::whereHas('session', function ($q) use ($batch) {
                $q->where('batch_id', $batch->id);
            })->where('student_id', $student->id)
                ->whereIn('status', ['Present', 'Late'])
                ->count();
            $attendancePct = ($attendedCount / $totalSessions) * 100;
        } else {
            $attendancePct = 100; // No recorded sessions yet
        }
        $attendancePass = $attendancePct >= ($requirements['min_attendance'] ?? 75);

        // 3. Check Enrollment Final Score
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('batch_id', $batch->id)
            ->first();
        $finalScore = (float) ($enrollment?->final_score ?? 85.00);
        $scorePass = $finalScore >= ($requirements['min_final_score'] ?? 50);

        $isEligible = $progressPass && $attendancePass && $scorePass;

        return [
            'eligible' => $isEligible,
            'progress_percentage' => round($progressPct, 1),
            'required_progress' => $requirements['min_course_progress'] ?? 80,
            'progress_pass' => $progressPass,
            'attendance_percentage' => round($attendancePct, 1),
            'required_attendance' => $requirements['min_attendance'] ?? 75,
            'attendance_pass' => $attendancePass,
            'final_score' => round($finalScore, 1),
            'required_score' => $requirements['min_final_score'] ?? 50,
            'score_pass' => $scorePass,
        ];
    }

    /**
     * Issue and generate certificate record.
     */
    public static function issue(
        User $student,
        CourseBatch $batch,
        CertificateTemplate $template,
        ?User $issuer = null,
        bool $force = false
    ): Certificate {
        $eligibility = self::checkEligibility($student, $batch, $template);

        if (! $eligibility['eligible'] && ! $force) {
            throw new \Exception('Student does not satisfy the certificate requirements: Progress '.$eligibility['progress_percentage'].'%, Attendance '.$eligibility['attendance_percentage'].'%');
        }

        // Generate unique numbers
        $year = Carbon::now()->format('Y');
        $certCount = Certificate::whereYear('created_at', $year)->count() + 1;
        $certNumber = sprintf('IAT-CERT-%s-%05d', $year, $certCount);
        $verificationCode = sprintf('IAT-%s-%s', strtoupper($batch->course->code ?? 'CERT'), strtoupper(Str::random(6)));

        $certificate = Certificate::create([
            'organization_id' => $batch->organization_id,
            'certificate_number' => $certNumber,
            'verification_code' => $verificationCode,
            'template_id' => $template->id,
            'student_id' => $student->id,
            'course_id' => $batch->course_id,
            'batch_id' => $batch->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'final_grade' => $eligibility['final_score'] >= 80 ? 'A' : ($eligibility['final_score'] >= 70 ? 'B' : 'C'),
            'final_score' => $eligibility['final_score'],
            'status' => 'issued',
            'issued_by' => $issuer?->id,
        ]);

        return $certificate;
    }

    /**
     * Generate QR Code SVG string for verification URL.
     */
    public static function generateQrSvg(string $verificationUrl): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(150),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);

        return $writer->writeString($verificationUrl);
    }
}
