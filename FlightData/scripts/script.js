// 1. Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.


// Try to use these two variables for `width` and `height` instead and
// notice what happens to the size of the map visualization. Can you tell why?

// const width = document.querySelector("#viz").clientWidth;
// const height = document.querySelector("#viz").clientHeight;

// 2. We initialize variables for the svg container that holds all
// of our visualization elements. And we also initialize a variable
// to store just the element that holds our map; this element is a group
// that in HTML tags is given by "g". See the index.html for more information.

const svg = d3.select("#canvas")

const width = svg.style("width");
const height = svg.style("height");

const map = svg.select("#map");

d3.json("data/usa.json").then(function(usa) {

  /** 
   * 5.
   * This function converts the loaded TopoJSON object to GeoJSON
   * It creates an array of JavaScript objects where each object stores:
   * (a) Geometry (e.g., polygons) defined by a list of coordinates.
   * (b) ID, which in this case is the ISO code of a country
   * (c) Properties, in this case `name` and `iso`. e.g., name: "Argentina", iso: "ARG"
  */

  var geoJSON = topojson.feature(usa, usa.objects.states);

  
  
  // 6.
  // We are removing the JavaScript object that stores the features
  // of Antarctica because we will hide Alask and Hawaii and PR from the map we are making. 

  geoJSON.features = geoJSON.features.filter(function(d) {

      return (d.id !== 'AK') && (d.id !== 'HI') && (d.id !== 'PR');
      
  });

  

  /**
   * 7. Map Projections
   * 
   * Just like we set up a linear scale for mapping data values to pixel positions
   * in a bar chart or scatter plot (e.g., with linearScale), we need to create a
   * function that maps raw coordinate values given in the geoJSON file into screen
   * pixels. There is no one way of using projections for creating maps. In general,
   * the visible size of a countries boundary shape depends on the projection used
   * to make it visible. See this: https://www.thetruesize.com
   * 
   * In the following we will set up a "flat" map projection otherwise known as
   * spherical Mercator projection (an equirectangular projection).
   * 
   * For more information on projections that d3 implements, see:
   * https://github.com/d3/d3-geo#azimuthal-projections
  */

  var proj = d3.geoMercator().fitSize([width, height], geoJSON);

  /**
   * 8. Geographical Path Constructor
   * 
   * 
   */

  var path = d3.geoPath().projection(proj);
  console.log(geoJSON)
  console.log(proj)
  console.log(path)

  map.selectAll("path")
      .data(geoJSON.features)
      .enter().append("path")
      // we use the "d" attribute in SVG graphics to define a path to be drawn
      // "d" is a presentation attribute, so can also be used as a CSS property
      .attr("d", path)
      //.attr("d", function(d){return d.path}) // this ran with no error but did not draw anything
      .attr("fill", "#000000")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke", "#FC766AFF")
      .attr("stroke-width", "0.1px");
    
    /**
     * 9. Plotting on the Geographical Map
     * 
     * Plot two circles on the geographical map to denote the location 
     * of particular cities. The location of a city is given by the 
     * coordinates for latitude and longitude. Once you get the
     * coordinates, you use the projection function defined previously,
     * e.g., the Mercator projection, and you pass in those coordinates
     * in the function to project them onto the map as pixel positions.
     */

    // NOTE: The coordinates for a city are given as: [longitude, latitude]
    //       because that is how the projection function wants them.

    d3.csv("data/airports.csv").then(function(data){
      let airports = data;
      console.log(airports)

      map.selectAll("circle")
        .data(airports)
        .enter().append("circle")
        .attr("r", function(d) {return 4}) //TODO: Make this be the number of flights to and from the airport. I need a new column in the CSV.
        .attr("fill", "#FF0000")
        .attr("transform", function(d) {
            return "translate(" + proj([+d.LONGITUDE, +d.LATITUDE]) + ")";
        });
    })

    

    

});