const mapSvg = d3.select("#map-plot");

const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1]); 

const projection = d3.geoMercator()
    .scale(160)
    .translate([500, 450]); 

const pathGenerator = d3.geoPath().projection(projection);

const themeMapping = {
    "idx": "blue_zone_index",
    "happy": "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine": "Wine Consumption",
    "food": "Pulses"
};

d3.json("data/countries-50m.json").then((topojson_raw) => {

    d3.json("data/blue-zone-index.csv").then((blue_zone_data) => {

        const countries_paths = topojson.feature(topojson_raw, topojson_raw.objects.countries);

        mapSvg.selectAll("path")
            .data(countries_paths.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathGenerator)
            .attr("fill", (c) => {
                //console.log(c.properties);
                if (blue_zone_data[c.properties.name] == null || blue_zone_data[c.properties.name]["blue_zone_index"] == null) {
                    return colorScale(0);
                } else
                    return colorScale(blue_zone_data[c.properties.name]["blue_zone_index"]);
            })
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 0.5)
            .style("transition", "filter 0.2s ease, stroke-width 0.2s ease")
            .on("mouseover", function (event, d) {
                //console.log(d);
                d3.select(this)
                    .style("filter", "brightness(1.3)")
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 0.5);

                const countryName = d.properties.name || d.properties.NAME;
                const tooltip = d3.select("#radar-tooltip");

                const activeTheme = document.querySelector("input[name='bz']:checked").id;

                tooltip.style("display", "block").html("");
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");

                if (activeTheme === "idx") {
                    tooltip.style("width", "auto").style("padding", "10px");
                    
                    //console.log(blue_zone_data[countryName]);
                    const radarData = [
                        { axis: "Plant-based diet", value: (blue_zone_data[countryName] == null) ? 0 : blue_zone_data[countryName]["Pulses"]},
                        { axis: "80% rule", value: 0},
                        { axis: "Activity", value: (blue_zone_data[countryName] == null) ? 0 : blue_zone_data[countryName]["steps_mean_filtered"]},
                        { axis: "Happiness", value: (blue_zone_data[countryName] == null) ? 0 : blue_zone_data[countryName]["Life evaluation"]},
                        { axis: "Wine %", value: (blue_zone_data[countryName] == null) ? 0 : blue_zone_data[countryName]["Wine Consumption"]}
                    ];

                    drawRadar(radarData, countryName, "#radar-tooltip");

                } else {
                    tooltip.style("width", "max-content").style("padding", "10px 15px");
                    //console.log(countryName);
                    const score = (blue_zone_data[countryName] == null) ? 0 : blue_zone_data[countryName][themeMapping[activeTheme]];

                    tooltip.html(`
                    <div style="font-weight: bold; font-size: 16px; color: #ffffff; margin-bottom: 5px;">
                        ${countryName}
                    </div>
                    <div style="font-size: 14px; color: #38bdf8; text-transform: capitalize;">
                        Score: ${score.toFixed(2)}
                    </div>
                `);
                }
            })
            .on("mousemove", (event) => {
                d3.select("#radar-tooltip")
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("filter", "none")
                    .attr("stroke", "#0f172a")
                    .attr("stroke-width", 0.5);

                d3.select("#radar-tooltip").style("display", "none");
            });

        const scales = {
            "idx": d3.scaleSequential(d3.interpolateBlues).domain([0, 1]),
            "happy": d3.scaleSequential(d3.interpolateYlOrBr).domain([0, 1]),
            "activity": d3.scaleSequential(d3.interpolateGreens).domain([0, 1]),
            "wine": d3.scaleSequential(d3.interpolateReds).domain([0, 1]),
            "food": d3.scaleSequential(d3.interpolateOranges).domain([0, 1])
        };

        function updateMapColors(theme) {
            const currentScale = scales[theme];

            d3.selectAll(".country")
                .transition()
                .duration(750)
                .attr("fill", (c) => {
                    //console.log(c);
                    if (blue_zone_data[c.properties.name] == null || blue_zone_data[c.properties.name][themeMapping[theme]] == null) {
                        return currentScale(0);
                    } else
                        return currentScale(blue_zone_data[c.properties.name][themeMapping[theme]]);
            });
        }

        d3.selectAll("input[name='bz']").on("change", function (event) {
            const selectedTheme = event.target.id;
            updateMapColors(selectedTheme);
        });

    });

}).catch(err => console.error("Error GeoJSON :", err));

