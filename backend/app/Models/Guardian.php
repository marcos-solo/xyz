<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guardian extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'uuid',
        'organization_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'occupation',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(StudentProfile::class, 'student_guardians')
            ->withPivot(['id', 'relationship', 'is_emergency_contact', 'is_primary_contact'])
            ->withTimestamps();
    }
}
