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
    BttnActions();
    
    $.getJSON("/data/waterlevelstation.json", function (data) {
        data.stations.forEach(function (s) {
            stations.push(s);
        });
    }).then(function () {
        uStates.draw("#svg-content", stations, $("<div></div>"), function (stations) {
            if (stations.length > 0) {
                //does this mean draw map everytime re-clicked?...
                maphan.DrawMap('map', 30, 30);
                maphan.AddZoomEventFunction(ZoomEvent);

                $('.usMapBttn').css({ opacity: 1.0 });
                maphan.AddMarkers(stations, MarkerClick, MarkerMouseOver, MarkerMouseOut);
                maphan.ZoomToFitToMarkers(function () {
                    USMapDashTransition(false);
                });
            }
        });
    });
});
function ZoomEvent(currentZoom, lastBoundZoom) {
    console.log(currentZoom);
    //anywas I can get state size and link it to zoom lev?
    //hmm...
    //if (Math.abs(currentZoom - lastBoundZoom) < 1) return;
    if (currentZoom < 3) {
        //basically reset the map & dash
        maphan.RemoveAllMarkers();
        USMapDashTransition(true);
        var tt=$('#map').css('width');  
        if (tt != '80%') {
            GoogleMapDashAnimation(false);
        }
        
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
                //
                console.log(dataCollected);

                BttnToggle('opendashBttn', true);
                setTimeout(function () {
                    loader.ToggleLoader(false);
                }, 500);
            });
            GoogleMapDashAnimation(true);
        }, 800);
    },500);
}
function MarkerMouseOver(m) {
    console.log("hovered");
}
function MarkerMouseOut() {
    console.log("out");
}
function USMapDashTransition(toUSMap) {
    if (toUSMap) {
        BttnToggle('usMapBttn', false);
        BttnToggle('opendashBttn', false);

        GoogleMapDashAnimation(false);
        $('.svg-container').css({ opacity: 1.0 });
        $('#map').css({ opacity: 0.0 });
        $('#map').css({ 'pointer-events': 'none' });
        $('.svg-container').css({ 'pointer-events': 'all' });
    }
    else {
        BttnToggle('usMapBttn', true);
        $('.svg-container').css({ opacity: 0.0 });
        $('#map').css({ opacity: 1.0 });
        $('#map').css({ 'pointer-events': 'all' });
        $('.svg-container').css({ 'pointer-events': 'none' });
    }
}
function GoogleMapDashAnimation(smallMap) {
    $('#map').css({
        '-webkit-transition': 'all 0.5s ease-in-out',
        '-moz-transition': 'all 0.5s ease-in-out',
        '-o-transition': 'all 0.5s ease-in-out',
        'transition': 'all 0.5s ease-in-out'
    });
    if (smallMap) {
        $('#map').css({ width: '30%' });
        $('#dash').css({ width: '70%' });
    }
    else {
        $('#map').css({ width: 'calc(100vw - 320px)' });
        $('#dash').css({ width: '320px' });
    }
    setTimeout(function () {
        $('#map').css({
            '-webkit-transition': '',
            '-moz-transition': '',
            '-o-transition': '',
            'transition': ''
        })
    }, 800);
}
function BttnActions() {
    $('.usMapBttn').click(function () {
        USMapDashTransition(true);
    });
    $('.opendashBttn').click(function () {
        GoogleMapDashAnimation(false);
        BttnToggle('opendashBttn', false);
    });
}
function BttnToggle(className, on) {
    if (on) {
        $('.' + className).css({
            'pointer-events': 'all',
            'opacity': 1.0
        });
    }
    else {
        $('.' + className).css({
            'pointer-events': 'none',
            'opacity': 0.0
        });
    }
    
}
