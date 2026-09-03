<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradingScaleRange extends Model
{
    use HasFactory;

    protected $fillable = [
        'scheme_id',
        'grade_letter',
        'min_percentage',
        'max_percentage',
        'gpa_point',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'min_percentage' => 'decimal:2',
            'max_percentage' => 'decimal:2',
            'gpa_point' => 'decimal:2',
        ];
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(GradingScheme::class, 'scheme_id');
    }
}
