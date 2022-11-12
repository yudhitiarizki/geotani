@extends('layout.main')

@section('container')
<section id="page-title">
    <div class="container ma">
      <div class="d-block d-sm-flex justify-content-between">
        <!--Title-->
        <div class="gtn-title mb-0">
          <h2>Detai Rekomendasi</h2>
        </div>
      </div>
    </div>
  </section>

  <section id="foto">
    <div class="container mb-3 foto">
      <img
        class="foto"
        width="100%"
        src="https://images.unsplash.com/photo-1656690446569-57b818d4e10c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
        alt=""
      />
    </div>
  </section>

  <!--CONTENT
      =========================================================================================================-->
  <section id="content">
    <div class="container">
      <div class="row flex-wrap-reverse">
        <!--LEFT SIDE
                  =============================================================================================-->
        <div class="col-md-5 col-lg-4">
          <!--DETAILS
                      =========================================================================================-->
          <section>
            <h3>Details</h3>
            <div class="gtn-box">
              <dl class="gtn-description-list__line mb-0">
                <dt>Komoditas:</dt>
                <dd>{{ $komoditas->nama }}</dd>

                <dt>Ketinggian:</dt>
                <dd>{{ $komoditas->tinggi."m" }}</dd>

                <dt>Ph Tanah:</dt>
                <dd>{{ $komoditas->ph }}</dd>

                <dt>Jenis Tanah:</dt>
                <dd>{{ $komoditas->jenistanah }}</dd>

                <dt>Kelembaban:</dt>
                <dd>{{ $komoditas->kelembaban }}</dd>

                <dt>Musim:</dt>
                <dd>{{ $komoditas->musim }}</dd>

                <dt>Suhu:</dt>
                <dd>{{ $komoditas->suhu }}</dd>

              </dl>
            </div>
          </section>

          <!--ACTIONS
                  =============================================================================================-->
          <section id="actions">
            <div class="d-flex justify-content-between">
              <a
                href="#"
                class="btn-custom mr-2 w-100"
                data-toggle="tooltip"
                data-placement="top"
                title="Add to favorites"
              >
                <i class="far fa-star"></i>
              </a>

              <a
                href="#"
                class="btn-custom mr-2 w-100"
                data-toggle="tooltip"
                data-placement="top"
                title="Report"
              >
                <i class="fa fa-exclamation-triangle"></i>
              </a>

              <a
                href="#"
                class="btn-custom w-100"
                data-toggle="tooltip"
                data-placement="top"
                title="Share"
              >
                <i class="fa fa-share-alt"></i>
              </a>
            </div>
          </section>
        </div>
        <div class="col-md-7 col-lg-8">
          <section id="description">
            {!! $komoditas->deskripsi !!}
          </section>
          

        <div class="row">
            <hr class="mb-5" />

            <h3>Rekomendasi Video</h3>
            <br />

            <?php $i = 1 ?>
            @foreach ($video as $al)
                @if ($i < 4)
                    <div class="col-6 col-md-6 col-lg-4">
                        <!-- member starts -->
                        <div class="gtn-team gtn-team-social-onhover text-center gtn-team-offset-border gtn-box-rounded">
                        <div class="gtn-team-content-wrapper gtn-shadow">
                            <div class="gtn-post-img">
                            <img src="{{ asset('storage/'.$al->foto) }}" alt="image" />
                            </div>
                            <div class="gtn-post-content p-2 pt-4 align-items-center justify-content-center d-flex" style="min-height: 150px">
                                <span class="gtn-meta-category"><a href="{{ url('/detail-video/'.$al->id) }}">{{ $al->kategori->nama }}</a></span>
                                
                            <h5 class="gtn-post-title">
                                <a href="{{ url('/detail-video/'.$al->id) }}" rel="bookmark">{{ $al->nama }}</a>
                            </h5>
                            </div>
                        </div>
                        </div>
                        <!-- member ends -->
                    </div>
                @endif
            @endforeach

          
        </div>
          

        <div class="row">
            <hr class="mb-5" />

            <h3>Rekomendasi Artikel</h3>
            <br />

            <?php $i = 1 ?>
            @foreach ($artikel as $al)
                @if ($i < 4)
                    <div class="col-6 col-md-4 col-sm-6 mb-5"">
                        <div class="gtn-post-item">
                            <div class="gtn-post-img">
                                <img src="{{ asset('storage/'.$al->foto) }}" alt="image" />
                            </div>
                            <div class="gtn-post-content">
                                <span class="gtn-meta-category">
                                    <a href="#">{{ $al->kategori->nama }}</a>
                                </span>
                                <h5 class="gtn-post-title mb-0">
                                    <a href="#" rel="bookmark">{{ $al->nama }}</a>
                                </h5>
                                <div class="hide mt-0">
                                    <a class="gtn-read-more mt-2" href="{{ url('/detail-artikel/'.$al->id) }}">
                                        <span class="gtn-read-more-content">Selengkapnya ...</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            @endforeach

          
        </div>
        


    </div>
    <!--end container-->
  </section>
@endsection