<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ClassSession extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'batch_id',
        'trainer_id',
        'title',
        'topic',
        'date',
        'start_time',
        'end_time',
        'delivery_mode',
        'location',
        'meeting_url',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function attendanceSession(): HasOne
    {
        return $this->hasOne(AttendanceSession::class);
    }
}
