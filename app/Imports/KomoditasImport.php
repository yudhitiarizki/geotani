<?php

namespace App\Imports;

use App\Models\Komoditas;
use Maatwebsite\Excel\Concerns\ToModel;

class KomoditasImport implements ToModel
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        return new Komoditas([
            'nama' => $row[3],
            'deskripsi' => $row[4],
            'foto' => $row[5],
            'tinggi' => $row[6],
            'ph' => intval($row[7]),
            'jenistanah' => $row[8],
            'kelembaban' => $row[9],
            'musim' => $row[10],
            'suhu' => intval($row[11]),
        ]);
    }
}