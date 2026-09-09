<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enrollment extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    public const WORKFLOW_STAGES = [
        'registered',
        'branch_review',
        'finance_cleared',
        'in_training',
        'course_completed',
        'certification_ready',
        'certified',
    ];

    protected $fillable = [
        'uuid',
        'student_id',
        'batch_id',
        'enrollment_number',
        'enrollment_date',
        'status',
        'workflow_stage',
        'workflow_updated_by',
        'workflow_updated_at',
        'finance_cleared_by',
        'finance_cleared_at',
        'completion_date',
        'final_grade',
        'final_score',
    ];

    protected function casts(): array
    {
        return [
            'enrollment_date' => 'date',
            'completion_date' => 'date',
            'final_score' => 'decimal:2',
            'workflow_updated_at' => 'datetime',
            'finance_cleared_at' => 'datetime',
        ];
    }

    public function workflowUpdatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'workflow_updated_by');
    }

    public function financeClearedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finance_cleared_by');
    }

    public function finance(): HasOne
    {
        return $this->hasOne(EnrollmentFinance::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }
}
