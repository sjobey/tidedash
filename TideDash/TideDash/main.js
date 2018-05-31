var samples, data, width, height, margin, w, h, xScale, yScale, svg, xAxis, yAxis, line, g, path;
samples = Math.PI * 3;
data = generateSineData(samples);
width = 900;
height = 400;
margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40
};

var mymap = L.map('mapid').setView([41.8, -70.5], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY3Nqb2JlcmciLCJhIjoiY2poY3Z6ODdnMGhuZzNjbXdzOWR1dTN1dSJ9.3mXFrNx5qfZcW-09ylFaIQ'
}).addTo(mymap);

d3.csv("data/StriperFishingSpotsMA.csv", function (data) {
    console.log(data);
    var marker = L.marker([data['Lat'] * 1.006, data['Long'] * -1.00099]).addTo(mymap);
    marker.bindPopup(data.Location + "</b><br>" + data.City).openPopup();

});



var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(e.latlng.toString())
        .openOn(mymap);
}
mymap.on('click', onMapClick);


var exp = $(".expand");
exp.click(function () {
    $(".panel").toggleClass("expanded", 1000);
    exp.toggleClass("expanded", 1000);
    $(".expandIcon").toggleClass("expanded", 1000);
});
//$(".expand").css("top", window.innerHeight / 2 + 42 + "px");

function Parser3(d) {
    var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse;
    var entry = { date: parseDate(d.Time), val: parseFloat(d.LongFreq.replace(">", "").replace("<", "")) }; // turn the date string into a date object
    return entry;
}

var dv = new DataVis();
var lineParams = new dv.Params();

lineParams.fileName = "data/UM8026.csv";
lineParams.containerClass = ".container";
lineParams.id = 3;
lineParams.yAxisLabel = "Tide Level"
lineParams.colorRange = ['#fff'];
lineParams.width = 600;
var parser = Parser3;
var chart3 = new dv.LineGraph();
chart3.draw(lineParams, parser);


var allGraphs = [chart3];

var brushParams = new dv.Params();
brushParams.fileName = "data/UM8026.csv";
brushParams.height = 100;
brushParams.width = 600;
brushParams.containerClass = ".brushbar";
var brushbar = new dv.Brush();
brushbar.draw(brushParams, parser, allGraphs);


function generateSineData(samples) {
    return d3.range(0, 100).map(function (i) {
        return Math.sin(i);
    });
}
