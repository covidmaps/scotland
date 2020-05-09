var mapboxAccessToken = {"pk.eyJ1IjoibWFya2pzd2FuIiwiYSI6ImNrOXloemM3aTA2aDAzZ3FweGEzOWE3a2wifQ.Qu-m8OjeotWWwmtx_T10Ww"};
var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

L.geoJson(statesData).addTo(map);
