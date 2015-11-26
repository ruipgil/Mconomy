function dotplot(data, ow, oh) {
  var margin = {top: 20, right: 20, bottom: 30, left: 50};
  var width = ow - margin.left - margin.right;
  var height = oh - margin.top - margin.bottom;

  var x = d3.scale.linear()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  var rMax = d3.max(data.map(function(d) { return d.r; }));
  var r = d3.scale.linear()
  .domain([0, 0.5, 1]);

  var cMax = d3.max(data.map(function(d) { return d.c; }));
  var c = d3.scale.linear()
  .domain([0, 0.5, 1])
  .range(["#deebf7","#9ecae1","#3182bd"]);

  var svg = d3.select("#plotContainer").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Compute the scales’ domains.
  x.domain(d3.extent(data, function(d) { return d.x; })).nice();
  y.domain(d3.extent(data, function(d) { return d.y; })).nice();

  // Add the x-axis.
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.svg.axis().scale(x).orient("bottom"));

  // Add the y-axis.
  svg.append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis().scale(y).orient("left"));

  // Add the points!
  svg.selectAll(".point")
  .data(data)
  .enter().append("path")
  .attr("class", "point")
  .attr("d", function(d) {
    var a = d3.svg.symbol().type("circle").size(d.r?r(d.r/rMax)*512:64)();
    return a;
  })
  .attr("fill", function(d) {
    return c(d.c/cMax || 0);
  })
  .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
};
