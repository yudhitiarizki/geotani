<?php

namespace App\Models;

use App\Models\Rekomendasi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Komoditas extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    public function rekomendasi()
    {
        return $this->hasMany(Rekomendasi::class);
    }

    public function rekCount()
    {
        return $this->rekomendasi->count();
    }
}