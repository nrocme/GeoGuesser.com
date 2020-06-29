var map, marker, panorama, marker2, infowindow, coords, contentString, answer;

function initMap() 
{
    var image = {
        url: './images/question.png',
    }

    coords = {lat: 0, lng: 0}
    newSpot();
    var nightType = new google.maps.StyledMapType(nightMode, {name: 'nightMode'});
    var darkType = new google.maps.StyledMapType(darkMode, {name: 'darkMode'});
    var standardType = new google.maps.StyledMapType(standardMode, {name: 'standardMode'});
    
    map = new google.maps.Map(document.getElementById("map"), {
        center: coords,
        zoom: 1,
        styles: standardMode,
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
          },
        disableDefaultUI: true
    });
    
    map.mapTypes.set('nightMode', nightType);
    map.mapTypes.set('darkMode', darkType);
    map.mapTypes.set('standardMode', standardType);

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: coords,
            pov: {
                heading: 0,
                pitch: 0
            },
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            linksControl: true,
            panControl: true
    });
    
    map.setStreetView(panorama);
    marker = new google.maps.Marker({
        position: {lat: 0, lng: 0},
        map: map,
        draggable:true,
        title:"Your Guess",
        icon: image
    });
    map.addListener('click', function(event) {
        moveMarker(event.latLng);
    });
}

function moveMarker(pnt) 
{
    marker.setPosition(pnt);
}
function changeMap(num) {
    if (num == 2) {
        map.setMapTypeId('nightMode');
    }
    else if (num == 1) {
        map.setMapTypeId('darkMode');
    }
    else {
        map.setMapTypeId('standardMode');
    }
}

function newSpot() 
{
    try {
        marker2.setMap(null);
        marker2 = null;
    }
    catch {}
    finally {
        var sv = new google.maps.StreetViewService();
        sv.getPanorama({location: {lat: getRandomLatLng(90), lng: getRandomLatLng(180)}, preference: 'best', radius: 50000, source: 'outdoor'}, processSVData);
    }
}

function processSVData(data, status) 
{
    if (status === 'OK') {
        panorama.setPano(data.location.pano);
    } else {
        newSpot();
    }
}


function guess() 
{
    var lat1 = panorama.getPosition().lat();
    var lng1 = panorama.getPosition().lng();
    var lat2 = marker.getPosition().lat();
    var lng2 = marker.getPosition().lng();
    
    answer = metertoMile(haversine(lat1, lat2, lng1, lng2)).toFixed(3).toString() + " Miles Away";
        var image = {
        url: './images/correct_ping_white_outline.png',
        // This marker is 20 pixels wide by 32 pixels high.
    }
    contentString = '<div id="content">'+'Your were :' + '<div id="result">' + answer
      +'</div>';
    infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    marker2 = new google.maps.Marker({
        position: panorama.getPosition(),
        map: map,
        draggable:false,
        icon: image,
        title: "location"
    });
    displayPopup(contentString);
}

function haversine(lat1, lat2, lng1, lng2)
{
    const R = 6371 * Math.pow(10, 3);
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
          
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
}

function metertoMile(meters)
{
    return meters * 0.00062137;
}

function getRandomLatLng(max) 
{
    var num = Math.random() * Math.floor(max);
    if(Math.random() > 0.5) num = num * -1;
    return num;
}

function displayPopup(content)
{
    infowindow.open(map, marker);
}

