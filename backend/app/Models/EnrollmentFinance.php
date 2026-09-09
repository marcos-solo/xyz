<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EnrollmentFinance extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'total_fee',
        'amount_paid',
        'currency',
        'status',
        'cleared_by',
        'cleared_at',
    ];

    protected function casts(): array
    {
        return [
            'total_fee' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'cleared_at' => 'datetime',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function clearedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cleared_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FinancePayment::class);
    }
}
