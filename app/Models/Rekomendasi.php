<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rekomendasi extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function komoditas()
    {
        return $this->belongsTo(Komoditas::class);
    }
}