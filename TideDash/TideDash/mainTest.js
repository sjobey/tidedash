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

    $.getJSON("/data/waterlevelstation.json", function (data) {
        data.stations.forEach(function (s) {
            stations.push(s);
        });
    }).then(function () {
        uStates.draw("#svg-content", stations, $("<div></div>"), function (stations) {
            maphan.DrawMap('map', 30, 30);
            maphan.AddMarkers(stations, MarkerClick, MarkerMouseOver, MarkerMouseOut);
            maphan.ZoomToFitToMarkers(function () {
                $('.svg-container').css({ opacity: 0.0 });
                $('#map').css({ opacity: 1.0 });
                $('#map').css({ 'pointer-events': 'all' });
                $('.svg-container').css({ 'pointer-events': 'none' });
            });
            maphan.AddZoomEventFunction(ZoomEvent);
        });
    });
});
function ZoomEvent(currentZoom, lastBoundZoom) {
    //anywas I can get state size and link it to zoom lev?
    //hmm...
    //if (Math.abs(currentZoom - lastBoundZoom) < 1) return;
    if (currentZoom < 3) {
        //basically reset the map & dash
        maphan.RemoveAllMarkers();
        $('.svg-container').css({ opacity: 1.0 });
        $('#map').css({ opacity: 0.0 });
        $('#map').css({ 'pointer-events': 'none' });
        $('.svg-container').css({ 'pointer-events': 'all' });
        if($('#map').css('width') != '70%') $('#map').animate({ width: '70%' });
        
    }
}
function MarkerClick(map, marker) {
    loader.ToggleLoader(true);
    setTimeout(function () {
        map.panTo(marker.getPosition());
        setTimeout(function () {
            //start series of data load here
            var status = noaa.GetNOAAData(marker.datum, function (dataCollected) {
                //draw function
                //need callback inside of the draw function
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
