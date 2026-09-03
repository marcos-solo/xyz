<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseProgress extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'course_progress';

    protected $fillable = [
        'uuid',
        'user_id',
        'course_id',
        'batch_id',
        'progress_percentage',
        'completed_lessons_count',
        'total_lessons_count',
        'completed_modules_count',
        'total_modules_count',
        'started_at',
        'completed_at',
        'last_accessed_at',
    ];

    protected function casts(): array
    {
        return [
            'progress_percentage' => 'decimal:2',
            'completed_lessons_count' => 'integer',
            'total_lessons_count' => 'integer',
            'completed_modules_count' => 'integer',
            'total_modules_count' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'last_accessed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }
}
