var map, marker, panorama;
function initMap() {
    var coords = {lat: 42.345573, lng: -71.098326}
    map = new google.maps.Map(document.getElementById("map"), {
        center: coords,
        zoom: 1
    });
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: coords,
            pov: {
                heading: 34,
                pitch: 10
            }
        });
    map.setStreetView(panorama);
    
    marker = new google.maps.Marker({
        position: {lat: 42.345573, lng: -71.098326},
        map: map,
        draggable:true,
        title:"Drag me!"
    });
}
function newSpot() {
    var sv = new google.maps.StreetViewService();
    sv.getPanorama({location: {lat: getRandomLatLng(90), lng: getRandomLatLng(90)}, preference: 'best', radius: 5000, source: 'outdoor'}, processSVData);
}
function processSVData(data, status) {
    if (status === 'OK') {
        panorama.setPano(data.location.pano);
    } else {
        console.error('Street View data not found for this location.');
        newSpot();
    }
}

function getPos() {
    document.getElementById("test").innerHTML = marker.getPosition();
}

function getRandomLatLng(max) {
    var num = Math.random() * Math.floor(max);
    if(Math.random() > 0.5) num = num * -1;
    return num;
}


