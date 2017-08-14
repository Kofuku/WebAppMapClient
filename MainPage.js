var map;
var userLatitude;
var userLongitude;
var markerList = [];
var infoWindow = null;
var options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"};

function initMap() {
    var startPoint = {lat: 52.406, lng: 16.925};
    userLatitude = startPoint.lat;
    userLongitude = startPoint.lng;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: startPoint
    });
    map.setCenter(startPoint);
    getCurrentPosition();
}

function getCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;

            var pos = {
                lat: userLatitude,
                lng: userLongitude
            };

            map.setCenter(pos);
            var marker = new google.maps.Marker({
                position: pos,
                map: map
            });
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function deleteAllMarkers() {
    for (i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null);
    }
    markerList = [];
}

function createContentString(markerData) {
    var startDate = new Date(0);
    startDate.setUTCSeconds(Number(markerData["startDate"]));
    startDate = startDate.toLocaleDateString("en-GB", options);
    var endDate = new Date(0);
    endDate.setUTCSeconds(Number(markerData["endDate"]));
    endDate = endDate.toLocaleDateString("en-GB", options);
    return "<p>Type: " + markerData["type"] + " </p><p>Start date: " + startDate + " </p><p>End date: " + endDate
        + " </p><p>Details: " + markerData["details"] + " </p>"
}

function alertMarkers(jsonData) {

    for (i = 0; i < jsonData.length; i++) {
        var pos = {
            lat: Number(jsonData[i]["latitude"]),
            lng: Number(jsonData[i]["longitude"])
        };
        var icon;
        if (jsonData[i]["type"] === "Roadworks") {
            icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
        else if (jsonData[i]["type"] === "Traffic jam") {
            icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
        }
        else if (jsonData[i]["type"] === "Public transport breakdown") {
            icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
        var marker = new google.maps.Marker({
            position: pos,
            icon: icon,
            type: jsonData[i]["type"],
            startDate: jsonData[i]["startDate"],
            endDate: jsonData[i]["endDate"],
            details: jsonData[i]["details"]
        });
        infoWindow = new google.maps.InfoWindow({
            content: createContentString(jsonData[i])
        });
        marker.addListener('click', function(){
            infoWindow.open(map, this)
        });
        marker.setMap(map);
        markerList.push(marker);


    }
}

function createAlertTable(jsonData) {
    var table = document.getElementById("alertTable");
    for (i = 0; i < jsonData.length; i++) {
        var row = table.insertRow(i);
        // Type column
        var typeCell = row.insertCell(0);
        typeCell.innerHTML = jsonData[i]["type"];
        // Latitude column
        var latitudeCell = row.insertCell(1);
        latitudeCell.innerHTML = jsonData[i]["latitude"];
        // Longitude column
        var longitudeCell = row.insertCell(2);
        longitudeCell.innerHTML = jsonData[i]["longitude"];
        // Start date column
        var startDateCell = row.insertCell(3);
        var startDate = new Date(0);
        startDate.setUTCSeconds(Number(jsonData[i]["startDate"]));
        startDateCell.innerHTML = startDate.toLocaleDateString("en-GB", options);
        // End date column
        var endDateCell = row.insertCell(4);
        var endDate = new Date(0);
        endDate.setUTCSeconds(Number(jsonData[i]["endDate"]));
        endDateCell.innerHTML = endDate.toLocaleDateString("en-GB", options);
        // Details column
        var detailsCell = row.insertCell(5);
        detailsCell.innerHTML = jsonData[i]["details"];
    }
}

function deleteAlertTable() {
    document.getElementById("alertTable").innerHTML=""
}

$(document).ready(function () {
    function periodicRequest() {
        getCurrentPosition();
        $.ajax({
            url: "http://localhost:8080/event",
            type: "get",
            data: {
                userLatitude: userLatitude,
                userLongitude: userLongitude,
                roadworks: $("#roadworks").is(":checked"),
                traffic: $("#traffic").is(":checked"),
                breakdowns: $("#breakdowns").is(":checked"),
                radius: $("#radius").val()
            },
            success: function (data) {
                deleteAlertTable();
                deleteAllMarkers();
                createAlertTable(data);
                alertMarkers(data);
            },
            complete: function () {
                setTimeout(periodicRequest, 10000);
            },
            error: function () {
                alert("Unable to get data");
            }
        });
    }
    setTimeout(periodicRequest, 10000);
    $("#requestButton").click(function(){
        $.ajax({
            url: "http://localhost:8080/event",
            type: "get",
            data: {
                userLatitude: userLatitude,
                userLongitude: userLongitude,
                roadworks: $("#roadworks").is(":checked"),
                traffic: $("#traffic").is(":checked"),
                breakdowns: $("#breakdowns").is(":checked"),
                radius: $("#radius").val()
            },
            success: function(data) {
                deleteAlertTable();
                deleteAllMarkers();
                createAlertTable(data);
                alertMarkers(data);
            },
            error: function() {
                alert( "Unable to get data" );
            }
        })
    })
});