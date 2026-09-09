<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_finance_id',
        'receipt_number',
        'amount',
        'currency',
        'method',
        'reference',
        'status',
        'recorded_by',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function enrollmentFinance(): BelongsTo
    {
        return $this->belongsTo(EnrollmentFinance::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
