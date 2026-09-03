<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentQuestion extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'assessment_id',
        'question_text',
        'question_type',
        'marks',
        'explanation',
        'difficulty',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'marks' => 'decimal:2',
            'order' => 'integer',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(AssessmentOption::class, 'question_id')->orderBy('order');
    }
}
