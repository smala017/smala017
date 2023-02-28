var i = 0;

// NOTE: THE FLIGHTS CSV CANNOT BE INCLUDED BECAUSE IT EXCEEDS GITHUB'S FILE SIZE LIMIT
// IT IS FOUND IN THE VizTech1 FOLDERR
airportHeaders = "IATA_CODE,AIRPORT,CITY,STATE,COUNTRY,LATITUDE,LONGITUDE"
csvStr = airportHeaders + "\n"
/* 
Min and max lons and lats of airports in the dataset.
minLat = 13.48345
maxLat = 71.28545
minLon = -176.64603
maxLat = -64.79856 */

//min and max coordinates to use as boundaries of the svg canvas. 
minLat = 13.48345
maxLat = 71.28545
minLon = -176.64603
maxLon = -64.79856

var svg = d3.select("#canvas")

function scaleCoords(lat, lon) {
    w = svg.style("width")
    h = svg.style("height")
    console.log(h)
    console.log(w)
}

scaleCoords(41, 32)


d3.csv("../../FlightData/airports.csv").then(function(data) {
    data.forEach(function(row) {
        csvStr += row["IATA_CODE"] + "," + row["AIRPORT"] + "," + row["CITY"] + "," + row["STATE"] + "," + row["COUNTRY"] + "," + row["LATITUDE"] + "," + row["LONGITUDE"] +"\n"
    })
    array = d3.csvParse(csvStr)
    console.log(array)
    console.log("minLat: " + minLat)
    console.log("maxLat: " + maxLat)
    console.log("minLon: " + minLon)
    console.log("maxLon: " + maxLon)


    // draw circles on each airport by long and lat

    var circles = svg.selectAll("circle")
        .data(array)

    //Enter  
    circles.enter().append("circle")
    .attr("fill", "red")
    .attr("cx", function(d) {return d.LONGITUDE})
    .attr("cy", function(d) {return d.LATITUDE})
    .attr("r", 10)


})





