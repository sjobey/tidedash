var DataVis = (function () {

    function Params() {
        this.id = 1;
        this.fileName = "data.csv";
        this.containerClass = ".container"
        this.yAxisLabel = "Value";
        this.yDomainOverride = 0;
        this.margin = { top: 20, right: 40, bottom: 100, left: 60 };
        this.width = window.innerWidth - (window.innerWidth*0.15)  - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.colorRange = ["#4FFFEC", "#FF8C4F", "#FFB14F", "#FFFF56", "#6DFF56", "#56FFA5", "#4FFFEC", "#4FFFEC", '#FF614F', "#4FFFEC", "#ED55FF"];

    }

    function BarGraph() {

        this.draw = function (params, parse, hoverFn) {
            this.params = params;
            this.parse = parse;
            this.shapeType = "rect";
            var colour = d3.scale.ordinal()
                .range(params.colorRange);

            // mathematical scales for the x and y axes
            this.x = d3.time.scale()
                            .range([0, params.width]);
            this.y = d3.scale.linear()
                            .range([params.height, 0]);

            // rendering for the x and y axes
            this.xAxis = d3.svg.axis()
                            .scale(this.x)
                            .orient("bottom");
            this.yAxis = d3.svg.axis()
                            .scale(this.y)
                            .orient("left");

            // something for us to render the chart into
            var svg = d3.select(params.containerClass)
            .append("svg") // the overall space
            .attr("width", params.width + params.margin.left + params.margin.right)
            .attr("height", params.height + params.margin.top + params.margin.bottom);

            var clip = svg.append("svg:clipPath")
            .attr("id", "clip"+params.id)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", params.width)
            .attr("height", params.height);

            this.main = svg.append("g")
            .attr("class", "main")
            .attr("clip-path", "url(#clip" + params.id + ")")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")")
            .attr("width", params.width - params.margin.left - params.margin.right)
            .attr("height", params.height);

            this.mainAxis = svg.append("g")
            .attr("class", "main")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")")
            .attr("width", params.width - params.margin.left - params.margin.right)
            .attr("height", params.height);

            this.mainAxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - params.margin.left - 5)
            .attr("x", 0 - (params.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("fill", "white")
            .text(params.yAxisLabel);

            var that = this;

            d3.csv(params.fileName, parser, function (data) {

                // data ranges for the x and y axes
                that.x.domain(d3.extent(data, function (d) { return d.date; }));

                if (that.params.yDomainOverride == 0) {
                    that.y.domain(d3.extent(data, function (d) { return d.val; }));
                }
                else {
                    that.y.domain(d3.extent([0, that.params.yDomainOverride]));
                }


                // draw the bars
                that.main.append("g")
                    .attr("class", "bars")
                    .selectAll(that.shapeType)
                    .data(data) //function(d) { return d.val; })
                    .enter().append(that.shapeType)
                        .attr("class", "bar")
                        .attr("x", function (d) { return that.x(d.date) - 3; })
                        .attr("width", 6)
                        .attr("y", function (d) { return that.y(d.val); })
                        .attr("height", function (d) { return that.params.height - that.y(d.val); })
                        .style("fill", that.params.colorRange[0]);// "function(d) { return colour(0)})//d.name); });

                // draw the axes now that they are fully set up
                that.mainAxis.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + that.params.height + ")")
                    .attr("z-index", "2")
                    .call(that.xAxis);

                that.mainAxis.append("g")
                    .attr("class", "y axis")
                    .attr("z-index", "2")
                    .call(that.yAxis);

            });
        }

    }

    function Brush() {

        this.draw = function (params, parser, graphs) {
            this.graphs = graphs;
            this.params = params;
            this.svg = d3.select(params.containerClass)
            .append("svg") // the overall space
            .attr("width", params.width + params.margin.left + params.margin.right)
            .attr("height", params.height + params.margin.top + params.margin.bottom);

            this.x = d3.time.scale()
                .range([0, params.width]);

            this.y = d3.scale.linear()
                            .range([params.height, 0]);

            this.xOverview = d3.time.scale()
                .range([0, params.width]);

            this.yOverview = d3.scale.linear()
                .range([params.height, 0]);

            this.xAxisOverview = d3.svg.axis()
                .scale(this.xOverview)
                .orient("bottom");
            var that = this;

            this.brush = d3.svg.brush()
                .x(this.xOverview);

            this.brush.on("brush", function () {
                that.graphs.forEach(function (graph) {
                    console.log("Graph Brushed");
                    // update the main chart's x axis data range
                    graph.x.domain(that.brush.empty() ? that.xOverview.domain() : that.brush.extent());
                    console.log(that.brush.extent());

                    // redraw the bars on the main chart
                    graph.main.selectAll(graph.shapeType).attr("x", function (d) { return graph.x(d.date) });
                    graph.main.select(".area").attr("d", graph.area);
                    graph.main.select(".line").attr("d", graph.valueLine);

                    // redraw the x axis of the main chart
                    graph.mainAxis.select(".x.axis").call(graph.xAxis);
                });
            });
                
            console.log("test");
            


            d3.csv(params.fileName, parser, function (data) {

                that.x.domain(d3.extent(data, function (d) { return d.date; }));
                that.xOverview.domain(d3.extent(data, function (d) { return d.date; }));
                //yOverview.domain(y.domain());
                that.yOverview.domain([0, d3.max(data, function (d) { return +d.val; })]);

                // brush tool to let us zoom and pan using the overview chart


                var overview = that.svg.append("g")
                    .attr("class", "overview")
                    .attr("transform", "translate(" + that.params.margin.left + "," + that.params.margin.top + ")");
                
                overview.append("g")
                    .attr("class", "bars")
                    .selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return that.xOverview(d.date) - 3; })
                    .attr("width", 1)
                    .attr("y", function (d) { return that.yOverview(d.val); })
                    .attr("height", function (d) { return that.params.height - that.yOverview(d.val); })
                    .attr("fill", "#fff");
                

                overview.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + that.params.height + ")")
                    .attr("z-index", "2")
                    .call(that.xAxisOverview);

            // add the brush target area on the overview chart
            overview.append("g")
                        .attr("class", "x brush")
                        .call(that.brush)
                        .selectAll("rect")
                            // -6 is magic number to offset positions for styling/interaction to feel right
                            .attr("y", -6)
                            // need to manually set the height because the brush has
                            // no y scale, i.e. we should see the extent being marked
                            // over the full height of the overview chart
                            .attr("height", that.params.height + 7);  // +7 is magic number for styling

            });



            
        }

    }
    
    function LineGraph() {

        this.draw = function (params, parse, hoverFn) {
            this.params = params;
            this.parse = parse;
            this.shapeType = ".line";
            var colour = d3.scale.ordinal()
                .range(params.colorRange);

            // mathematical scales for the x and y axes
            this.x = d3.time.scale()
                            .range([0, params.width]);
            this.y = d3.scale.linear()
                            .range([params.height, 0]);

            // rendering for the x and y axes
            this.xAxis = d3.svg.axis()
                            .scale(this.x)
                            .orient("bottom");
            this.yAxis = d3.svg.axis()
                            .scale(this.y)
                            .orient("left");

            // something for us to render the chart into
            var svg = d3.select(params.containerClass)
            .append("svg") // the overall space
            .attr("width", params.width + params.margin.left + params.margin.right)
            .attr("height", params.height + params.margin.top + params.margin.bottom);

            var clip = svg.append("svg:clipPath")
            .attr("id", "clip"+params.id)
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", params.width)
            .attr("height", params.height);

            this.main = svg.append("g")
            .attr("class", "main")
            .attr("clip-path", "url(#clip" + params.id+")")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")")
            .attr("width", params.width - params.margin.left - params.margin.right)
            .attr("height", params.height);

            this.mainAxis = svg.append("g")
            .attr("class", "mainAxis")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")")
            .attr("width", params.width - params.margin.left - params.margin.right)
            .attr("height", params.height);

            this.mainAxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - params.margin.left - 5)
            .attr("x", 0 - (params.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("fill", "white")
            .text(params.yAxisLabel);



            var that = this;

            d3.csv(params.fileName, parser, function (data) {
                that.x.domain(d3.extent(data, function (d) { return d.date; }));


                if (that.params.yDomainOverride == 0) {
                    that.y.domain(d3.extent(data, function (d) { return d.val; }));
                }
                else {
                    that.y.domain(d3.extent([0,that.params.yDomainOverride]));
                }
                


                that.area = d3.svg.area()
                    .x(function (data) { return that.x(data.date); })
                    .y0(that.params.height)
                    .y1(function (data) { return that.y(data.val); });

                that.valueLine = d3.svg.line()
                    .x(function (data) { return that.x(data.date); })
                    .y(function (data) { return that.y(data.val); });

                // draw the area fill
                that.main.append("path")
                    .datum(data)
                    .attr("class", "area")
                    .attr("d", that.area);

                // draw the lines
                that.main.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", that.valueLine)
                    .attr('stroke', that.params.colorRange[0]);


                // draw the axes now that they are fully set up
                that.mainAxis.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + that.params.height + ")")
                    .attr("z-index", "2")
                    .call(that.xAxis);

                that.mainAxis.append("g")
                    .attr("class", "y axis")
                    .attr("z-index", "2")
                    .call(that.yAxis);

            });
        }

    }

    function AdjacencyMatrix() {

        this.draw = function (params) {
            this.params = params;

            this.x = d3.scale.ordinal().rangeBands([0, this.params.width]),
            this.z = d3.scale.linear().domain([0, 4]).clamp(true),
            this.c = d3.scale.ordinal().domain([0, 4]).range(this.params.colorRange);

            this.svg = d3.select(this.params.containerClass).append("svg")
                .attr("width", this.params.width + this.params.margin.left + this.params.margin.right)
                .attr("height", this.params.height + this.params.margin.top + this.params.margin.bottom)
                .style("margin-left", -this.params.margin.left + "px")
              .append("g")
                .attr("transform", "translate(" + this.params.margin.left + "," + this.params.margin.top + ")");

            var that = this;

            d3.json(params.fileName, function (data) {
                var matrix = [],
                    nodes = data.nodes,
                    n = nodes.length;

                // Compute index per node.
                nodes.forEach(function (node, i) {
                    node.index = i;
                    node.count = 0;
                    matrix[i] = d3.range(n).map(function (j) { return { x: j, y: i, z: 0 }; });
                });

                // Convert links to matrix; count character occurrences.
                data.links.forEach(function (link) {
                    matrix[link.source][link.target].z += link.value;
                    matrix[link.target][link.source].z += link.value;
                    matrix[link.source][link.source].z += link.value;
                    matrix[link.target][link.target].z += link.value;
                    nodes[link.source].count += link.value;
                    nodes[link.target].count += link.value;
                });

                // Precompute the orders.
                var orders = {
                    name: d3.range(n).sort(function (a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
                    count: d3.range(n).sort(function (a, b) { return nodes[b].count - nodes[a].count; }),
                    group: d3.range(n).sort(function (a, b) { return nodes[b].group - nodes[a].group; })
                };

                // The default sort order.
                that.x.domain(orders.count);

                that.svg.append("rect")
                    .attr("class", "background")
                    .attr("width", that.params.width)
                    .attr("height", that.params.height);

                var row = that.svg.selectAll(".row")
                    .data(matrix)
                    .enter().append("g")
                    .attr("class", "row")
                    .attr("transform", function (d, i) { return "translate(0," + that.x(i) + ")"; })
                    .each(row);

                row.append("line")
                    .attr("class", "gridLine")
                    .attr("x2", that.params.width);

                row.append("text")
                    .attr("class", "label")
                    .attr("x", -4)
                    .attr("y", that.x.rangeBand() / 2)
                    .attr("dy", ".32em")
                    .style("text-anchor", "end")
                    .text(function (d, i) { return nodes[i].id;});

                var column = that.svg.selectAll(".column")
                    .data(matrix)
                    .enter().append("g")
                    .attr("class", "column")
                    .attr("transform", function (d, i) { return "translate(" + that.x(i) + ")rotate(-90)"; });

                column.append("line")
                    .attr("class", "gridLine")
                    .attr("x1", -that.params.width);

                column.append("text")
                    .attr("class", "label")
                    .attr("x", 6)
                    .attr("y", that.x.rangeBand() / 2)
                    .attr("dy", ".32em")
                    .attr("text-anchor", "start")
                    .text(function (d, i) { return nodes[i].id; });

                function row(row) {
                    var cell = d3.select(this).selectAll(".cell")
                        .data(row.filter(function (d) { return d.z; }))
                      .enter().append("rect")
                        .attr("class", "cell")
                        .attr("x", function (d) { return that.x(d.x); })
                        .attr("width", that.x.rangeBand())
                        .attr("height", that.x.rangeBand())
                        .style("fill", function (d) { return that.c(nodes[d.x].group) })
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout);
                }

                function mouseover(p) {
                    d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
                    d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
                }

                function mouseout() {
                    d3.selectAll("text").classed("active", false);
                }

                d3.select("#order").on("change", function () {
                    clearTimeout(timeout);
                    order(this.value);
                });

                function order(value) {
                    that.x.domain(orders[value]);

                    var t = that.svg.transition().duration(2500);

                    t.selectAll(".row")
                        .delay(function (d, i) { return that.x(i) * 4; })
                        .attr("transform", function (d, i) { return "translate(0," + that.x(i) + ")"; })
                      .selectAll(".cell")
                        .delay(function (d) { return that.x(d.x) * 4; })
                        .attr("x", function (d) { return that.x(d.x); });

                    t.selectAll(".column")
                        .delay(function (d, i) { return that.x(i) * 4; })
                        .attr("transform", function (d, i) { return "translate(" + that.x(i) + ")rotate(-90)"; });
                }
            });
        }
    }

    return {
        Params: Params,
        BarGraph: BarGraph,
        Brush: Brush,
        LineGraph: LineGraph,
        AdjacencyMatrix: AdjacencyMatrix
    }


});