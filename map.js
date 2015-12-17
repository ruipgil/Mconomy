var mapAttribute;

function updateMap(selected){
  mapAttribute = selected;
}

function map(id,data){

 //d3.select(window).on("resize", throttle);


var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);

var width = document.getElementById('mapContainer').offsetWidth;
var height = document.getElementById('mapContainer').offsetHeight;

var topo,projection,path,svg,g;

var tooltip = d3.select(id).append("div").attr("class", "tooltip hidden");

setup(width,height);

function setup(width,height){
  projection = d3.geo.mercator()
    .translate([0, 0])
    .scale(width / 2.2/ Math.PI);

  path = d3.geo.path()
      .projection(projection);

  svg = d3.select(id).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .call(zoom);

  g = svg.append("g");
  
  legend();

}

d3.json(data, function(error, world) {

  var countries = topojson.feature(world, world.objects.countries).features;

  topo = countries;
  draw(topo);

});

function draw(topo) {
	
  var country = g.selectAll(".country").data(topo);

  var max = d3.max(Object.keys(gMapData).map(function(key) {
    return  selectFromAttribute(gMapData[key], mapAttribute);
  }));0
  
  var color = d3.scale.linear()
    .domain([-1, 0, 0.5, 1])
    .range(["white","#deebf7","#9ecae1","#3182bd"]);

  
  
  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .attr("stroke-width", 0)
      .style("fill", function(d, i) { return color( gMapData[d.properties.name]?(selectFromAttribute(gMapData[d.properties.name], mapAttribute) / max):-1 ); });

	  
  //ofsets plus width/height of transform, plsu 20 px of padding, plus 20 extra for tooltip offset off mouse
  var offsetL = document.getElementById('mapContainer').offsetLeft+(width/2)+40;
  var offsetT = document.getElementById('mapContainer').offsetTop+(height/2)+20;

  country
  .attr("data-country", function(d) {
    return d.properties.name;
  })
  .on("mouseenter", function(d) {
    highlightCountry(d.properties.name);
  })
  .on("mouseleave", function(d) {
    dehighlightCountry(d.properties.name);
  });
  //tooltips
  /*country
    .on("mousemove", function(d,i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
          .html(d.properties.name);
      var sel = d3.select(this);
  sel.moveToFront();
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      });*/

}
function legend(){
	
	var data = [{
      color: "#deebf7",
      label: '0.25'
    }, {
      color: "#9ecae1",
      label: '0.5'
    }, {
      color: "#3182bd",
      label: '0.75'
    }]
	
    var legendWidth = width/6,
      legendHeight = height/12;
	  
	var positionWidth = -width/2.1,
		positionHeight = height/3; 

    var grad = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'grad')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    grad.selectAll('stop')
      .data(data)
      .enter()
      .append('stop')
      .attr('offset', function(d, i) {
        return (i / data.length) * 100 + '%';
      })
      .style('stop-color', function(d) {
        return d.color;
      })
      .style('stop-opacity', 0.9);

    svg.append('rect')
      .attr('x', positionWidth)
      .attr('y', positionHeight)
      .attr('width', legendWidth)
      .attr('height', legendHeight / 2)
      .attr('fill', 'url(#grad)');
      
      
    svg.append('text')
       .attr('x', positionWidth)
      .attr('y', positionHeight + legendHeight)
      .attr("text-anchor", "left")
      .text("Lowest");
      
      svg.append('text')
       .attr('x', positionWidth + legendWidth)
      .attr("text-anchor", "end")
      .attr('y', positionHeight + legendHeight)
      .text("Highest");
     

    svg.append('rect')
      .attr('x', positionWidth)
      .attr('y', positionHeight - legendHeight)
      .attr('width', legendHeight / 2)
      .attr('height', legendHeight / 2)
      .attr('fill', "white");
      
    svg.append('text')
      .attr('x', positionWidth + (0.8*legendHeight))
      .attr('y', positionHeight - (0.6*legendHeight))
      .text("No data");
      
}

function redraw() {
  d3.select('svg').remove();
  var width = document.getElementById('mapContainer').offsetWidth;
  var height = document.getElementById('mapContainer').offsetHeight;
  setup(width,height);
  draw(topo);
}

function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;
  var h = height / 3;

  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

  zoom.translate(t);
  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}

map.redraw = redraw;
}//map
