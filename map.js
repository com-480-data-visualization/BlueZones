const mapSvg = d3.select("#map-plot");

const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1]);

const projection = d3.geoMercator()
    .scale(115)
    .translate([525, 295]);

const pathGenerator = d3.geoPath().projection(projection);

const themeMapping = {
    "idx": "blue_zone_index",
    "happy": "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine": "Wine Consumption",
    "food": "plant_based_ratio"
};

let activeMapData   = {};
let mapCurrentYear  = "2023";

function getCountryData(name) {
    return activeMapData[name] || null;
}

d3.json("data/countries-50m.json").then((topojson_raw) => {

    d3.json("data/blue-zone-index-by-year.json").then((yearlyMapData) => {

        activeMapData = yearlyMapData[mapCurrentYear] || {};

        const countries_paths = topojson.feature(topojson_raw, topojson_raw.objects.countries);

        mapSvg.selectAll("path")
            .data(countries_paths.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathGenerator)
            .attr("fill", (c) => {
                const data = getCountryData(c.properties.name);
                return colorScale(data ? (data["blue_zone_index"] ?? 0) : 0);
            })
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 0.5)
            .style("transition", "filter 0.2s ease, stroke-width 0.2s ease")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .style("filter", "brightness(1.3)")
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 0.5);

                const countryName = d.properties.name || d.properties.NAME;
                const tooltip     = d3.select("#radar-tooltip");
                const activeTheme = document.querySelector("input[name='bz']:checked").id;
                const countryData       = getCountryData(countryName);

                tooltip.style("display", "block").html("");
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");

                if (activeTheme === "idx") {
                    tooltip.style("width", "auto").style("padding", "10px");

                    const radarData = [
                        { axis: "Plant-based diet", value: countryData ? (countryData["plant_based_ratio"] ?? 0) : 0 },
                        { axis: "80% rule",          value: 0 },
                        { axis: "Activity",          value: countryData ? (countryData["steps_mean_filtered"] ?? 0) : 0 },
                        { axis: "Happiness",         value: countryData ? (countryData["Life evaluation"] ?? 0) : 0 },
                        { axis: "Wine %",            value: countryData ? (countryData["Wine Consumption"] ?? 0) : 0 }
                    ];

                    drawRadar(radarData, countryName, "#radar-tooltip");

                } else {
                    tooltip.style("width", "max-content").style("padding", "10px 15px");
                    const score = countryData ? (countryData[themeMapping[activeTheme]] ?? 0) : 0;
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
                    .style("left", (event.clientX  + 15) + "px")
                    .style("top", (event.clientY + 15) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("filter", "none")
                    .attr("stroke", "#0f172a")
                    .attr("stroke-width", 0.5);

                d3.select("#radar-tooltip").style("display", "none");
            })
            .on("click", function (event, d) {
                const countryName = d.properties.name || d.properties.NAME;
                if (typeof window.highlightCountryOnScatter === "function") {
                    window.highlightCountryOnScatter(countryName);
                }
            });

        const scales = {
            "idx":      d3.scaleSequential(d3.interpolateBlues).domain([0, 1]),
            "happy":    d3.scaleSequential(d3.interpolateRdPu).domain([0, 1]),
            "activity": d3.scaleSequential(d3.interpolateOranges).domain([0, 1]),
            "wine":     d3.scaleSequential(d3.interpolateReds).domain([0, 1]),
            "food":     d3.scaleSequential(d3.interpolateGreens).domain([0, 1])
        };

        function updateMapColors(theme) {
            const currentScale = scales[theme];
            d3.selectAll(".country")
                .transition()
                .duration(750)
                .attr("fill", (c) => {
                    const data = getCountryData(c.properties.name);
                    return currentScale(data ? (data[themeMapping[theme]] ?? 0) : 0);
                });
        }

        // Year slider
        const yearSlider  = document.getElementById("year-slider");
        const yearDisplay = document.getElementById("year-display");
        const minLabel = document.getElementById("slider-min-label");
        const maxLabel = document.getElementById("slider-max-label");

        yearSlider.addEventListener("input", function () {
            mapCurrentYear   = this.value;
            yearDisplay.textContent = this.value;
            activeMapData    = yearlyMapData[mapCurrentYear] || {};

            const activeTheme = document.querySelector("input[name='bz']:checked").id;
            updateMapColors(activeTheme);
            

            document.dispatchEvent(new CustomEvent("yearChange", { detail: { year: this.value } }));
        });

        // Radio buttons
        d3.selectAll("input[name='bz']").on("change", function (event) {
            const activeTheme = event.target.id
            if (activeTheme == "activity"){
                yearSlider.value ="2023";
                minLabel.textContent = "2023"
                maxLabel.textContent = "2023"
                yearSlider.disabled =true;
                yearSlider.style.cursor = "not-allowed"; 
                yearSlider.style.opacity = "0.5";       
            }
            else if (activeTheme=="happy"){
                yearSlider.min = "2011"
                maxLabel.textContent ="2024"

                minLabel.textContent = "2011"
                if (yearSlider.value < "2011"){
                    yearSlider.value = "2011"
                }
                yearSlider.disabled = false;
                yearSlider.style.cursor = "pointer";
                yearSlider.style.opacity = "1";
            }
            else{
                maxLabel.textContent ="2024"
                minLabel.textContent = "1965"
                yearSlider.min = "1965";
                yearSlider.disabled = false;
                yearSlider.style.cursor = "pointer";
                yearSlider.style.opacity = "1";
            }
            mapCurrentYear = yearSlider.value;
            yearDisplay.textContent = mapCurrentYear;
            activeMapData = yearlyMapData[mapCurrentYear] || {};
            updateMapColors(event.target.id);
            
        });

    });

}).catch(err => console.error("Error GeoJSON :", err));
