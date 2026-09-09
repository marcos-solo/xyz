<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Enrollment;
use App\Models\EnrollmentFinance;
use App\Models\FinancePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->can('finance.view')) {
            return ApiResponse::forbidden();
        }

        $finance = EnrollmentFinance::with([
            'enrollment.student.studentProfile',
            'enrollment.batch.course',
            'enrollment.batch.branch',
            'payments.recordedBy',
        ])->latest()->paginate(min($request->integer('per_page', 20), 100));

        return ApiResponse::success($finance->items(), 'Finance records retrieved.', 200, [
            'current_page' => $finance->currentPage(),
            'last_page' => $finance->lastPage(),
            'per_page' => $finance->perPage(),
            'total' => $finance->total(),
        ]);
    }

    public function setFee(Request $request, Enrollment $enrollment): JsonResponse
    {
        if (! $request->user()->can('finance.update')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'total_fee' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'waived' => ['nullable', 'boolean'],
        ]);

        $finance = $enrollment->finance()->firstOrCreate([], [
            'total_fee' => 0,
            'amount_paid' => 0,
            'currency' => $validated['currency'] ?? 'KES',
        ]);
        $totalFee = (float) $validated['total_fee'];
        $amountPaid = (float) $finance->amount_paid;
        if ($totalFee < $amountPaid) {
            return ApiResponse::error('The total fee cannot be lower than payments already received.', 422);
        }

        $finance->update([
            'total_fee' => $totalFee,
            'currency' => $validated['currency'] ?? $finance->currency,
            'status' => ($validated['waived'] ?? false) ? 'waived' : $this->statusFor($totalFee, $amountPaid),
        ]);

        return ApiResponse::success($finance->fresh()->load('payments'), 'Enrollment fee updated.');
    }

    public function recordPayment(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->can('finance.create')) {
            return ApiResponse::forbidden();
        }

        $validated = $request->validate([
            'enrollment_uuid' => ['required', 'exists:enrollments,uuid'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['required', 'in:cash,mpesa,bank_transfer,card,other'],
            'reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $payment = DB::transaction(function () use ($validated, $authUser): FinancePayment {
            $enrollment = Enrollment::where('uuid', $validated['enrollment_uuid'])->firstOrFail();
            $finance = $enrollment->finance()->lockForUpdate()->firstOrCreate([], [
                'total_fee' => 0,
                'amount_paid' => 0,
                'currency' => 'KES',
            ]);
            $balance = (float) $finance->total_fee - (float) $finance->amount_paid;
            if ((float) $validated['amount'] > $balance) {
                abort(422, 'Payment exceeds the outstanding enrollment balance.');
            }

            $payment = $finance->payments()->create([
                'receipt_number' => 'RCT-'.now()->format('YmdHis').'-'.random_int(100, 999),
                'amount' => $validated['amount'],
                'currency' => $finance->currency,
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'recorded_by' => $authUser->id,
                'paid_at' => $validated['paid_at'] ?? now(),
            ]);
            $amountPaid = (float) $finance->amount_paid + (float) $payment->amount;
            $finance->update([
                'amount_paid' => $amountPaid,
                'status' => $this->statusFor((float) $finance->total_fee, $amountPaid),
            ]);

            return $payment;
        });

        return ApiResponse::success($payment->load('enrollmentFinance.enrollment'), 'Payment recorded.', 201);
    }

    private function statusFor(float $totalFee, float $amountPaid): string
    {
        if ($totalFee > 0 && $amountPaid >= $totalFee) {
            return 'cleared';
        }

        return $amountPaid > 0 ? 'partially_paid' : 'pending';
    }
}
