var sortTable = {
  "ABC": function(data) {
    return {
      data: data.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      }),
      sorting: "CBA"
    };
  },
  "CBA": function(data) {
    return {
      data: data.sort(function(a, b) {
        return b.name.localeCompare(a.name);
      }),
      sorting: "ABC"
    };
  },
  "123": function(data) {
    return {
      data: data.sort(function(b, a) {
        return a.value - b.value;
      }),
      sorting: "321"
    };
  },
  "321": function(data) {
    return {
      data: data.sort(function(b, a) {
        return b.value - a.value;
      }),
      sorting: "123"
    };
  }
};

function table(data, w, h) {
  var originalData = data;

  var m = [30, 10, 10, 120],
    w = 960 - m[1] - m[3],
    h = 930*2 - m[0] - m[2];

  var s = sortTable["123"](data);
  data = s.data;
  var sorting = s.sorting;

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]),
    y = d3.scale.ordinal().rangeRoundBands([0, h], .1),
    ny = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var numberAxis = d3.svg.axis().scale(ny).orient("left").tickSize(0);

  var svg = d3.select("body").append("svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  // Set the scale domain.
  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  y.domain(data.map(function(d) { return d.name; }));
  ny.domain(data.map(function(d) { return d.value.toFixed(3); }));

  var bar = svg.selectAll("g.bar")
  .data(data)
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });

  bar.append("rect")
  .attr("width", function(d) { return x(d.value); })
  .attr("height", y.rangeBand());

  bar.append("text")
  .attr("class", "value")
  //.attr("x", function(d) { return x(d.value); })
  .attr("transform", "translate(" + (-5) + ",0)")
  .attr("y", y.rangeBand() / 2)
  //.attr("dx", -3)
  .attr("dy", ".35em")
  .attr("text-anchor", "end")
  .text(function(d) { return format(d.value); });

  svg.append("g")
  .attr("class", "x axis")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis yyy")
  .attr("transform", "translate(" + (-40) + ",0)")
  .call(yAxis);

  svg.append("g")
  .attr("class", "y axis order-country")
  .append("text")
  .attr("transform", "translate(" + (-45) + ",0)")
  .attr("text-anchor", "end")
  .text("Country");

  svg.append("g")
  .attr("class", "y axis order-value")
  .append("text")
  .attr("transform", "translate(" + (-5) + ",0)")
  .attr("text-anchor", "end")
  .text("Value");

  function updateSort() {

    y.domain(data.map(function(d) { return d.name; }));
    ny.domain(data.map(function(d) { return d.value.toFixed(3); }));

    d3.selectAll(".yyy")
    .transition()
    .duration(750)
    .ease("quad-in-out")
    .call(yAxis);

    d3.selectAll(".ny")
    .transition()
    .duration(750)
    .ease("quad-in-out")
    .call(numberAxis);

    bar.transition()
    .duration(750)
    .ease("quad-in-out")
    .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });
  }


  document.querySelector(".order-value")
  .addEventListener("click", function() {
    if(sorting=="CBA" || sorting=="ABC") {
      sorting = "321";
    }
    s = sortTable[sorting](data);
    data = s.data;
    sorting = s.sorting;

    updateSort();
  });

  document.querySelector(".order-country")
  .addEventListener("click", function() {
    if(sorting=="123" || sorting=="321") {
      sorting = "CBA";
    }
    s = sortTable[sorting](data);
    data = s.data;
    sorting = s.sorting;

    updateSort();
  });

  /*svg.append("g")
    .attr("class", "ny axis")
    .call(numberAxis);*/

  return function(newData) {
    dMap = data.reduce(function(prev, curr, i) {
        prev[curr.name] = i;
        return prev;
        }, {});
    data = newData.reduce(function(prev, curr, i) {
        prev[dMap[curr.name]] = curr;
        return prev;
        }, []);

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.name; }));
    ny.domain(data.map(function(d) { return d.value.toFixed(3); }));


  xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h);
  yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
  d3.selectAll(".x")
  .transition()
  .duration(750)
  .ease("quad-in-out")
  .call(xAxis);
  d3.selectAll(".yyy")
  .transition()
  .duration(750)
  .ease("quad-in-out")
  .call(yAxis);

  bar.data(data).transition()
  .duration(750)
  .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; })
  .attr("x", function(d) { return x(d.value); });
  bar.transition()
  .duration(750)
  .select("text")
  .text(function(d) { return format(d.value); });
  bar.transition()
  .duration(750)
  .select("rect")
  .attr("width", function(d) { return x(d.value); });

  /*xAxis = xAxis.scale(x);
    yAxis = yAxis.scale(y);
    numberAxis = numberAxis.scale(ny);*/
  };
}
