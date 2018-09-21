/**
* This is a simple JavaScript demonstration of how to call MapBox API to load the maps.
* I have set the default configuration to enable the geocoder and the navigation control.
* https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
*
* @author Jian Liew <jian.liew@monash.edu>
*/
const TOKEN = "pk.eyJ1Ijoia2FzYWx1b3FpIiwiYSI6ImNqbHZ2OW53bTB5aHozcW9kcDJibndycXUifQ.SeWM7HbI0owT-Rwuv14Ntg";
var locations = [];
// The first step is obtain all the latitude and longitude from the HTML
// The below is a simple jQuery selector
$(".coordinates").each(function () {
    var longitude = $(".longitude", this).text().trim();
    var latitude = $(".latitude", this).text().trim();
    var name = $(".name", this).text().trim();
    // Create a point data structure to hold the values.
    var point = {
        "latitude": latitude,
        "longitude": longitude,
        "name": name
    };
    // Push them all into an array.
    locations.push(point);
});
var data = [];
var datepickerObj;
for (i = 0; i < locations.length; i++) {
    var feature = {
        "type": "Feature",
        "properties": {
            "name": locations[i].name,
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
    style: 'mapbox://styles/mapbox/streets-v10',
    zoom: 11
});
map.on('load', function () {
    // Add a layer showing the places.
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
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }));
    // Add geolocate control to the map.
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
    map.addControl(new mapboxgl.NavigationControl());
    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var name = e.features[0].properties.name;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<h2>' + name + '</h2> <button type = "content" id=\'reserve\' value=\'Reserve\'>Reserve</button> </button>')
//            .setHTML('<h2>' + name + '</h2> <div class="container"> <div class="hero-unit"> <input type="text" placeholder="default" id="Demo"> </div> </div> <script src="~/Scripts/jquery-3.3.1.js"></script> <script type = "text/javascript" src = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js" ></script>  <link rel = "stylesheet" href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" /> <script type="text/javascript"> $(document).ready(function () { $(\'#Demo\').datepicker({format: "dd/mm/yyyy"});$(\'#Demo\').datepicker(\'setDate\', new Date(2018, 7, 20));}); </script>')
//            .setHTML('<h2>' + name + '</h2> <input id="datepicker" name="datepicker" placeholder="date" type="text"> <script> $(function () {$("#datepicker").datepicker();});</script> <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script> <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css" />')
            .addTo(map);
        document.getElementById('reserve')
            .addEventListener('click', function () {
                console.log("Reserve");
                Reserve(name, coordinates);
            });

    });
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });
});

function Reserve(name, coordinates) {
    console.log('try to reserve coords', name, coordinates);

}