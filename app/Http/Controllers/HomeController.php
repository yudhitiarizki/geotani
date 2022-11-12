<?php

namespace App\Http\Controllers;

use File;
use App\Models\Map;
use App\Models\User;
use App\Models\Video;
use App\Models\Produk;
use App\Models\Artikel;
use App\Models\Kategori;
use App\Exports\UsersExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;

class HomeController extends Controller
{
    public function index()
    {
        return view('home', [
            'title' => 'Digitalisasi Pertanian',
            'preload' => 1,
            'video' => Video::with(['kategori'])->latest()->get(),
            'artikel' => Artikel::with(['kategori'])->latest()->get(),
            'produk' => Produk::latest()->get(),
        ]);
    }

    public function export()
    {
        return Excel::download(new UsersExport, 'users.xlsx');
    }

    public function tentangkami()
    {
        return view('tentang-kami', [
            'title' => 'Tentang Kami'
        ]);
    }

    public function dashboard()
    {
        return view('dashboard/dashboard', [
            'title' => 'Dashboard',
            'user' => User::latest()->get(),
        ]);
    }


    public function dataproduk()
    {
        return view('dashboard/dataproduk', [
            'title' => 'Dashboard'
        ]);
    }

    public function login()
    {
        return view('login', [
            'title' => 'Login'
        ]);
    }

    public function register()
    {
        return view('signup', [
            'title' => 'Sign up'
        ]);
    }

    public function store(Request $request)
    {
        $validatedData =  $request->validate([
            'nama_depan' => 'required|max:255',
            'nama_belakang' => 'max:255',
            'email' => 'email|max:255|unique:users|required',
            'pekerjaan' => 'required|max:255',
            'no_hp' => 'required|unique:users,no_hp',
            'password' => 'required|max:255|min:8'

        ]);

        //$validatedData['password'] = bcrypt($validatedData['password']);

        $validatedData['password'] = Hash::make($validatedData['password']);
        $validatedData['roles'] = 0;

        $validatedData['longitude'] = '106.79945570749875';
        $validatedData['latitude'] = '-6.597676329350807';

        // User::create($validatedData);

        DB::table('users')->insert($validatedData);



        // $request->session()->flash('success', 'Registrasai berhasil! Silahkan Login');

        return redirect('/login')->with('success', 'Registrasai berhasil! Silahkan Login');
    }

    public function authenticate(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email:dns',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/');
        };

        return back()->with('loginError', 'Login Gagal!');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    public function searchmap(Request $request)
    {
        $validatedData =  $request->validate([
            'longitude' => 'required',
            'latitude' => 'required'
        ]);

        $id = auth()->user()->id;


        User::where('id', $id)->update($validatedData);
        return redirect('/#gtn-map-hero');
    }

    public function contact()
    {
        $data_user = User::all();
        return view('contact', [
            'title' => 'contact',
            'user' => $data_user
        ]);
    }
}