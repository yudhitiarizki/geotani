<!DOCTYPE html>
<html>
<head>
<style>
#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#customers td, #customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#customers tr:nth-child(even){background-color: #f2f2f2;}

#customers tr:hover {background-color: #ddd;}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
}
</style>
</head>
<body>

<h1>Data Komoditas</h1>

<table id="customers">
  <tr>
    <th>No</th>
    <th>Nama</th>
    <th>Ketinggian</th>
    <th>Ph Tanah</th>
    <th>Jenis Tanah</th>
    <th>Kelembaban</th>
    <th>Musim</th>
    <th>Suhu</th>
  </tr>
  <?php $i = 1 ?>
  @foreach ($data as $dt)
    <tr>
        <td>{{ $i }}</td>
        <td>{{ $dt->nama }}</td>
        <td>{{ $dt->tinggi }}</td>
        <td>{{ $dt->ph }}</td>
        <td>{{ $dt->jenistanah }}</td>
        <td>{{ $dt->kelembaban }}</td>
        <td>{{ $dt->musim }}</td>
        <td>{{ $dt->suhu }}</td>
    </tr>
    <?php $i += 1 ?>
  @endforeach
  
</table>

</body>
</html>


