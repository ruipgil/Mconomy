/*
 * TODO
 *  + select and restrict
 *  + fix format representation
 *  + keep x axis fixed on top
 */
var sortTable = {
  "ABC": function(data) {
    return {
      data: data.sort(function(a, b) {
        if (selection[a.name] && selection[b.name]) {
          return a.name.localeCompare(b.name);
        } else if (selection[a.name]) {
          return ('aaa'+a.name).localeCompare(b.name);
        } else if (selection[b.name]) {
          return a.name.localeCompare('aaa'+b.name);
        } else {
          return a.name.localeCompare(b.name);
        }
      }),
      sorting: "CBA"
    };
  },
  "CBA": function(data) {
    return {
      data: data.sort(function(a, b) {
        if (selection[a.name] && selection[b.name]) {
          return b.name.localeCompare(a.name);
        } else if (selection[a.name]) {
          return ('aaa'+b.name).localeCompare(a.name);
        } else if (selection[b.name]) {
          return b.name.localeCompare('aaa'+a.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      }),
      sorting: "ABC"
    };
  },
  "123": function(data) {
    return {
      data: data.sort(function(b, a) {
        return (selection[a.name]||1)*a.value - (selection[b.name]||1)*b.value;
      }),
      sorting: "321"
    };
  },
  "321": function(data) {
    return {
      data: data.sort(function(b, a) {
        return (selection[a.name]||1)*b.value - (selection[b.name]||1)*a.value;
      }),
      sorting: "123"
    };
  }
};

var oppositeSorting = {
  "ABC": "CBA",
  "CBA": "ABC",
  "123": "321",
  "321": "123"
};

var selection = {};

function table(data, ow, h) {
  var originalData = data;

  var m = [30, 10, 10, 120];
  var w = ow - m[1] - m[3];
  var h = 930*2 - m[0] - m[2];

  var s = sortTable["123"](data);
  data = s.data;
  var sorting = s.sorting;

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]);
  var y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h).tickFormat(format);
  var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);


  var svg = d3.select("#tableContainer").append("svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  // Set the scale domain.
  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  y.domain(data.map(function(d) { return d.name; }));

  var bar = svg.selectAll("g.bar")
  .data(data)
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });

  bar.append("rect")
  .attr("width", function(d) { return x(d.value); })
  .attr("height", y.rangeBand())
  .attr("stroke", "black")
  .attr("stroke-width", 0)
  .on("mouseenter", function(d) {
    highlightCountry(d.name);
  })
  .on("mouseleave", function(d) {
    dehighlightCountry(d.name);
  })
  .attr("data-country", function(d) {
    return d.name;
  })
  .on("click", function(d) {
    if (selection[d.name]) {
      delete selection[d.name];
    } else {
      selection[d.name] = 1000;
    }
    s = sortTable[oppositeSorting[sorting]](data);
    data = s.data;
    sorting = s.sorting;
    updateSort();
  });


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
  .attr("transform", "translate(" + (-48) + ",0)")
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

    d3.selectAll(".yyy")
    .transition()
    .duration(750)
    .ease("quad-in-out")
    .call(yAxis);

    bar.transition()
    .duration(750)
    .ease("quad-in-out")
    .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });
  }

  document.querySelector(".order-value")
  .addEventListener("click", function() {
    if(sorting=="CBA" || sorting=="ABC" || sorting=="???") {
      sorting = "321";
    }
    s = sortTable[sorting](data);
    data = s.data;
    sorting = s.sorting;

    updateSort();
  });

  document.querySelector(".order-country")
  .addEventListener("click", function() {
    if(sorting=="123" || sorting=="321" || sorting=="???") {
      sorting = "CBA";
    }
    s = sortTable[sorting](data);
    data = s.data;
    sorting = s.sorting;

    updateSort();
  });

  return function(newData, newFormat) {
    dMap = data.reduce(function(prev, curr, i) {
      prev[curr.name] = i;
      return prev;
    }, {});
    data = newData.reduce(function(prev, curr, i) {
      prev[dMap[curr.name]] = curr;
      return prev;
    }, []);
    format = d3.format(newFormat) || format;
    sorting = "???";

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.name; }));

    xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h).tickFormat(format);
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

  };
}
