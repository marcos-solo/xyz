<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentProfile extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'student_number',
        'admission_date',
        'date_of_birth',
        'gender',
        'national_id',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'admission_date' => 'date',
            'date_of_birth' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(Guardian::class, 'student_guardians')
            ->withPivot(['id', 'relationship', 'is_emergency_contact', 'is_primary_contact'])
            ->withTimestamps();
    }
}
