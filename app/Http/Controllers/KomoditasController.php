<?php

namespace App\Http\Controllers;

use App\Models\Map;
use App\Models\Kategori;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Komoditas;
use App\Models\Rekomendasi;
use Illuminate\Http\Request;
use App\Exports\KomoditasExport;
use App\Imports\KomoditasImport;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class KomoditasController extends Controller
{
    public function datakomoditas()
    {
        return view('dashboard/komoditas/data-komoditas', [
            'title' => 'Data komoditas',
            'komoditas' => Komoditas::latest()->get(),
        ]);
    }

    public function tambahdatakomoditas()
    {
        return view('dashboard/komoditas/tambah-data-komoditas', [
            'title' => 'Tambah Data komoditas',
            'komoditas' => Komoditas::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData =  $request->validate([
            'nama' => 'required|max:255',
            'deskripsi' => 'required',
            'foto' => 'required',
            'tinggi' => 'nullable|numeric',
            'ph' => 'nullable|numeric',
            'jenistanah' => 'nullable',
            'kelembaban' => 'nullable',
            'musim' => 'nullable',
            'suhu' => 'nullable|numeric',
        ]);

        Komoditas::create($validatedData);

        return redirect('/dashboard/data-komoditas')->with('success', 'Data berhasil ditambahkan!');
    }

    public function delete($id)
    {
        // $data = komoditas::find($id);
        // $data->delete();

        DB::table('komoditas')->where('id', $id)->delete();

        return redirect('/dashboard/data-komoditas')->with('success', 'komoditas berhasil dihapus');
    }

    public function edit($id)
    {
        $komoditas = DB::table('komoditas')->where('id', $id)->first();
        return view('dashboard/komoditas/edit', [
            'title' => 'Edit Data komoditas',
            'komoditas' => $komoditas,
        ]);
    }

    public function editdatakomoditas(Request $request, $id)
    {
        $validatedData =  $request->validate([
            'nama' => 'required|max:255',
            'deskripsi' => 'required',
            'foto' => 'required',
            'tinggi' => 'nullable|numeric',
            'ph' => 'nullable|numeric',
            'jenistanah' => 'nullable',
            'kelembaban' => 'nullable',
            'musim' => 'nullable',
            'suhu' => 'nullable|numeric',
        ]);

        $data = new Map();
        $data_rekomendasi = $data->tampil();
        $data_foto = [
            'marker_image' => $validatedData['foto'],
            'title' => $validatedData['nama']
        ];

        foreach ($data_rekomendasi as $dt) {
            if ($dt['komoditas_id'] == $id) {
                $data->edit($dt['id'], $data_foto);
                Rekomendasi::where('id', $dt['id'])->update($data_foto);
            }
        }

        Komoditas::where('id', $id)->update($validatedData);
        return redirect('/dashboard/data-komoditas')->with('success', 'komoditas berhasil diubah');
    }

    public function export()
    {
        return Excel::download(new KomoditasExport, 'data-komoditas.xlsx');
    }


    public function import()
    {

        Excel::import(new KomoditasImport, request()->file('file'));

        return redirect('/dashboard/data-komoditas')->with('success', 'Import Berhasil');
    }

    public function exportpdf()
    {
        $data = Komoditas::all();

        view()->share('data', $data);
        $pdf = PDF::loadview('/dashboard/komoditas/pdf-komoditas');
        return $pdf->download('data-komoditas.pdf');
    }
}