var map, marker, panorama, marker2, coords, contentString, answer, path, timeStart, startLoc;

    // Set the configuration for your app
    // TODO: Replace with your project's config object
    //   var config = {
    //     apiKey: "AIzaSyDfG1-uB_XtgAhKkrpqdzRTAbL7tR9gRJ0 ",
    //     authDomain: "geo-guesser-clone.firebaseapp.com",
    //     databaseURL: "https://geo-guesser-clone.firebaseio.com",
    //   };
    //   firebase.initializeApp(config);
    // 
    //   // Get a reference to the database service
    var database = firebase.database().ref();
    database.on('value', snapshot => {
    console.log(snapshot.val());
    });
  
    
function start() {
    timeStart = new Date().getTime();
}


function play() {
    newSpot();
    start();
}


function reset() {
    panorama.setPano(startLoc);
}


function initMap() 
{
    var image = {
        url: './images/question.png',
    }

    coords = {lat: 0, lng: 0}
    play();
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
            streetViewControl: true, // 
            rotateControl: true,
            fullscreenControl: true,
            linksControl: true, // needs to get disable for no moving 
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


function noMoving() 
{
    var panoOptions = {
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false, // 
        rotateControl: true,
        fullscreenControl: true,
        linksControl: false, // needs to get disable for no moving 
        panControl: true,
        clickToGo: false
    };
    window.panorama.setOptions(panoOptions);
}


function moving() {
    var panoOptions = {
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true, // 
        rotateControl: true,
        fullscreenControl: true,
        linksControl: true, // needs to get disable for no moving 
        panControl: true,
        clickToGo: true
    };
    window.panorama.setOptions(panoOptions);
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
        path.setMap(null);
        path = null;
        
    }
    catch(err) {}
    finally {
        var sv = new google.maps.StreetViewService();
        sv.getPanorama({location: {lat: getRandomLatLng(90), lng: getRandomLatLng(180)}, preference: 'best', radius: 100000, source: 'outdoor'}, processSVData);
    }
}

function processSVData(data, status) 
{
    if (status === 'OK') {
        panorama.setPano(data.location.pano);
        startLoc = panorama.getPano();
    } else {
        newSpot();
    }
}


function guess() 
{
    formatTime((new Date().getTime() - timeStart )/ 1000);
    var lat1 = panorama.getPosition().lat();
    var lng1 = panorama.getPosition().lng();
    var lat2 = marker.getPosition().lat();
    var lng2 = marker.getPosition().lng();
    try {
        marker2.setMap(null);
        marker2 = null;
        path.setMap(null);
        path = null;
        
    }
    catch (err) {}
    finally {
        answer = metertoMile(haversine(lat1, lat2, lng1, lng2)).toFixed(3);
        if (answer < 1) answer = (answer * 5280).toString() + " Feet Away";
        else answer = answer.toString() + " Miles Away";
        var image = {
            url: './images/correct_ping_white_outline.png',
            // This marker is 20 pixels wide by 32 pixels high.
        }
        contentString = '<div id="result">'+'Your were :' + '<div id="result">' + answer;
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        marker2 = new google.maps.Marker({
            position: panorama.getPosition(),
            map: map,
            draggable:false,
            icon: image,
            title: "location"
        });
        var pathCoordinates = [
            marker2.getPosition(),
            marker.getPosition()
        ];
        path = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokecolor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        path.setMap(map);
        infowindow.open(map, marker2);
    }
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

function formatTime(seconds) {
    console.log(seconds);
    if (seconds < 60) {
        document.getElementById("time").innerHTML = seconds.toFixed(2)+ " s"
    }
    else if (seconds < 3600) {
        document.getElementById("time").innerHTML = Math.floor(seconds/60) +  " m " + (seconds%60).toFixed(2) + " s";
    }
    else {
        document.getElementById("time").innerHTML = Math.floor(seconds/3600) +  " h" + (seconds%3600).toFixed(2) + " m" + ((seconds%3600)%60).toFixed(2) + " s";
    }
}

//
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

