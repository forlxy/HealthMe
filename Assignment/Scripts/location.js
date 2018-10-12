const TOKEN = "pk.eyJ1Ijoia2FzYWx1b3FpIiwiYSI6ImNqbHZ2OW53bTB5aHozcW9kcDJibndycXUifQ.SeWM7HbI0owT-Rwuv14Ntg";
var locations = [];
var dropoffs = turf.featureCollection([]);


var lastQueryTime = 0;
var lastAtRestaurant = 0;
var keepTrack = [];
var currentSchedule = [];
var currentRoute = null;
var pointHopper = {};
var pause = true;
var speedFactor = 50;
var url;
var name = "";


// The first step is obtain all the latitude and longitude from the HTML
// The below is a simple jQuery selector
$(".coordinates").each(function () {
    var longitude = $(".longitude", this).text().trim();
    var latitude = $(".latitude", this).text().trim();
    var name = $(".name", this).text().trim();
    var id = $(".id", this).text().trim();
    // Create a point data structure to hold the values.
    var point = {
        "latitude": latitude,
        "longitude": longitude,
        "name": name,
        "id": id
    };
    // Push them all into an array.
    locations.push(point);
});
var data = [];
var datepickerObj;
// Create an empty GeoJSON feature collection, which will be used as the data source for the route before users add any new data
var nothing = turf.featureCollection([]);

for (i = 0; i < locations.length; i++) {
    var feature = {
        "type": "Feature",
        "properties": {
            "name": locations[i].name,
            "id": locations[i].id,
            "icon": "circle-15"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [locations[i].longitude, locations[i].latitude]
        }
    };
    data.push(feature);
}

mapboxgl.accessToken = TOKEN;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    //style: 'mapbox://styles/mapbox/light-v9',
    center: [145.045837, -37.876823],
    zoom: 13
});


document.getElementById('save-trip')
    .addEventListener('click', function () {
        var name = document.getElementById('trip-name').value;
        $.ajax({
            url: 'locations/saveJson',
            type: 'POST',
            data: "{value:'" + url + "',name:'" + name + "'}",
            contentType: 'application/json',
            success: function (result) {
                window.alert("Successfully Saved!");
            }
        });
    });


