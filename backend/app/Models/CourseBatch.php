<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseBatch extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'organization_id',
        'course_id',
        'branch_id',
        'name',
        'code',
        'start_date',
        'end_date',
        'capacity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'capacity' => 'integer',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function batchTrainers(): HasMany
    {
        return $this->hasMany(BatchTrainer::class, 'batch_id');
    }

    public function trainers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'batch_trainers', 'batch_id', 'trainer_id')
            ->withPivot(['id', 'role_type', 'assigned_at'])
            ->withTimestamps();
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'batch_id');
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class, 'batch_id');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class, 'batch_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'batch_id');
    }
}
