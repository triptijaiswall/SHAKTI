// Safe Zone
function initMapSafe() {
    
    var map = new google.maps.Map(document.getElementById('mapSafe'), {
        center: { lat: 28.7041, lng: 77.1025 },
        zoom: 13
    });

    navigator.geolocation.getCurrentPosition(function(position) {
        var userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        var userLocationIcon = {
            url: 'http://maps.gstatic.com/mapfiles/ms2/micons/woman.png'
        };
        var userLocationMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: userLocationIcon
        });
        var infoWindowContent = '<div><h4 class="text-black">You are Here</h4></div>';

        var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        userLocationMarker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        map.setCenter(userLocation);
    }, function(error) {
        console.error('Error getting user location:', error);
    });

    function loadGeoJSON(file, callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', file, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status == "200") {
                callback(xhr.responseText);
            }
        };
        xhr.send(null);
    }

    loadGeoJSON('../assets/data/exportPolice.geojson', function (response) {
        var data = JSON.parse(response);
        createMarkersFromGeoJSON(data, 'https://maps.gstatic.com/mapfiles/ms2/micons/police.png', map);
    });

    loadGeoJSON('../assets/data/exportHospital.geojson', function (response) {
        var data = JSON.parse(response);
        createMarkersFromGeoJSON(data, 'https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png', map);
    });

    function createMarkersFromGeoJSON(geoJSON, icon, map) {
        geoJSON.features.forEach(feature => {
            var coordinates = feature.geometry.coordinates[0];
            var name = feature.properties.name;
            var marker = new google.maps.Marker({
                position: { lat: coordinates[0][1], lng: coordinates[0][0] },
                map: map,
                title: name,
                icon: icon
            });    
            var infoWindowContent = '<div><h4 class="text-black">' + name + '</h4></div>';

            var infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });

            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
        });
    }
}

// Navigation
function initMapNav() {
    navigator.geolocation.getCurrentPosition((position)=>{
        var map = L.map('mapNav')
        var sourceLocation = [position.coords.latitude, position.coords.longitude]
        map.setView(sourceLocation, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var iconOrigin = L.icon({
            iconUrl: 'http://maps.gstatic.com/mapfiles/ms2/micons/woman.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        var iconDestination = L.icon({
            iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        var originMarker = L.marker(sourceLocation);
        originMarker.bindPopup("Origin").openPopup();

        var destinationMarker = L.marker([28.3041, 77.4025]);
        destinationMarker.bindPopup("Destination").openPopup();

        originMarker.on('dragend', function (event) {
            routingControl.setWaypoints([
                event.target.getLatLng(),
                destinationMarker.getLatLng()
            ]);
        });

        destinationMarker.on('dragend', function (event) {
            routingControl.setWaypoints([
                originMarker.getLatLng(),
                event.target.getLatLng()
            ]);
        });

        
        var safetyTips = "<strong>Safety Tips for Women's Travel:</strong><br>" +
        "- Plan your route in advance and share it with someone you trust.<br>" +
        "- Avoid traveling alone, especially at night.<br>" +
        "- Stay aware of your surroundings and trust your instincts.<br>" +
        "- Keep your phone charged and emergency contacts accessible.<br>" +
        "- If you feel unsafe, don't hesitate to seek help or contact authorities.";
        
        var routingControl = L.Routing.control({
            waypoints: [
                originMarker.getLatLng(),
                destinationMarker.getLatLng()
            ],
            createMarker: function(i, wp, nWps) {
                if (i === 0 || i < nWps - 1) {
                    return L.marker(wp.latLng, {
                        icon: iconOrigin,
                    }).bindPopup(safetyTips);
                } else {
                    return L.marker(wp.latLng, {
                        icon: iconDestination
                    });
                }
            },
            routeWhileDragging: true
        }).addTo(map);
        console.log(originMarker.getLatLng())
    })
}

//Safety Alarm
function play(){
    var audio = document.getElementById("audio");
    var audioImage = document.getElementById("audioImage");
    audio.play();
    audioImage.src = '../assets/imgs/stop.png'
}

function pause(){
    var audio = document.getElementById("audio");
    var audioImage = document.getElementById("audioImage");
    audio.pause();
    audioImage.src = '../assets/imgs/sos.jpeg'
}

document.getElementById("audioImage").addEventListener('click', function() {
    if (document.getElementById("audio").paused) {
        play();
    } else {
        pause();
    }
})

document.getElementById("audio").addEventListener('ended', function() {
    document.getElementById("audio").currentTime = 0;
    play();
});

// Guardians
function sendText(index) {
    const phoneNumber = document.getElementById(`phoneNumber${index}`).value;
    const message = 'This is an emergency text message!';
    const textToSend = 'sms:' + phoneNumber + '?body='+ message;
    window.open(textToSend, '_blank');
    alert("Sending emergency mail and text message to " + phoneNumber);
}

function makeCall(index) {
    const phoneNumber = document.getElementById(`phoneNumber${index}`).value;
    const telUri = `tel:${phoneNumber}`;
    window.location.href = telUri;
    window.open(telUri, '_blank');
    alert("Making emergency call to " + phoneNumber);
}