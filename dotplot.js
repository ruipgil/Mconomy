function highlightCountry(name) {
  // enable opacity for every parent
  // enable opacity 1 for selected
  d3.selectAll('[data-country]').attr("opacity", 0.7);
  var c = d3.selectAll('[data-country="'+name+'"]');
  c.classed("country-highlight", true);
  c.attr("opacity", 1);

  c.each(function() {
    this.parentNode.appendChild(this);
  });
}
function dehighlightCountry(name) {
  var c = d3.selectAll('[data-country="'+name+'"]');
  c.classed("country-highlight", false);
  d3.selectAll('[data-country]').attr("opacity", 1);
}

function selectFromAttribute(dElm, str) {
  var splited = (str || "").split(".");
  switch(splited.length) {
    case 1:
      return dElm[splited[0]];
    case 2:
      return dElm[splited[0]][splited[1]];
    case 3:
      return dElm[splited[0]][splited[1]][splited[2]];
  }
}

function dotplot(alldata, attributes, ow, oh) {
  var data = [];
  function dataFill() {
    data = alldata.map(function(d) {
      return {
        name: d.name,
        x: selectFromAttribute(d, attributes.x.value),
        y: selectFromAttribute(d, attributes.y.value),
        r: selectFromAttribute(d, attributes.r.value),
        c: selectFromAttribute(d, attributes.c.value)
      };
    });
  }
  dataFill();

  var margin = {top: 20, right: 20, bottom: 40, left: 60};
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

  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left");

  function axisPopup(attribute, description, none) {
    var ch = d3.select("#axis-sel-overlay")
    .attr("style", "display: block; width: "+ow+"px; height: "+(oh*2/3)+"px;padding-top:"+(oh/3)+"px;");
    d3.select("#axis-sel-overlay .axis-sp")
    .text(description);
    var h = d3.select("#overlay-changer")
    .on("change", null)
    .on("change", function() {
      var v = this.value;
      var parts = v.split(":");
      attributeUpdater(attribute, parts[0], parts[0], parts[1]);
      ch.attr("style", "display: node");
      h.on("change", null);
      this.value = null;
    });
    if (none) {
      d3.select("#none-option")
      .attr("style", "display: block");
    } else {
      d3.select("#none-option")
      .attr("style", "display: none");
    }
  }

  // Add the x-axis.
  svg.append("g")
  .attr("class", "dot-x dot-axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  // y axis label
  svg.append("text")
  .attr("class", "dot-y-label")
  .attr("transform", "rotate(-90), translate(-"+(height/2-margin.top/2)+", -50)")
  .attr("text-anchor", "middle")
  .text(attributes.y.label)
  .on("click", function() {
    axisPopup("y", "y axis");
  });

  // x axis label
  svg.append("text")
  .attr("class", "dot-x-label")
  .attr("transform", "translate("+(width/2+margin.left/2-10)+", "+(height+margin.bottom-10)+")")
  .attr("text-anchor", "middle")
  .text(attributes.x.label)
  .on("click", function() {
    axisPopup("x", "x axis");
  });

  // Draw size circles
  var C_R_SEL_X = width;
  var C_R_SEL_Y = -10;
  svg.append("g")
  .attr("transform", "translate("+(C_R_SEL_X+2)+", "+C_R_SEL_Y+")")
  .append("circle")
  .attr("r", 3)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1);

  svg.append("g")
  .attr("transform", "translate("+(C_R_SEL_X+1)+", "+C_R_SEL_Y+")")
  .append("circle")
  .attr("r", 6)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1);

  svg.append("g")
  .attr("transform", "translate("+C_R_SEL_X+", "+C_R_SEL_Y+")")
  .append("circle")
  .attr("r", 9)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1);

  svg.append("text")
  .attr("class", "dot-r-label")
  .attr("transform", "translate("+(width-12)+", -7)")
  .attr("text-anchor", "end")
  .text(attributes.c.label || "None")
  .on("click", function() {
    axisPopup("r", "radius", true);
  });

  // Add the y-axis.
  svg.append("g")
  .attr("class", "dot-y dot-axis")
  .call(yAxis);

  // Add the points!
  var point = svg.selectAll(".point")
  .data(data)
  .enter().append("path")
  .attr("class", "point")
  .attr("data-country", function(d) {
    return d.name;
  })
  .attr("stroke", "black")
  .attr("stroke-width", 0)
  .attr("d", function(d) {
    var a = d3.svg.symbol().type("circle").size(d.r?r(d.r/rMax)*512:64)();
    return a;
  })
  .attr("fill", function(d) {
    return c(d.c/cMax || 0);
  })
  .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
  .on("mouseenter", function(d) {
    highlightCountry(d.name);
  })
  .on("mouseleave", function(d) {
    dehighlightCountry(d.name);
  });
  function updatePlot() {

    x.domain(d3.extent(data, function(d) { return d.x; })).nice();
    y.domain(d3.extent(data, function(d) { return d.y; })).nice();

    xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format(attributes.x.format));
    yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(attributes.y.format));

    d3.selectAll(".dot-x")
    .transition()
    .duration(750)
    .call(xAxis);
    d3.selectAll(".dot-y")
    .transition()
    .duration(750)
    .call(yAxis);

    d3.select(".dot-y-label")
    .text(attributes.y.label);

    d3.select(".dot-x-label")
    .text(attributes.x.label);

    d3.select(".dot-r-label")
    .text(attributes.r.label || "None");

    rMax = d3.max(data.map(function(d) { return d.r; }));
    cMax = d3.max(data.map(function(d) { return d.c; }));
    point
    .data(data)
    .transition()
    .duration(750)
    .attr("d", function(d) {
      var a = d3.svg.symbol().type("circle").size(d.r?r(d.r/rMax)*512:64)();
      return a;
    })
    .attr("fill", function(d) {
      return c(d.c/cMax || 0);
    })
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
  }
  function attributeUpdater(attribute, value, label, format) {
    attributes[attribute] = {
      value: value,
      label: label,
      format: format
    };
    dataFill();
    updatePlot();
  };
  ggg = attributeUpdater;
  return attributeUpdater;
};
