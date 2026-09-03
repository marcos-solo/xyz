<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'organization_id',
        'batch_id',
        'title',
        'description',
        'type',
        'weight_percentage',
        'total_marks',
        'pass_mark',
        'time_limit',
        'attempts_allowed',
        'randomize_questions',
        'randomize_options',
        'show_immediate_results',
        'show_correct_answers',
        'due_date',
        'resource_file_path',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'weight_percentage' => 'decimal:2',
            'total_marks' => 'decimal:2',
            'pass_mark' => 'decimal:2',
            'time_limit' => 'integer',
            'attempts_allowed' => 'integer',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'show_immediate_results' => 'boolean',
            'show_correct_answers' => 'boolean',
            'due_date' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AssessmentQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(AssessmentAttempt::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
