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



w = width - margin.right;
h = height - margin.top - margin.bottom;
xScale = d3.scale.linear().domain([0, samples - 1]).range([0, w]);
yScale = d3.scale.linear().domain([-1, 1]).range([h, 0]);

svg = d3.select('.panel')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .append('g')
    .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", w)
    .attr("height", h);

xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(10)
    .orient('bottom');

svg.append('g')
    .attr('class', 'x axis')
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);

yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(5)
    .orient('left');

svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

line = d3.svg.line().x(function (d, i) {
    return xScale(i);
}).y(function (d, i) {
    return yScale(d);
}).interpolate('basis');

g = svg.append('g')
    .attr('clip-path', 'url(#clip)');

path = g.append('path')
    .attr('class', 'line')
    .data([data]).attr('d', line)
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('stroke-width', '1px');

function generateSineData(samples) {
    return d3.range(0, 100).map(function (i) {
        return Math.sin(i);
    });
}


//

function draw(filename, barColor) {


    // set up a date parsing function for future use
    var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse; //CHECK

    // some colours to use for the bars
    var colour = d3.scale.ordinal()
                        .range(['#FF614F', "#FF8C4F", "#FFB14F", "#FFFF56", "#6DFF56", "#56FFA5", "#4FFFEC", "#4FFFEC", "#4FFFEC", "#4FFFEC", "darkgray", "#ED55FF", "#FFFFFF", "white"]);

    // mathematical scales for the x and y axes
    var x = d3.time.scale()
                    .range([0, width]);
    var y = d3.scale.linear()
                    .range([height, 0]);
    var xOverview = d3.time.scale()
                    .range([0, width]);
    var yOverview = d3.scale.linear()
                    .range([heightOverview, 0]);

    // rendering for the x and y axes
    var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
    var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

    var xAxisOverview = d3.svg.axis()
                    .scale(xOverview)
                    .orient("bottom");

    // something for us to render the chart into
    var svg = d3.select(".container")
    .append("svg") // the overall space
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    var clip = svg.append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

    var main = svg.append("g")
    .attr("class", "main")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width - margin.left - margin.right)
    .attr("height", height);



    var mainAxis = svg.append("g")
    .attr("class", "main")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width - margin.left - margin.right)
    .attr("height", height);

    mainAxis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 5)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("fill", "white")
    .text("Vertical Peak Particle Velocity (in/s)");


    var overview = svg.append("g")
        .attr("class", "overview")
        .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

    // brush tool to let us zoom and pan using the overview chart
    var brush = d3.svg.brush()
        .x(xOverview)
        .on("brush", brushed);

    // setup complete, let's get some data!
    d3.csv(filename, parse, function (data) {
        // data ranges for the x and y axes
        x.domain(d3.extent(data, function (d) { return d.date; }));
        //y.domain([0,  d3.max(data, function(d) { return +d.val; })]);
        y.domain([0, 0.035]);
        //console.log(d3.max(data, function(d) { return +d.val; }));
        xOverview.domain(x.domain());
        //yOverview.domain(y.domain());
        yOverview.domain([0, d3.max(data, function (d) { return +d.val; })]);
        // data range for the bar colours
        // (essentially maps attribute names to colour values)
        colour.domain(d3.keys(data[0]));

        // draw the bars
        main.append("g")
            .attr("class", "bars")
            .selectAll("rect")
            .data(data) //function(d) { return d.val; })
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return x(d.date) - 3; })
                .attr("width", 6)
                .attr("y", function (d) { return y(d.val); })
                .attr("height", function (d) { return height - y(d.val); })
                .style("fill", barColor);// "function(d) { return colour(0)})//d.name); });

        overview.append("g")
                .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return xOverview(d.date) - 3; })
                .attr("width", 1)
                .attr("y", function (d) { return yOverview(d.val); })
                .attr("height", function (d) { return heightOverview - yOverview(d.val); })
                .attr("fill", "#666");

        // draw the axes now that they are fully set up
        mainAxis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("z-index", "2")
            .call(xAxis);
        mainAxis.append("g")
            .attr("class", "y axis")
            .attr("z-index", "2")
            .call(yAxis);
        overview.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + heightOverview + ")")
            .attr("z-index", "2")
            .call(xAxisOverview);

        // add the brush target area on the overview chart
        overview.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                        // -6 is magic number to offset positions for styling/interaction to feel right
                        .attr("y", -6)
                        // need to manually set the height because the brush has
                        // no y scale, i.e. we should see the extent being marked
                        // over the full height of the overview chart
                        .attr("height", heightOverview + 7);  // +7 is magic number for styling

        var thres = main.append("line")
        .attr("class", "thres")
        .attr('x1', 0)
        .attr('y1', y(0.030))
        .attr('x2', width)
        .attr('y2', y(0.030))
        .style("stroke", "gray")
        .style("stroke-width", "1")
        .style("stroke-dasharray", "5,5")
        .style("d", "M5 20 l215 0");
    });



    // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
    function parse(d) {
        var entry = { date: parseDate(d.Time), val: parseFloat(d.VertPPV) }; // turn the date string into a date object
        return entry;
    }

    // zooming/panning behaviour for overview chart
    function brushed() {
        // update the main chart's x axis data range
        x.domain(brush.empty() ? xOverview.domain() : brush.extent());

        // redraw the bars on the main chart
        main.selectAll("rect")
                .attr("x", function (d) { return x(d.date) });
        // redraw the x axis of the main chart
        mainAxis.select(".x.axis").call(xAxis);
    }

}
