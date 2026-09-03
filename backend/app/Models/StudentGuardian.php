<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class StudentGuardian extends Pivot
{
    protected $table = 'student_guardians';

    protected $fillable = [
        'student_profile_id',
        'guardian_id',
        'relationship',
        'is_emergency_contact',
        'is_primary_contact',
    ];

    protected function casts(): array
    {
        return [
            'is_emergency_contact' => 'boolean',
            'is_primary_contact' => 'boolean',
        ];
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }
}
