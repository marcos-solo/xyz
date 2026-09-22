<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'organization_id',
        'category_id',
        'learning_path_id',
        'code',
        'name',
        'short_description',
        'description',
        'program_level',
        'entry_requirements',
        'paper_count',
        'thumbnail_path',
        'duration',
        'duration_unit',
        'level',
        'status',
        'created_by',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'learning_path_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->whereNull('unit_id')->orderBy('order');
    }

    public function allModules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('order');
    }

    public function units(): HasMany
    {
        return $this->hasMany(CourseUnit::class)->orderBy('order');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(CourseBatch::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }
}
