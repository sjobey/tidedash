var GoogleMapAPIHandler = (function () {
    var map = null;
    var markers = [];
    var mapAttributes = {
        mapStyle: "dark&blue",
        markerColor: "#F67280",
        markerStrokeColor: "#355C7D",
        markerStrokeWeight: 1,
        markerScale : 1
    }
    var infowindow = new google.maps.InfoWindow();//local global?

    function MapHandler() {
        this.DrawMap = function (divId, lat, lng, zoom) {
            zoom = typeof zoom !== 'undefined' ? zoom : 10;
            map = new google.maps.Map(document.getElementById(divId), {
                zoom: zoom,
                center: new google.maps.LatLng(lat, lng),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: mapstyle
            });
        }
        this.AddMarkers = function (lats, lngs, contents, data, clickFn, overFn, outFn) {
            if (lats.length != lngs.length) return;
            for (i = 0; i < lats.length; i++) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lats[i], lngs[i]),
                    map: map,
                    icon: GetCustomMarker(mapAttributes.markerColor, mapAttributes.markerStrokeColor, mapAttributes.markerStrokeWeight, mapAttributes.markerScale)
                });
                marker.datum = data[i];

                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(contents[i]);
                        infowindow.open(map, marker);
                        
                        if (clickFn != undefined) {
                            clickFn(marker.datum);
                        }
                    }
                })(marker, i));
               google.maps.event.addListener(marker, 'mouseover', (function (marker, i) {
                   return function () {
                       infowindow.setContent(contents[i]);
                       infowindow.open(map, marker);
                   }
               })(marker, i));
                //UX question... how about show all names as default?
              // google.maps.event.addListener(marker, 'mouseout', (function (marker, i) {
              //     return function () {
              //         //what if I want to keep clicked window?...
              //         infowindow.close();
              //     }
              // })(marker, i));
               
               markers.push(marker);
            }
        }
        this.ZoomToFitToMarkers = function () {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }
            map.fitBounds(bounds);
        }
        this.RemoveAllMarkers = function() {
            for (i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers.length = 0;
            //To prevent flickering of the markers on the map, check for an existing map by using .getMap() before using .setMap(map)
        }
        this.AddZoomEventFunction = function (eFn) {
            if (eFn != undefined) {
                google.maps.event.addListener(map, 'zoom_changed', function () {
                    zoomLevel = map.getZoom();
                    eFn(zoomLevel);
                });
            }
        }
    }

    function PlaceHandler() {

    }

    var GetCustomMarker = function (color, stroke, strokeWeight, scale) {
        return {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: stroke,
            strokeWeight: strokeWeight,
            scale: scale,
        };
    }
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

    return {
        mapAttributes: mapAttributes,
        MapHandler: MapHandler,
        PlaceHandler:PlaceHandler
    }
});