<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'module_id',
        'title',
        'description',
        'content_type',
        'content',
        'video_url',
        'file_path',
        'external_url',
        'duration',
        'order',
        'is_preview',
        'transcript',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_preview' => 'boolean',
            'duration' => 'integer',
            'order' => 'integer',
            'transcript' => 'array',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(LessonResource::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
