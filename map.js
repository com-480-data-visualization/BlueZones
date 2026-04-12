const mapSvg = d3.select("#map-plot");

const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1]); 

const projection = d3.geoMercator()
    .scale(130)
    .translate([500, 280]); 

const pathGenerator = d3.geoPath().projection(projection);

d3.json("data/world_countries_geojson.geojson").then(geoData => {
    mapSvg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator)
        .attr("fill", () => colorScale(Math.random())) 
        .attr("stroke", "#0f172a") 
        .attr("stroke-width", 0.5)
        .style("transition", "filter 0.2s ease, stroke-width 0.2s ease")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("filter", "brightness(1.3)")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1.2);

            const countryName = d.properties.name || d.properties.NAME;
            
            const tooltip = d3.select("#radar-tooltip");
            tooltip.style("display", "block").html(""); 
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY + 15) + "px");

            // Simulated Data
            const radarData = [
                {axis: "Plant-based diet", value: Math.random()},
                {axis: "80% rule", value: Math.random()},
                {axis: "Activity", value: Math.random()},
                {axis: "Happiness", value: Math.random()},
                {axis: "Wine consumption", value: Math.random()}
            ];

            drawRadar(radarData, countryName, "#radar-tooltip");
        })
        .on("mousemove", (event) => {
            d3.select("#radar-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("filter", "none")
                .attr("stroke", "#0f172a")
                .attr("stroke-width", 0.5);
            
            d3.select("#radar-tooltip").style("display", "none");
        });
        
}).catch(err => console.error("Error: ", err));