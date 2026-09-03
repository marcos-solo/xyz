<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Certificate;
use App\Services\CertificateGenerationService;
use Illuminate\Http\JsonResponse;

class PublicCertificateVerificationController extends Controller
{
    /**
     * Public unauthenticated verification endpoint.
     * Note: Does NOT expose sensitive student personal data (e.g. email, phone, national_id).
     */
    public function verify(string $verificationCode): JsonResponse
    {
        $certificate = Certificate::where('verification_code', $verificationCode)
            ->orWhere('certificate_number', $verificationCode)
            ->with(['organization', 'course', 'batch.branch', 'template'])
            ->first();

        if (!$certificate) {
            return ApiResponse::error('Certificate not found or verification code is invalid.', 404);
        }

        // Generate QR code SVG for on-screen rendering
        $verificationUrl = url("/verify/{$certificate->verification_code}");
        $qrSvg = CertificateGenerationService::generateQrSvg($verificationUrl);

        return ApiResponse::success([
            'is_valid' => $certificate->status === 'issued',
            'status' => $certificate->status,
            'certificate_number' => $certificate->certificate_number,
            'verification_code' => $certificate->verification_code,
            'recipient_name' => $certificate->student ? $certificate->student->full_name : 'Verified Student',
            'course_name' => $certificate->course?->name,
            'course_code' => $certificate->course?->code,
            'organization_name' => $certificate->organization?->name,
            'branch_name' => $certificate->batch?->branch?->name,
            'cohort_name' => $certificate->batch?->name,
            'issue_date' => $certificate->issue_date->format('F d, Y'),
            'final_grade' => $certificate->final_grade,
            'signatory_name' => $certificate->template?->signatory_name,
            'signatory_title' => $certificate->template?->signatory_title,
            'revoked_reason' => $certificate->status === 'revoked' ? $certificate->revoked_reason : null,
            'qr_code_svg' => $qrSvg,
        ], 'Certificate verification details retrieved.');
    }
}