map.on('load', function () {
    // Add a layer showing the places.

    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(geocoder);
    // Add geolocate control to the map.
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
    map.addControl(new mapboxgl.NavigationControl());
    
    map.addControl(new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }), 'top-left');

    map.addSource('route', {
        type: 'geojson',
        data: nothing
    });

    map.addLayer({
        id: 'routeline-active',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#3887be',
            'line-width': {
                base: 1,
                stops: [[12, 3], [22, 12]]
            }
        }
    }, 'waterway-label');

    map.addLayer({
        id: 'routearrows',
        type: 'symbol',
        source: 'route',
        layout: {
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': {
                base: 1,
                stops: [[12, 24], [22, 60]]
            },
            'symbol-spacing': {
                base: 1,
                stops: [[12, 30], [22, 160]]
            },
            'text-keep-upright': false
        },
        paint: {
            'text-color': '#3887be',
            'text-halo-color': 'hsl(55, 11%, 96%)',
            'text-halo-width': 3
        }
    }, 'waterway-label');


    map.addLayer({
        id: 'dropoffs-symbol',
        type: 'symbol',
        source: {
            data: dropoffs,
            type: 'geojson'
        },
        layout: {
            'icon-image': 'marker-15',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        }
    });

    map.addLayer({
        "id": "places",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": data
            }
        },
        "layout": {
            "icon-image": "{icon}",
            "icon-allow-overlap": true
        }
    });

    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    geocoder.on('result', function (ev) {
        name = ev.result.text;
        map.getSource('single-point').setData(ev.result);
    });

    //map.on('click', function (e) {
    //    // When the map is clicked, add a new drop-off point
    //    // and update the `dropoffs-symbol` layer
    //    newDropoff(map.unproject(e.point));
    //    updateDropoffs(dropoffs);
    //});
    
    map.on('click', 'point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<html> <head><style>.button {    background-color: #4CAF50; /* Green */    border: none;    color: white;    padding: 8px 16px;    text-align: center;    text-decoration: none;    display: inline-block;    font-size: 16px;    margin: 4px 2px;    -webkit-transition-duration: 0.4s; /* Safari */    transition-duration: 0.4s;    cursor: pointer;} .button1 {    background-color: #4CAF50;     color: white;     border: 2px solid #4CAF50;}.button1:hover {    background-color: white;    color: black;}</style></head> <body><h2>' + name + '</h2> <button type = "content" id=\'add\' value=\'Add\' class= \'button button1\'>Add to List</button></body></html>')
 //           .setHTML('<h2>' + name + '</h2> <button type = "content" id=\'add\' value=\'Add\'>Add to List</button> </button>')
            //            .setHTML('<h2>' + name + '</h2> <div class="container"> <div class="hero-unit"> <input type="text" placeholder="default" id="Demo"> </div> </div> <script src="~/Scripts/jquery-3.3.1.js"></script> <script type = "text/javascript" src = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js" ></script>  <link rel = "stylesheet" href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" /> <script type="text/javascript"> $(document).ready(function () { $(\'#Demo\').datepicker({format: "dd/mm/yyyy"});$(\'#Demo\').datepicker(\'setDate\', new Date(2018, 7, 20));}); </script>')
            //            .setHTML('<h2>' + name + '</h2> <input id="datepicker" name="datepicker" placeholder="date" type="text"> <script> $(function () {$("#datepicker").datepicker();});</script> <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script> <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" />')
            .addTo(map);
        document.getElementById('add')
            .addEventListener('click', function () {
                console.log("Add");
                AddToList(name, coordinates);
            });

    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var name = e.features[0].properties.name;
        var id = e.features[0].properties.id;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<html> <head><style>.button {    background-color: #4CAF50; /* Green */    border: none;    color: white;    padding: 8px 16px;    text-align: center;    text-decoration: none;    display: inline-block;    font-size: 16px;    margin: 4px 2px;    -webkit-transition-duration: 0.4s; /* Safari */    transition-duration: 0.4s;    cursor: pointer;} .button1 {    background-color: #4CAF50;     color: white;     border: 2px solid #4CAF50;}.button1:hover {    background-color: white;    color: black;}</style></head> <body><h2>' + name + '</h2> <button type = "content" id=\'reserve\' value=\'Reserve\' class= \'button button1\'>Reserve</button></body></html>')
// <button type = "content" id=\'reserve\' value=\'Reserve\'>Reserve</button> 
            //            .setHTML('<h2>' + name + '</h2> <div class="container"> <div class="hero-unit"> <input type="text" placeholder="default" id="Demo"> </div> </div> <script src="~/Scripts/jquery-3.3.1.js"></script> <script type = "text/javascript" src = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js" ></script>  <link rel = "stylesheet" href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" /> <script type="text/javascript"> $(document).ready(function () { $(\'#Demo\').datepicker({format: "dd/mm/yyyy"});$(\'#Demo\').datepicker(\'setDate\', new Date(2018, 7, 20));}); </script>')
            //            .setHTML('<h2>' + name + '</h2> <input id="datepicker" name="datepicker" placeholder="date" type="text"> <script> $(function () {$("#datepicker").datepicker();});</script> <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script> <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" />')
            .addTo(map);
        document.getElementById('reserve')
            .addEventListener('click', function () {
                console.log("Reserve");
                Reserve(id, coordinates);
            });

    });
    //// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });

});


