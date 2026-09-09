<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CourseBatch;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\CertificateGenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $query = Certificate::with(['student.studentProfile', 'course', 'batch.branch', 'template', 'issuer']);

        if ($authUser->hasRole('Student')) {
            $query->where('student_id', $authUser->id);
        }

        if ($request->filled('batch_uuid')) {
            $batch = CourseBatch::where('uuid', $request->batch_uuid)->first();
            if ($batch) {
                $query->where('batch_id', $batch->id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $certificates = $query->latest()->get();

        return ApiResponse::success($certificates);
    }

    /**
     * Check eligibility before issuing.
     */
    public function checkEligibility(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_uuid' => ['required', 'exists:users,uuid'],
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'template_uuid' => ['required', 'exists:certificate_templates,uuid'],
        ]);

        $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $template = CertificateTemplate::where('uuid', $validated['template_uuid'])->firstOrFail();
        $eligibility = CertificateGenerationService::checkEligibility($student, $batch, $template);

        return ApiResponse::success($eligibility);
    }

    /**
     * Issue a certificate for a student & batch.
     */
    public function issue(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('certificates.issue')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'student_uuid' => ['required', 'exists:users,uuid'],
            'batch_uuid' => ['required', 'exists:course_batches,uuid'],
            'template_uuid' => ['required', 'exists:certificate_templates,uuid'],
            'force' => ['nullable', 'boolean'],
        ]);

        $student = User::where('uuid', $validated['student_uuid'])->firstOrFail();
        $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->firstOrFail();
        $template = CertificateTemplate::where('uuid', $validated['template_uuid'])->firstOrFail();
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('batch_id', $batch->id)
            ->first();

        if (! $enrollment || $enrollment->workflow_stage !== 'certification_ready') {
            return ApiResponse::error('The enrollment must be approved through certification readiness before a certificate can be issued.', 422);
        }

        try {
            $cert = CertificateGenerationService::issue(
                $student,
                $batch,
                $template,
                $authUser,
                $validated['force'] ?? false
            );

            AuditLogService::log('certificate.issue', $cert, null, [
                'student' => $student->full_name,
                'cert_number' => $cert->certificate_number,
            ]);

            $enrollment->update([
                'workflow_stage' => 'certified',
                'workflow_updated_by' => $authUser->id,
                'workflow_updated_at' => now(),
            ]);

            return ApiResponse::success(
                $cert->load(['student.studentProfile', 'course', 'batch', 'template']),
                'Certificate issued successfully.',
                201
            );
        } catch (\Exception $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }
    }

    /**
     * Revoke an issued certificate with reason.
     */
    public function revoke(Request $request, Certificate $certificate): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('certificates.revoke')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5'],
        ]);

        $old = $certificate->toArray();

        $certificate->update([
            'status' => 'revoked',
            'revoked_reason' => $validated['reason'],
            'revoked_at' => now(),
            'revoked_by' => $authUser->id,
        ]);

        AuditLogService::log('certificate.revoke', $certificate, $old, $certificate->toArray());

        return ApiResponse::success($certificate, 'Certificate has been revoked.');
    }
}
