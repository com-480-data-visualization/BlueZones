const mapSvg = d3.select("#map-plot");

function smartPositionTooltip(node, clientX, clientY) {
    const offset = 15;
    const rect = node.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = clientX + offset;
    let top  = clientY + offset;

    if (left + rect.width  > vw - 10) left = clientX - rect.width  - offset;
    if (top  + rect.height > vh - 10) top  = clientY - rect.height - offset;

    left = Math.max(10, left);
    top  = Math.max(10, top);

    return { left, top };
}

const projection = d3.geoMercator()
    .scale(155) 
    .translate([405, 390]); 

const pathGenerator = d3.geoPath().projection(projection);

const scales = {
    "idx":          d3.scaleSequential(d3.interpolateBlues).domain([0, 1]),     // Index Score = Blue
    "happy":        d3.scaleSequential(d3.interpolateRdPu).domain([0, 1]),      // Happiness = Pink
    "activity":     d3.scaleSequential(d3.interpolateOranges).domain([0, 1]),   // Activity = Orange
    "wine":         d3.scaleSequential(d3.interpolateReds).domain([0, 1]),      // Wine = Red
    "plant-based":  d3.scaleSequential(d3.interpolateGreens).domain([0, 1]),    // Plant Slant = Green
    "rule80":       d3.scaleSequential(d3.interpolatePurples).domain([0, 1])    // 80% Rule = Purple
};

const themeMapping = {
    "idx": "blue_zone_index",
    "happy": "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine": "Wine Consumption",
    "plant-based": "plant_based_ratio",
    "rule80": "rule80_score"
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

        const filteredFeatures = countries_paths.features.filter(d => {
            const name = d.properties?.name || d.properties?.NAME || "";
            return d.id !== "010" && d.id !== 10 && name.toLowerCase() !== "antarctica";
        });

        mapSvg.selectAll("path")
            .data(filteredFeatures)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathGenerator)
            .attr("fill", (c) => {
                const data = getCountryData(c.properties.name || c.properties.NAME);
                const val = data ? (data["blue_zone_index"] ?? null) : null;
                return val !== null ? scales["idx"](val) : "#1e293b"; 
            })
            .attr("stroke", "rgba(255,255,255,0.15)")
            .attr("stroke-width", 0.5)
            .style("transition", "fill 0.4s ease, filter 0.2s ease, stroke-width 0.2s ease")
            .on("mouseover", function (event, d) {
                const activeTheme = document.querySelector("input[name='bz']:checked").id;
                
                const highlightColor = activeTheme === "plant-based" ? "#34d399" : 
                                       activeTheme === "happy" ? "#f472b6" : 
                                       activeTheme === "wine" ? "#f87171" : "#2dd4bf";

                d3.select(this)
                    .style("filter", "brightness(1.25)")
                    .attr("stroke", highlightColor)
                    .attr("stroke-width", 1.2);

                const countryName = d.properties.name || d.properties.NAME;
                const tooltip     = d3.select("#radar-tooltip");
                const countryData = getCountryData(countryName);

                tooltip.style("display", "block").html("");

                if (activeTheme === "idx" && typeof drawRadar === 'function') {
                    tooltip.style("width", "auto").style("padding", "10px");
                    const radarData = [
                        { axis: "Plant-based", value: countryData ? (countryData["plant_based_ratio"] ?? 0) : 0 },
                        { axis: "80% rule",    value: countryData ? (countryData["rule80_score"] ?? 0) : 0 },
                        { axis: "Activity",    value: countryData ? (countryData["steps_mean_filtered"] ?? 0) : 0 },
                        { axis: "Happiness",   value: countryData ? (countryData["Life evaluation"] ?? 0) : 0 },
                        { axis: "Wine %",      value: countryData ? (countryData["Wine Consumption"] ?? 0) : 0 }
                    ];
                    drawRadar(radarData, countryName, "#radar-tooltip");
                } else {
                    tooltip.style("width", "max-content").style("padding", "12px 16px");
                    const score = countryData ? (countryData[themeMapping[activeTheme]] ?? 0) : 0;
                    const themeLabel = document.querySelector("input[name='bz']:checked").nextElementSibling.innerText;
                    tooltip.html(`
                        <div style="font-weight: 700; font-size: 15px; color: #ffffff; margin-bottom: 4px;">${countryName}</div>
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Theme: ${themeLabel}</div>
                        <div style="font-size: 14px; color: ${highlightColor}; font-weight: 600;">Score: ${score.toFixed(2)}</div>
                    `);
                }

                const { left: tleft, top: ttop } = smartPositionTooltip(tooltip.node(), event.clientX, event.clientY);
                tooltip.style("left", tleft + "px").style("top", ttop + "px");
            })
            .on("mousemove", (event) => {
                const tt = d3.select("#radar-tooltip");
                const { left, top } = smartPositionTooltip(tt.node(), event.clientX, event.clientY);
                tt.style("left", left + "px").style("top", top + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("filter", "none")
                    .attr("stroke", "rgba(255,255,255,0.15)")
                    .attr("stroke-width", 0.5);

                d3.select("#radar-tooltip").style("display", "none");
            })
            .on("click", function (event, d) {
                const countryName = d.properties.name || d.properties.NAME;
                if (typeof window.highlightCountryOnScatter === "function") {
                    window.highlightCountryOnScatter(countryName);
                }
            });

        function updateMapColors(themeId) {
            const currentScale = scales[themeId] || scales["idx"];
            
            d3.selectAll(".country")
                .transition()
                .duration(750)
                .attr("fill", (c) => {
                    const data = getCountryData(c.properties.name || c.properties.NAME);
                    const val = data ? (data[themeMapping[themeId]] ?? null) : null;
                    return val !== null ? currentScale(val) : "#1e293b";
                });
        }

        const yearSlider  = document.getElementById("year-slider");
        const yearDisplay = document.getElementById("year-display");
        const minLabel    = document.getElementById("slider-min-label");
        const maxLabel    = document.getElementById("slider-max-label");

        yearSlider.addEventListener("input", function () {
            mapCurrentYear = this.value;
            yearDisplay.textContent = this.value;
            activeMapData = yearlyMapData[mapCurrentYear] || {};
            const activeTheme = document.querySelector("input[name='bz']:checked").id;
            updateMapColors(activeTheme);
            document.dispatchEvent(new CustomEvent("yearChange", { detail: { year: this.value } }));
        });

        d3.selectAll("input[name='bz']").on("change", function (event) {
            const activeTheme = event.target.id;
            if (activeTheme == "activity"){
                yearSlider.value = "2023"; minLabel.textContent = "2023"; maxLabel.textContent = "2023";
                yearSlider.disabled = true; yearSlider.style.cursor = "not-allowed"; yearSlider.style.opacity = "0.5";       
            } else if (activeTheme == "happy"){
                yearSlider.min = "2011"; maxLabel.textContent = "2024"; minLabel.textContent = "2011";
                if (yearSlider.value < "2011") yearSlider.value = "2011";
                yearSlider.disabled = false; yearSlider.style.cursor = "pointer"; yearSlider.style.opacity = "1";
            } else {
                maxLabel.textContent = "2024"; minLabel.textContent = "1965"; yearSlider.min = "1965";
                yearSlider.disabled = false; yearSlider.style.cursor = "pointer"; yearSlider.style.opacity = "1";
            }
            mapCurrentYear = yearSlider.value;
            yearDisplay.textContent = mapCurrentYear;
            activeMapData = yearlyMapData[mapCurrentYear] || {};
            updateMapColors(activeTheme);
        });

    });
}).catch(err => console.error("Error Processing D3 World Map:", err));