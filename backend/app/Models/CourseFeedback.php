<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseFeedback extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'course_feedbacks';

    protected $fillable = [
        'uuid',
        'batch_id',
        'student_id',
        'trainer_id',
        'lesson_id',
        'unit_code',
        'period',
        'rating',
        'category',
        'comments',
        'metrics',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'metrics' => 'array',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
