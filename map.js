var index, indexProp, legend;

function updateMap(selected){
	legend = selected;
	switch(selected)
	{
	case "McsPercapita":
		index = "nMacs";
		indexProp = "percapita";
		break;
	case "Number of mcdonalds":
		index = "nMacs";
		indexProp = "value";
		break;
	case "Burgers per wage":
		index = "bigmacIndex";
		indexProp = "burgersPerWage";
		break;
	case "Burger price compared to United States":
		index = "bigmacIndex";
		indexProp = "toUs";
		break;
	case "GDP per capita":
		index = "gdp";
		indexProp = "percapita";
		break;
	case "Human Development Index":
		index = "hdi";
		indexProp = "hdi";
		break;
	case "Expected School years":
		index = "hdi";
		indexProp = "expectedSchool";
		break;
	case "Life expectancy at birth":
		index = "hdi";
		indexProp = "lifeAtBirth";
		break;
	case "Mean school years":
		index = "hdi";
		indexProp = "meanSchool";
		break;
	case "GNI":
		index = "hdi";
		indexProp = "gni";
		break;
	case "Wage":
		index = 'wage';
		indexProp = null;
		break;
	case "Population":
		index = 'population';
		indexProp = null;
		break;
	default:
		index = "nMacs";
		indexProp = "percapita";
	}
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

}

d3.json(data, function(error, world) {

  var countries = topojson.feature(world, world.objects.countries).features;

  topo = countries;
  draw(topo);

});

function draw(topo) {
	
  var country = g.selectAll(".country").data(topo);

  var max = d3.max(Object.keys(gMapData).map(function(key) {
    return  indexProp? gMapData[key][index][indexProp]: gMapData[key][index];
  }));0
  
  var color = d3.scale.linear()
    .domain([-1, 0, 0.5, 1])
    .range(["white","#deebf7","#9ecae1","#3182bd"]);

	var svg = d3.select("svg");
	
	var translate = "translate(" + (width*0.025) + "," + (height * 0.85) + ")";
	
	svg.append("g")
	  .attr("class", "legendLinear")
	  .attr("transform", translate);

	var legendLinear = d3.legend.color()
	  .shapeWidth(30)
	  .orient('horizontal')
	  .title(legend)
	  .labels(["No Data"]) // to write the rest add in array
	  .scale(color);

	svg.select(".legendLinear")
	  .call(legendLinear);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .attr("stroke-width", 0)
      .style("fill", function(d, i) { return color( gMapData[d.properties.name]?((indexProp? gMapData[d.properties.name][index][indexProp] : gMapData[d.properties.name][index] ) / max):-1 ); });

	  
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
