var map;
var geocoder;
var stations = [];
var tideItems = [];
var weatherItems = [];

var loader = new WaveLoader();
var ghan = new GoogleMapAPIHandler();
var noaa = new NOAADataHandler();
var maphan;

$(document).ready(function () {
    loader.AddLoader($('body'));
    maphan = new ghan.MapHandler();

    var lats = [];
    var lngs = [];
    var contents = [];
    $.getJSON("/data/waterlevelstation.json", function (data) {
        data.stations.forEach(function (s) {
            if (s.state == "MA") {
                stations.push(s);
                lats.push(s.lat);
                lngs.push(s.lng);
                contents.push(s.name);
            }
        });
    }).then(function () {
        maphan.DrawMap('map', 30, 30);
        maphan.AddMarkers(lats, lngs, contents, stations, MarkerClick, MarkerMouseOver, MarkerMouseOut);
        maphan.ZoomToFitToMarkers();
        maphan.AddZoomEventFunction(ZoomEvent);
    });
});
function ZoomEvent(zoomLev) {
    //anywas I can get state size and link it to zoom lev?
    console.log(zoomLev);
}
function MarkerClick(map, marker) {
    loader.ToggleLoader(true);
    setTimeout(function () {
        map.panTo(marker.getPosition());
        setTimeout(function () {
            //start series of data load here
            var status = noaa.GetNOAAData(marker.datum, function (dataCollected) {
                console.log(dataCollected);
                setTimeout(function () {
                    loader.ToggleLoader(false);
                }, 500);
            });
            $('#map').animate({ width: '30%' });
        }, 800);
    },500);
}
function MarkerMouseOver(m) {
    console.log("hovered");
}
function MarkerMouseOut() {
    console.log("out");
}
