@extends('dashboard.layout.main')

@section('container')

<h2 class="h2 page-title ml-3 mb-3">Selamat datang, {{ auth()->user()->nama_depan }}</h2>

<div class="col-md-12 mb-4">
    <div class="card profile shadow">
    <div class="card-body my-4">
        <div class="row align-items-center">
        <div class="col-md-3 text-center mb-5">
            <a href="#!" class="avatar avatar-xl">
            <img src="{{ asset('dashboard-assets/assets/images/logo-pav.png') }}" alt="..." class="avatar-img">
            </a>
        </div>
        <div class="col">
            <div class="row align-items-center">
            <div class="col-md-7">
                <h3 class="mb-1">Geotani</h3>
            </div>
            <div class="col">
            </div>
            </div>
            <div class="row mb-4">
            <div class="col-md-7">
                <p class="text-muted"> Geotani adalah website yang menyediakan ruang untuk petani memperoleh informasi dan edukasi. Website ini memiliki fitur utama, yaitu memberikan rekomendasi tanaman yang cocok untuk ditanam dilahan para user (petani).
                    Selain itu, geotani juga memiliki beberapa fitur lainnya, seperti halaman yang menyediakan artikel, video edukasi dan e-commerce terkait pertanian.
                </p>
            </div>
            <div class="col">
                <p class="small mb-0 text-muted">Institut Pertanian Bogor</p>
                <p class="small mb-0 text-muted">Sekolah Vokasi</p>
                <p class="small mb-2 text-muted">Teknik Rekayasa Perangkat Lunak</p>
                <a type="button" class="btn btn-primary text-white mt-3">Ayo Mulai!</a>
            </div>
            </div>
        </div>
        </div> <!-- / .row- -->
    </div> <!-- / .card-body - -->
    </div> <!-- / .card- -->
</div>

<div class="col-12 p-0" style="flex-direction: row; display:flex;">
    <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header" style="display: flex; align-items:center; justify-content:space-between">
            <strong class=" float-left">User yang terdaftar</strong>
            <a class="btn mb-1 btn-success text-white" href="/download-data-user"><i class="fe fe-download mr-1 fe-16 "></i>Download</a>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush my-0">
              <?php $i = 1 ?>
              @foreach ($user as $usr)
                  @if ($i < 4)
                    <div class="list-group-item">
                        <div class="row">
    
                        <div class="col-auto">
                            <div class="avatar avatar-sm mt-2">
                            <img src="{{ asset('dashboard-assets/assets/images/logo-pav.png') }}" alt="..." class="avatar-img rounded-circle">
                            </div>
                        </div>
    
                        <div class="col">
    
                            <small><strong>{{ $usr->nama_depan.' '.$usr->nama_belakang }} </strong></small>
                            <div class="my-0 text-muted small">{{ $usr->pekerjaan }}</div>
                            <small class="badge badge-light text-muted">{{ $usr->email }}</small>
    
                        </div>
                        
                        </div>
                    </div> 
                    <?php $i += 1 ?>
                  @endif
              @endforeach
    
            </div> <!-- / .list-group -->
          </div> <!-- / .card-body -->
        </div> <!-- / .card -->
    </div>
    <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col">
                <strong class="card-title">Sparkline line</strong>
                <p class="small mb-0"><span class="fe fe-12 fe-arrow-down text-danger"></span><span class="text-muted">-6.8%</span></p>
              </div>
              <div class="col-4 text-right">
                <span class="sparkline inlineline"></span>
              </div>
            </div> <!-- /. row -->
          </div> <!-- /. card-body -->
        </div> <!-- /. card -->
      </div>
  </div>
</div>


    

@endsection