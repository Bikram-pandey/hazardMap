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
        mapOptions.maxZoom = 16;
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

function toggleOvals(data, ovals, visible, color, removeOtherOvals) {
    if (visible.value) {
        ovals.forEach(ovalObj => {
            map.removeWidget(ovalObj.oval);
            if (ovalObj.popup) map.removeWidget(ovalObj.popup);
        });
        ovals.length = 0;
        visible.value = false;
    } else {
        // Remove other ovals 
        if (removeOtherOvals) {
            floodOvals.forEach(obj => map.removeWidget(obj.oval));
            landslideOvals.forEach(obj => map.removeWidget(obj.oval));
            earthquakeOvals.forEach(obj => map.removeWidget(obj.oval));
            tsunamiOvals.forEach(obj => map.removeWidget(obj.oval));
            floodOvals.length = 0;
            landslideOvals.length = 0;
            earthquakeOvals.length = 0;
            tsunamiOvals.length = 0;
        }

        // Add the ovals for the current hazard
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

            // Add click event to the oval
            oval.addEventListener('click', function () {
                // Remove previous popup if exists
                ovals.forEach(obj => {
                    if (obj.popup) map.removeWidget(obj.popup);
                });

                // Create and add popup
                var url = entry['掲載するURL'];
                if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }
                var popupHtml = `
                    <a href="${url}" target="_blank" onclick="event.stopPropagation();" 
                       style="color: blue; text-decoration: underline;">
                        ${entry['市町村']} - 詳細を見る
                    </a>
                `;
                var popup = new ZDC.Popup(latLng, { htmlSource: popupHtml });
                map.addWidget(popup);

                // Save the popup in the oval object to remove later
                ovals.forEach(obj => obj.popup = null); // Clear existing
                ovalObj.popup = popup;
            });

            const ovalObj = { oval: oval, popup: null };
            ovals.push(ovalObj);
        });
        visible.value = true;
    }
}

function toggleFlood() {
    toggleOvals(floodData, floodOvals, { value: floodVisible }, "#e34633", true);
    floodVisible = !floodVisible;
}

function toggleLandslide() {
    toggleOvals(landslideData, landslideOvals, { value: landslideVisible }, "#007bff", true);
    landslideVisible = !landslideVisible;
}

function toggleEarthquake() {
    toggleOvals(earthquakeData, earthquakeOvals, { value: earthquakeVisible }, "#28a745", true);
    earthquakeVisible = !earthquakeVisible;
}

function toggleTsunami() {
    toggleOvals(tsunamiData, tsunamiOvals, { value: tsunamiVisible }, "#6f42c1", true);
    tsunamiVisible = !tsunamiVisible;
}

window.onload = loadHazardData;