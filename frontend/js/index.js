var map, heatmap;
var points = [];
var markers = [];

function initMap() {
    // {location: new google.maps.LatLng(37.782, -122.441), weight: 3}
    $.get('api/points/all', function(r){
        for (var i = 0; i < r.length; i++) {
            var e = r[i];
            points.push({location: new google.maps.LatLng(e.lat, e.long), weight: Math.log(e.ali_count + e.brd_count)});
        }
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: {lat: -27.5, lng: 153},
            mapTypeId: 'roadmap'
        });

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: points,
            map: map
        });

        var gradient = [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ];
        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);

        google.maps.event.addListener(map, 'zoom_changed', change);
        google.maps.event.addListener(map, 'dragend', change);

        function change(){
            console.log(map.getZoom());
            // Remove any placed markers
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                marker.setMap(null);
            }
            markers = [];

            if (map.getZoom() >= 14) {
                // Url is:
                // /api/points/box/-27.7/153.2/-27.8/153.5/
                var toprightlat = map.getBounds().getNorthEast().lat();
                var toprightlng = map.getBounds().getNorthEast().lng();
                var bottomleftlat = map.getBounds().getSouthWest().lat();
                var bottomleftlng = map.getBounds().getSouthWest().lng();
                var url = 'api/points/box/' + toprightlat + '/' + toprightlng + '/' + bottomleftlat + '/' + bottomleftlng + '/';
                $.get(url, function(r){
                    for (var i = 0; i < r.length; i++) {
                        var e = r[i];
                        var m = new google.maps.Marker({
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 3
                            },
                            position: new google.maps.LatLng(e.lat, e.long),
                            title: e.stop_id.toString(),
                            map: map
                        });

                        m.stop_id = e.stop_id;
                        m.ali_count = e.ali_count;
                        m.brd_count = e.brd_count;
                        google.maps.event.addListener(m, 'click', markerClick);
                        markers.push(m);
                    }
                });
            }
        }
    });
}
var y;
function markerClick(r, t) {
    console.log(r);
    console.log(this);
    y = r;
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function getBounds() {
    console.log(map.getBounds());
    console.log(map.getBounds().getNorthEast());
    console.log(map.getBounds().getNorthEast().lat());
    console.log(map.getBounds().getNorthEast().lng());
    console.log(map.getBounds().getSouthWest());
    console.log(map.getBounds().getSouthWest().lat());
    console.log(map.getBounds().getSouthWest().lng());
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}