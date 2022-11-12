<?php

namespace App\Exports;

use App\Models\Komoditas;
use Maatwebsite\Excel\Concerns\FromCollection;

class KomoditasExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Komoditas::all();
    }
}
