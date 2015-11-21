console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .center([-71.088066,42.315520])
    .translate([width/2, height/2])
    .scale(200000)
//.center([lng,lat])
//.translate([x,y])
//.scale()
//...

var path = d3.geo.path().projection(projection);

//TODO: create a color scale
var scaleR = d3.scale.sqrt().domain([500000,30000000]).range([5,180]),
    colorScale = d3.scale.linear().domain([0,100000]).range(['black','pink']);

//TODO: create a d3.map() to store the value of median HH income per block group
var IncomeByGroup = d3.map()

//TODO: import data, parse, and draw
queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err, geoids, neighbors){
        //console.log(IncomeByGroup); so far so good


        draw(geoids, neighbors);
    })

function draw(geoids, neighbors) {

    var mapA = map.append('g')
        .selectAll('.block-group')
        .data(geoids.features)
        .enter()
        .append('g')
        .attr('class', 'block-group')


    mapA.append('path')
        .attr('d', path)
        .style('fill', function (d) {
            //console.log(d)
            var geoId = d.properties.geoid;
            var Income = IncomeByGroup.get(geoId).income

            if( IncomeByGroup.get(geoId) == undefined ){
                return 'none';
            };
            //console.log(geoid) //also fine here
            //console.log(geoId)// fine here
            //console.log(Income)

            return colorScale(Income)})
        .call(getTooltips)

    var mapB= map.append('g')
        .selectAll('.neighbor')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class','neighbor')
    mapB
        .append('path')
        .attr('d', path)
        .style('fill','none')
        .style('stroke','white')
    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.Name;})
        .attr('dx',function(d){return path.centroid(d)[0]})
        .attr('dy',function(d){return path.centroid(d)[1]})
        .style('fill','rgb(100,100,100)')
    mapB
        .on('mouseenter',function(d){
            //console.log(this);
            d3.selectAll('text')
                .transition().style('fill','black')
        })
        .on('mouseleave',function(d){
            d3.selectAll('text').style('fill','white')
        })
}


function parseData(d){
    IncomeByGroup.set(d.geoid, {
        income:+d.B19013001,name:d.name})
    //console.log( IncomeByGroup) comes object
}