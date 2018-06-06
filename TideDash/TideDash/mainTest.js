var map;
var geocoder;
var stations = [];
var tideItems = [];
var weatherItems = [];
var mapstyle = [
  {
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#212121"
        }
      ]
  },
  {
      "elementType": "labels.icon",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#757575"
        }
      ]
  },
  {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
            "color": "#212121"
        }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#757575"
        }
      ]
  },
  {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#9e9e9e"
        }
      ]
  },
  {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#bdbdbd"
        }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#757575"
        }
      ]
  },
  {
      "featureType": "poi.business",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#83AE9B"
        }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#616161"
        }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
            "color": "#1b1b1b"
        }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
            "color": "#2c2c2c"
        }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#8a8a8a"
        }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#373737"
        }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#3c3c3c"
        }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#4e4e4e"
        }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#616161"
        }
      ]
  },
  {
      "featureType": "transit",
      "stylers": [
        {
            "visibility": "off"
        }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#757575"
        }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
            "color": "#000000"
        }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
            "color": "#96ecf3"
        },
        {
            "saturation": -50
        },
        {
            "lightness": -15
        }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
            "color": "#3d3d3d"
        }
      ]
  }
]
//zahGGMnDWNrxNVgJrehLIVRaOhInVRQX noaa token
function initMap() {
    //geocoder = new google.maps.Geocoder();
    

   // map = new google.maps.Map(document.getElementById('map'), {
   //     center: { lat: -34.397, lng: 150.644 },
   //     zoom: 8
   // });
}
$(document).ready(function () {
    //NOAATideRequest(NOAAendpoints.datacategories);

    LoadNOAA_WaterlevelStation();
    //NOAAWeatherrequest(NOAAendpoints.stations);
});

function LoadNOAA_WaterlevelStation() {
    $.getJSON("/data/waterlevelstation.json", function (data) {
        data.stations.forEach(function (s) {
            if (s.state == "MA") {
                stations.push(s);
            }
        });
    }).then(function () {

        var exstation = stations[0];
        
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: new google.maps.LatLng(exstation.lat, exstation.lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: mapstyle
        });

        var infowindow = new google.maps.InfoWindow();

        var markers = [];
        for (i = 0; i < stations.length; i++) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(stations[i].lat, stations[i].lng),
                map: map,
                icon: getCustomMarker("#F67280", "#355C7D", 1, 1)
            });

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infowindow.setContent(stations[i].name);
                    infowindow.open(map, marker);

                    NOAATideRequest(stations[i], 7, eNOAAproduct.water_level_predictions, eNOAAdatum.mean_tide_level);
                    GovWeatherRequest(stations[i], 7);
                }
            })(marker, i));

            markers.push(marker);
        }
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
        }
        map.fitBounds(bounds);

    });
}
function GovWeatherRequest(station, range) {
    var ran = GetTimeRange(range);
    var url = "https://api.weather.gov/points/";
    var endpoint = station.lat + "," + station.lng;
    var urlNext = url + endpoint;
    //installed addin for "allow control allow origin" Hopefully this only needs for local host debug
    //must enable cache?
    $.ajax({
        url: urlNext,
        success: function (w) {
            $.ajax({
                url: w.properties.forecastHourly,
                success: function (wd) {
                    wd.properties.periods.forEach(function (pd) {
                        
                        var weatherItem = {
                            timeFrom: new Date(new Date(pd.startTime).toLocaleString()),//timezone check GMT to local time...
                            timeTo: new Date(new Date(pd.endTime).toLocaleString()),//timezone check
                            temp: pd.temperature,
                            windSpeed: pd.windSpeed,
                            windDirection: pd.windDirection,
                            shortForecast: pd.shortForecast
                        }
                        weatherItems.push(weatherItem);
                    });
                }
            });
        },
        error: ajaxFailed
    }).then(function () {
        console.log(weatherItems);
    });
}
function NOAATideRequest(station, range, product, datum) {
    var ran = GetTimeRange(range);
    var url = "https://tidesandcurrents.noaa.gov/api/datagetter?";
    var endpoints = "begin_date=" + ran[0] + "&end_date=" + ran[1] + "&station=" + station.id + "&product=" + product;
    if (datum != undefined) {
        endpoints += "&datum=" + datum;
    }
    endpoints += "&units=english&time_zone=lst_ldt&application=ports_screen&format=json";
    $.ajax({
        url: url + endpoints,
        cache: false,
        dataType: "json",
        success: function (d) {
            console.log(d.predictions);
        },
        error: ajaxFailed
    });
}
var eNOAAproduct = {
    water_level: "water_level",
    water_level_predictions: "predictions",
    water_level_hourly_height: "hourly_height",
    water_level_high_low: "high_low",
    water_level_daily_mean: "daily_mean",
    water_level_monthly_mean: "monthly_mean",
    water_level_one_minute_water_level: "one_minute_water_level",
    air_temperature: "air_temperature",
    water_temperature: "water_temperature",
    wind: "wind",
    air_pressure: "air_pressure",
    air_gap: "air_gap",
    conductivity: "conductivity",
    visibility: "visibility",
    humidity: "humidity",
    salinity: "salinity",
    datums: "datums",
    currents: "currents"
}
var eNOAAdatum = {
    columbia_river_datum: "CRD",
    international_great_lakes_datum: "IGLD",
    great_lakes_low_water_datum_chart_datum: "LWD",
    mean_higher_high_water: "MHHW",
    mean_high_water: "MHW",
    mean_tide_level: "MTL",
    mean_sea_level: "MSL",
    mean_low_water: "MLW",
    mean_lower_low_water: "MLLW",
    north_american_vertical_datum: "NAVD",
    station_datum: "STND",
}
//google maps
function getCustomMarker(color, stroke, strokeWeight, scale) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: stroke,
        strokeWeight: strokeWeight,
        scale: scale,
    };
}
//supports
function ajaxFailed(e) {
    $('#test').html(e.responseText);
}

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth(); // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
    ].join('');
};
function GetTimeRange(ran) {
    var now = Date.now();
    var sooner = new Date(now);
    var lower = sooner.yyyymmdd() + " 00:00";
    var later = new Date(now);
    later.setDate(later.getDate() + ran);
    var upper = later.yyyymmdd() + " 00:00";
    return [lower, upper];
}

