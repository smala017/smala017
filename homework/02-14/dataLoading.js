var i = 0;

airportHeaders = "IATA_CODE,AIRPORT,CITY,STATE,COUNTRY,LATITUDE,LONGITUDE"
csvStr = airportHeaders + "\n"
d3.csv("../../FlightData/airports.csv").then(function(data) {
    data.forEach(function(row) {
        csvStr += row["IATA_CODE"] + "," + row["AIRPORT"] + "," + row["CITY"] + "," + row["STATE"] + "," + row["COUNTRY"] + "," + row["LATTITUDE"] + "," + row["LONGITUDE"] +"\n"
    })
    array = d3.csvParse(csvStr)
    console.log(array)
    // draw circles on each airport by long and lat

})





var svg = d3.select("#canvas")
var circles = svg.selectAll("circle")

