<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradingScheme extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'organization_id',
        'name',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function ranges(): HasMany
    {
        return $this->hasMany(GradingScaleRange::class, 'scheme_id')->orderByDesc('min_percentage');
    }
}
