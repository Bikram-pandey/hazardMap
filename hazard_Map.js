var map;
var floodData = [], landslideData = [], earthquakeData = [], tsunamiData = [];
var floodOvals = [], landslideOvals = [], earthquakeOvals = [], tsunamiOvals = [];
var floodVisible = false, landslideVisible = false, earthquakeVisible = false, tsunamiVisible = false;

function loadHazardData() {
    Promise.all([
        fetch("flood_maps.json").then(response => response.json()),
        fetch("landslide_maps.json").then(response => response.json()),
        fetch("earthquake_maps.json").then(response => response.json()),
        fetch("tsunami_maps.json").then(response => response.json())
    ])
        .then(([flood, landslide, earthquake, tsunami]) => {
            floodData = flood;
            landslideData = landslide;
            earthquakeData = earthquake;
            tsunamiData = tsunami;
            initMap();
        })
        .catch(error => console.error("Error loading hazard data:", error));
}

function initMap() {
    ZMALoader.setOnLoad(function (mapOptions, error) {
        if (error) return console.error(error);

        mapOptions.center = new ZDC.LatLng(35.681406, 139.767132);
        mapOptions.mouseWheelReverseZoom = true;
        mapOptions.minZoom = 5;
        mapOptions.maxZoom = 14;
        mapOptions.zoom = 6;
        mapOptions.zipsMapType = "Ai3Y2Jwp";

        map = new ZDC.Map(document.getElementById('ZMap'), mapOptions, function () {
            map.addControl(new ZDC.ZoomButton('top-right'));
            map.addControl(new ZDC.ScaleBar('bottom-left'));
            center_mrk = new ZDC.CenterMarker();
            map.addControl(center_mrk);

        },
            function () {
                console.error("Failed to load map");
            }
        );
    });
}

function toggleOvals(data, ovals, visible, color) {
    if (visible.value) {
        ovals.forEach(oval => map.removeWidget(oval));
        ovals.length = 0;
        visible.value = false;
    } else {
        data.forEach(entry => {
            var latLng = new ZDC.LatLng(entry.lat, entry.lng);
            var oval = new ZDC.Oval(
                latLng,
                { x: 2000, y: 2000 },
                {
                    fillPattern: 'none',
                    stroke: color,
                    strokeWidth: 3,
                    opacity: 0.9,

                }
            );
            map.addWidget(oval);
            ovals.push(oval);
        });
        visible.value = true;
    }
}

function toggleFlood() {
    toggleOvals(floodData, floodOvals, { value: floodVisible }, "#e34633");
    floodVisible = !floodVisible;
}

function toggleLandslide() {
    toggleOvals(landslideData, landslideOvals, { value: landslideVisible }, "#007bff");
    landslideVisible = !landslideVisible;
}

function toggleEarthquake() {
    toggleOvals(earthquakeData, earthquakeOvals, { value: earthquakeVisible }, "#28a745");
    earthquakeVisible = !earthquakeVisible;
}

function toggleTsunami() {
    toggleOvals(tsunamiData, tsunamiOvals, { value: tsunamiVisible }, "#6f42c1");
    tsunamiVisible = !tsunamiVisible;
}

window.onload = loadHazardData;