// Here you'll specify all the parameters necessary for requesting a response from the Optimization API
function assembleQueryURL() {

    // Store the location of the truck in a variable called coordinates
    var coordinates = [];
    var distributions = [];
    keepTrack = [];

    // Create an array of GeoJSON feature collections for each point
    var restJobs = objectToArray(pointHopper);

    // If there are actually orders from this restaurant
    if (restJobs.length > 0) {

        // Check to see if the request was made after visiting the restaurant
        var needToPickUp = restJobs.filter(function (d, i) {
            return d.properties.orderTime > lastAtRestaurant;
        }).length > 0;

        // If the request was made after picking up from the restaurant,
        // Add the restaurant as an additional stop
        if (needToPickUp) {
            var restaurantIndex = coordinates.length;
            // Add the restaurant as a coordinate
            coordinates.push();
            // push the restaurant itself into the array
            keepTrack.push();
        }

        restJobs.forEach(function (d, i) {
            // Add dropoff to list
            keepTrack.push(d);
            coordinates.push(d.geometry.coordinates);
            // if order not yet picked up, add a reroute
            if (needToPickUp && d.properties.orderTime > lastAtRestaurant) {
                distributions.push(restaurantIndex + ',' + (coordinates.length - 1));
            }
        });
    }
    url = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + coordinates.join(';') +
        '?overview=full&steps=true&geometries=geojson&source=first&destination=last&roundtrip=false&access_token=' + mapboxgl.accessToken;
    // Set the profile to `driving`
    // Coordinates will include the current location of the truck,
    return url;
}

function objectToArray(obj) {
    var keys = Object.keys(obj);
    var routeGeoJSON = keys.map(function (key) {
        return obj[key];
    });
    return routeGeoJSON;
}

//function newDropoff(coords) {
//    // Store the clicked point as a new GeoJSON feature with
//    // two properties: `orderTime` and `key`
//    var pt = turf.point(
//        [coords.lng, coords.lat],
//        {
//            orderTime: Date.now(),
//            key: Math.random()
//        }
//    );
//    dropoffs.features.push(pt);
//}
function clearDropoff() {
    dropoffs = turf.featureCollection([]);
    pointHopper = {};
}

function showSavedTrip(data) {
        var routeGeoJSON = turf.featureCollection([turf.feature(data)]);
        // If there is no route provided, reset
        
        map.getSource('route')
           .setData(routeGeoJSON);
        var point = data.coordinates[0];
        map.flyTo({
            center: point,
            zoom: 14
        });
        
}

var allCounter = 0;
function newDropoff(coords, counter, length) {
    // Store the clicked point as a new GeoJSON feature with
    // two properties: `orderTime` and `key`
    var pt = turf.point(
        [parseFloat(coords[1]), parseFloat(coords[0])],
        {
            orderTime: Date.now(),
            key: counter
        }
    );
    dropoffs.features.push(pt);
    pointHopper[pt.properties.key] = pt;
    allCounter++;
    if (allCounter == length) {
        // Make a request to the Optimization API
        allCounter = 0;
        $.ajax({
            method: 'GET',
            url: assembleQueryURL(),
        }).done(function (data) {
            // Create a GeoJSON feature collection
            var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
            // If there is no route provided, reset
            if (!data.trips[0]) {
                routeGeoJSON = nothing;
            } else {
                // Update the `route` source by getting the route source
                // and setting the data equal to routeGeoJSON

                map.getSource('route')
                    .setData(routeGeoJSON);
                var point = data.trips[0].geometry.coordinates[0];
                map.flyTo({
                    center: point,
                    zoom: 14
                });
            }

            if (data.waypoints.length === 12) {
                window.alert('Maximum number of points reached. Read more at mapbox.com/api-documentation/#optimization.');
            }
        });
    }
}

function updateDropoffs(geojson) {
    map.getSource('dropoffs-symbol')
        .setData(geojson);
}


function Reserve(id, coordinates) {
    location.href = "/reservations/Create?id=" + id;
    console.log('try to reserve coords', name, coordinates);

}


function AddToList(name, coordinates) {
    location.href = "/locations/Create?name=" + name + "&latitude=" + coordinates[1] + "&longitude=" + coordinates[0];
    console.log('try to add coords', name, coordinates);

}