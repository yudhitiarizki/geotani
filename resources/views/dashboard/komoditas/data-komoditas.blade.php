@extends('dashboard.layout.main')

@section('container')
<div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-12">
        <h2 class="mb-2 page-title">Data Tabel komoditas</h2>
        <a class="btn mb-1 btn-success text-white" href="/dashboard/tambah-data-komoditas"><i class="fe fe-plus mr-1 fe-16 "></i>Tambah Data</a>
        <a class="btn mb-1 ml-2 btn-success text-white" href="/download-data-komoditas"><i class="fe fe-download mr-1 fe-16 "></i>Export Excel</a>
        <a class="btn mb-1 ml-2 btn-warning text-white" href="#" data-toggle="modal" data-target="#exampleModal"><i class="fe fe-upload mr-1 fe-16 "></i>Import</a>
        <a class="btn mb-1 ml-2 btn-danger text-white" href="/pdf-komoditas" ><i class="fe fe-download mr-1 fe-16 "></i>Export PDF</a>
        @if (session()->has('success'))

          <div class="alert alert-success alert-dismissible fade show mt-2" role="alert">
            {{ session('success') }}<button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
           
        @endif
                               
        <div class="row my-4">
          <!-- Small table -->
          <div class="col-md-12">
            <div class="card shadow">
              <div class="card-body">
                <!-- table -->
                <table class="table datatables" id="dataTable-1">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Ketinggian</th>
                      <th>Jenis Tanah</th>
                      <th>Ph Tanah</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php $i = 1 ?>
                    @foreach ($komoditas as $ar)
                    <tr>
                      <td>{{ $i }}</td>
                      <td>{{ $ar['nama'] }}</td>
                      <td>{{ $ar->tinggi }}</td> 
                      <td>{{ $ar['jenistanah'] }}</td>
                      <td>{{ $ar->ph }}</td> 
                      <td>
                        <div class="row flex align-items-center justify-content-start">
                          <a href="{{ url('/dashboard/data-komoditas/edit/'.$ar->id) }}" class="btn mb-2 mr-2 btn-warning text-white">Edit</a>
                          <form action="{{ url('/dashboard/data-komoditas/'.$ar['id']) }}" method="POST">
                            @method('delete')
                            @csrf
                            <button class="btn mb-2 btn-danger" onclick="return confirm('yakin hapus data?')">Hapus</button>
                          </form>
                      </div>
                      </td>
                    </tr>
                    
                    <?php $i+=1 ?>
                    @endforeach
                  </tbody>
                </table>
              </div>
            </div>
          </div> <!-- simple table -->
        </div> <!-- end section -->
      </div> <!-- .col-12 -->
    </div> <!-- .row -->
  </div>
  <!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Import File</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form action="/data-komoditas" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="modal-body">
            <div class="form-group">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="inputGroupFileAddon01">Upload</span>
                </div>
                <div class="custom-file">
                  <input type="file" class="custom-file-input" name="file" id="inputGroupFile02" aria-describedby="inputGroupFileAddon01">
                  <label class="custom-file-label" for="inputGroupFile02">Choose file</label>
                </div>
              </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-success text-white">Upload File</button>
        </div>
      </form>
    </div>
  </div>
</div>
@endsection