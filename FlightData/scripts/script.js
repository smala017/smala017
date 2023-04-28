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


const mapPaddingX = 0, mapPaddingY = 0
const svgwidth = window.innerWidth *.6, svgheight = window.innerHeight*.7;
const circleSizeMult = svgwidth / 300

const barTransTime = 500;

const svg = d3.select("#viz")
.attr("width", svgwidth)
.attr("height", svgheight);


selected = []






const map = svg.select("#map");


// 4. Here start building the geographical map by first loading a TopoJSON file.

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
    // of Antarctica because we will hide Antarctica from the map we are making. 

    geoJSON.features = geoJSON.features.filter(function(d) {

        return (d.id != "AK") & (d.id != "HI") & (d.id != "PR");
        
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



    const proj = d3.geoMercator()        
      .fitSize([svgwidth-mapPaddingX, svgheight-mapPaddingY], geoJSON)
      //.translate([svgwidth/2, svgheight/2])
      //.scale(500);

    /**
     * 8. Geographical Path Constructor
     * 
     * 
     */

    let path = d3.geoPath().projection(proj);

    map.selectAll("path")
        .data(geoJSON.features)
        .enter().append("path")
        // we use the "d" attribute in SVG graphics to define a path to be drawn
        // "d" is a presentation attribute, so can also be used as a CSS property
        .attr("d", path)
        .attr("fill", "#FCEDDA")
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



    // 10. The following is a D3 join pattern for adding SVG circle shapes. 
    //
    // Here, notice how we transform the circles using
    // the projection function we defined previously. Essentially, the
    // projection is just a function that requires an input argument, 
    // namely the coordinates of a point.

    // We define a variable for the radius of the circles that represent our cities.
    // We will use this variable in two different places below.


    function circleSize(d) {
      flights = d["TOTAL_FLIGHTS"]
      return Math.sqrt(flights / 10000) * circleSizeMult
    }

    d3.csv("data/airports.csv").then(function(data){
      //SEE 3/21 classwork tooltip demo for an example of how to do this outside of the curly brackets
      let airports = data.filter(function(d) {
          return (d["STATE"] != "AK") & (d["STATE"] != "HI") & (d["STATE"] != "PR") & (d["STATE"] != "VI")
      });

      map.selectAll("circle")
        .data(airports)
        .enter().append("circle")
        .attr("r", function(d) {return circleSize(d)}) //TODO: Make this be the number of flights to and from the airport. I need a new column in the CSV.
        .attr("fill", "orange")
        .attr("stroke", "#000000")
        .attr("stroke-width", .2)
        .attr("opacity", .5)
        .attr("id", function(d) {return d.IATA_CODE})
        .attr("transform", function(d) {
            return "translate(" + proj([+d.LONGITUDE, +d.LATITUDE]) + ")";
        });

      const brush = d3.brush()
        .extent([[0, 0], [svgwidth, svgheight]])
        .on("start", brushed)
        .on("brush", brushed)
        .on("end", brushed);


      function brushed(event) {
        const brushedCoords = event.selection;
        if (brushedCoords) {
          const brushedData = airports.map(
            d => {
              return {
                ...d,
                selected: isBrushed(brushedCoords, d)
              };
            });

          svg.selectAll("circle")
            .data(brushedData)
            .join(
                function(enter) {

                },
                function(update) {
                  return update
                    .attr("fill", d => d.selected ? "blue" : "orange")
                },
                function(exit) {

                }
            );
        }
        updateCharts();
      }

      function isBrushed(brushedCoords, d) {
        const [[x0, y0], [x1, y1]] = brushedCoords;
        const [xs, ys] = proj([+d.LONGITUDE, +d.LATITUDE])

        brushedBool = x0 <= xs && xs < x1 && y0 <= ys && ys < y1;

        // This is how I am keeping track of which airports are selected 
        iata = d.IATA_CODE
        if (brushedBool & (!selected.includes(iata))) {
            selected.push(iata)
        }
        if ((!brushedBool) & selected.includes(iata)) {
          selected.splice(selected.indexOf(iata), 1)
        }

        return brushedBool;
      }

      svg.append("g")
        .attr("class", "d3-brush")
        .call(brush);



      // bar graphs

      const margin = {
        top: 10, 
        left: 35, 
        right: 5 , 
        bottom: 25
      };
      
      chart1svg = d3.select("#chart1")
      chart2svg = d3.select("#chart2")
      chart3svg = d3.select("#chart3")
    


    chartWidth = document.getElementById("chart1").getBoundingClientRect().width
    chartHeight = document.getElementById("chart1").getBoundingClientRect().height

    



    updateCharts = function() {

      filteredAirports = airports.filter(function(a) {
        return selected.includes(a["IATA_CODE"])
      })

      unitedCount = filteredAirports.reduce((acc, currentValue) => {
        return acc + +currentValue.UNITED_FLIGHTS;
      }, 0);
      deltaCount = filteredAirports.reduce((acc, currentValue) => {
        return acc + +currentValue.DELTA_FLIGHTS;
      }, 0);
      americanCount = filteredAirports.reduce((acc, currentValue) => {
        return acc + +currentValue.AMERICAN_FLIGHTS;
      }, 0);
      otherCount = filteredAirports.reduce((acc, currentValue) => {
        return acc + +currentValue.OTHER_FLIGHTS;
      }, 0);

      function getColumnAverage(column) {
        var sum = 0;
        var flightscount= 0;
        for (var i = 0; i < filteredAirports.length; i++) {
          sum += +filteredAirports[i][column];
        }

        return sum / filteredAirports.length;
      }

      totalCount  = unitedCount + deltaCount + americanCount + otherCount

      countsData = [
        { label: "UA", val:  unitedCount / totalCount},
        { label: "Delta", val: deltaCount / totalCount},
        { label: "AA", val: americanCount / totalCount},
        { label: "Other", val: otherCount / totalCount}
      ];

      inDelayData = [
        { label: "UA", val:  getColumnAverage("UNITED_IN_DELAY")},
        { label: "Delta", val: getColumnAverage("DELTA_IN_DELAY")},
        { label: "AA", val: getColumnAverage("AMERICAN_IN_DELAY")},
        { label: "Other", val: getColumnAverage("OTHER_IN_DELAY")}
      ];

      outDelayData = [
        { label: "UA", val:  getColumnAverage("UNITED_OUT_DELAY")},
        { label: "Delta", val: getColumnAverage("DELTA_OUT_DELAY")},
        { label: "AA", val: getColumnAverage("AMERICAN_OUT_DELAY")},
        { label: "Other", val: getColumnAverage("OTHER_OUT_DELAY")}
      ];

      // overriding the data if selected is empty
      zeroData = [
        { label: "UA", val:  0},
        { label: "Delta", val: 0},
        { label: "AA", val: 0},
        { label: "Other", val: 0}
      ];
      if (selected.length == 0) {
        countsData = zeroData
        inDelayData = zeroData
        outDelayData = zeroData
      }

      // bind data to bars
      const chart1bars = d3.select("#chart1")
        .selectAll(".bar")
        .data(countsData);
      const chart2bars = d3.select("#chart2")
        .selectAll(".bar")
        .data(inDelayData);
      const chart3bars = d3.select("#chart3")
        .selectAll(".bar")
        .data(outDelayData);

      bars = d3.selectAll(".bar")
      
      // exit bars
      chart1bars.exit().remove();
      chart2bars.exit().remove();
      chart3bars.exit().remove();
      
      // update bars
      chart1bars.attr("x", d => xScale(d.label))
        .transition()
        .duration(barTransTime)
        .attr("y", d => yScale(d.val))
        .attr("height", d => chartHeight-margin.bottom - yScale(d.val))
        .attr("fill", "royalblue");
      chart2bars.attr("x", d => xScale(d.label))
        .transition()
        .duration(barTransTime)
        .attr("y", d => yScale2(Math.max(d.val,0)))
        .attr("height", d => Math.abs(yScale2(d.val) - yScale2(0)))
        .attr("fill", function(d) {
          return (d.val >= 0) ? "red" : "green"
        });
      chart3bars.attr("x", d => xScale(d.label))
        .transition()
        .duration(barTransTime)
        .attr("y", d => yScale2(Math.max(d.val,0)))
        .attr("height", d => Math.abs(yScale2(d.val) - yScale2(0)))
        .attr("fill", function(d) {
          return (d.val >= 0) ? "red" : "green"
        });

      // enter bars
      chart1bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.val))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight-margin.bottom - yScale(d.val))
        .attr("fill", "royalblue");
      chart2bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale2(Math.max(d.val,0)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale2(d.val) - yScale2(0)))
        .attr("fill", function(d) {
          return (d.val >= 0) ? "red" : "green"
        });
      chart3bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale2(Math.max(d.val,0)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale2(d.val) - yScale2(0)))
        .attr("fill", function(d) {
          return (d.val >= 0) ? "red" : "green"
        });

    }

    const xScale = d3.scaleBand()
        .domain(["UA", "Delta", "AA", "Other"])
        .range([margin.left, chartWidth - margin.right])
        .padding(.3);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([chartHeight - margin.bottom, margin.top]);

    const yScale2 = d3.scaleLinear()
      .domain([-4, 10])
      .range([chartHeight - margin.bottom, margin.top]);

    const chart1xAxis = chart1svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${chartHeight-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const chart1yAxis = chart1svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale).tickFormat(d3.format(".0%")));

    const chart2xAxis = chart2svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${chartHeight-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    //0 line for the second chart
    const chart2zeroAxis = chart2svg.append("line")
      .attr("x1", xScale("UA") - .5*xScale.bandwidth())
      .attr("y1", yScale2(0))
      .attr("x2", xScale("Other") + 1.5*xScale.bandwidth())
      .attr("y2", yScale2(0))
      .attr("stroke", "black")

    const chart2yAxis = chart2svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale2));

    const chart3xAxis = chart3svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${chartHeight-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    //0 line for the second chart
    const chart3zeroAxis = chart3svg.append("line")
      .attr("x1", xScale("UA") - .5*xScale.bandwidth())
      .attr("y1", yScale2(0))
      .attr("x2", xScale("Other") + 1.5*xScale.bandwidth())
      .attr("y2", yScale2(0))
      .attr("stroke", "black")

    const chart3yAxis = chart3svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale2));

    })

});