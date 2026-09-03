<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffProfile extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'employee_number',
        'employment_date',
        'employment_type',
        'job_title',
        'national_id',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'specialization',
        'bio',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'employment_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
