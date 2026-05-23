const blueZonesCountries = ["Japan", "Greece", "Italy", "Costa Rica", "United States of America"];

const drawer    = document.getElementById('scatter-panel');
const toggleBtn = document.getElementById('drawer-toggle');
const mapCard   = document.querySelector('.map-card');

toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    mapCard.classList.toggle('is-shrunk');
    toggleBtn.innerText = isOpen ? "❯" : "❮";
});

const margin             = {top: 30, right: 30, bottom: 50, left: 55};
const widthScatterPlot   = 420 - margin.left - margin.right;
const heightScatterPlot  = 380 - margin.top  - margin.bottom;

var svgScatterPlot = d3.select("#scatter-plot")
    .attr("viewBox", `0 0 ${widthScatterPlot + margin.left + margin.right} ${heightScatterPlot + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().domain([0, 100]).range([0, widthScatterPlot]);

svgScatterPlot.append("g")
    .attr("transform", "translate(0," + heightScatterPlot + ")")
    .call(d3.axisBottom(x).ticks(5))
    .attr("color", "#64748b");

var y = d3.scaleLinear().domain([0, 1]).range([heightScatterPlot, 0]);
svgScatterPlot.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(5))
    .attr("color", "#64748b");

svgScatterPlot.append("g").attr("class", "grid")
    .attr("transform", "translate(0," + heightScatterPlot + ")")
    .call(d3.axisBottom(x).ticks(5).tickSize(-heightScatterPlot).tickFormat("")).attr("color", "rgba(255,255,255,0.04)");
svgScatterPlot.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-widthScatterPlot).tickFormat("")).attr("color", "rgba(255,255,255,0.04)");

svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("x", widthScatterPlot / 2)
    .attr("y", heightScatterPlot + 40)
    .attr("fill", "#94a3b8")
    .attr("font-size", "12px")
    .text("Life Expectancy");

var yAxis = svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -heightScatterPlot / 2)
    .attr("fill", "#94a3b8")
    .attr("font-size", "12px")
    .text("Index Score");

const scatterToolTip = d3.select("#scatter-tooltip");

const radioYAxisMapping = {
    "idx":      "Index Score",
    "happy":    "Happiness",
    "activity": "Activity",
    "wine":     "Wine",
    "plant-based": "Plant-based ratio",
    "rule80":   "80% Rule"
};

const radioMappingData = {
    "idx":      "blue_zone_index",
    "happy":    "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine":     "Wine Consumption",
    "plant-based": "plant_based_ratio",
    "rule80":   "rule80_score"
};

let currentButtonId    = "idx";
let selectedCountry    = null;
let allYearScatterData = {};
let scatterCurrentYear = "2023";

function getCurrentScatterData() {
    return allYearScatterData[scatterCurrentYear] || [];
}

const dotScales = {
    "idx":          d3.interpolateBlues,
    "happy":        d3.interpolateRdPu,
    "activity":     d3.interpolateOranges,
    "wine":         d3.interpolateReds,
    "plant-based":  d3.interpolateGreens,
    "rule80":       d3.interpolatePurples
};

function refreshDotColors() {
    const activeThemeId = document.querySelector("input[name='bz']:checked")?.id || "idx";
    const activeScale   = dotScales[activeThemeId] || d3.interpolateBlues;
    const dataKey       = radioMappingData[activeThemeId];

    const currentData = getCurrentScatterData();
    const maxVal = d3.max(currentData, d => parseFloat(d[dataKey]) || 1) || 1;

    d3.selectAll(".data-point")
        .transition("colorTrans") 
        .duration(400)
        .style("fill", function (d) {
            if (d["country"] === selectedCountry) return "#ffffff"; 
            const rawVal = parseFloat(d[dataKey]) || 0;
            const normalized = maxVal > 0 ? (rawVal / maxVal) : 0;
            return d3.quantize(activeScale, 10)[Math.floor(normalized * 7) + 2] || "#38bdf8";
        })
        .style("opacity", d => (d["country"] === selectedCountry) ? 1 : 0.8)
        .style("stroke", d => (d["country"] === selectedCountry) ? "#2dd4bf" : "rgba(15, 23, 42, 0.5)")
        .style("stroke-width", d => (d["country"] === selectedCountry) ? 2 : 0.5)
        .attr("r", d => (d["country"] === selectedCountry) ? 7 : 4.5);
}

window.highlightCountryOnScatter = function (countryName) {
    selectedCountry = (selectedCountry === countryName) ? null : countryName;
    refreshDotColors();
};

function updateYDomain(data, dataKey) {
    const maxVal = d3.max(data, d => {
        const v = parseFloat(d[dataKey]);
        return isNaN(v) ? 0 : v;
    }) || 1;
    y.domain([0, maxVal]);
    svgScatterPlot.select(".y-axis")
        .transition("axisTrans")
        .duration(500)
        .call(d3.axisLeft(y).ticks(5));
}

function updateScatterForYear(year) {
    scatterCurrentYear = year;
    const data       = getCurrentScatterData();
    const dataKey    = radioMappingData[currentButtonId];

    updateYDomain(data, dataKey);

    svgScatterPlot.selectAll(".data-point")
        .data(data, d => d["country"])
        .transition("positionTrans") 
        .duration(600)
        .attr("cx", d => x(d["Life expectancy"] ?? 0))
        .attr("cy", d => y(d[dataKey] ?? 0));

    refreshDotColors();
}

d3.json("data/blue-zone-index-scatter-plot-by-year.json").then((yearData) => {
    allYearScatterData = yearData;
    const initialData  = getCurrentScatterData();

    svgScatterPlot.append("g")
        .selectAll("dot")
        .data(initialData, d => d["country"])
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", d => x(d["Life expectancy"] ?? 0))
        .attr("cy", d => y(d["blue_zone_index"] ?? 0))
        .attr("r", 4.5)
        .style("fill", "#2dd4bf")
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            const point = d3.select(this);
            const currentColor = point.style("fill");
            point.attr("data-orig-color", currentColor); 

            point.transition().duration(100).attr("r", 8).style("fill", "#fff").style("opacity", 1);
            
            scatterToolTip
                .style("display", "block")
                .style("position", "fixed")
                .style("left", (event.clientX + 15) + "px")
                .style("top",  (event.clientY + 15) + "px")
                .html(`
                    <div style="font-weight: bold; margin-bottom:4px;">${d["country"]}</div>
                    <div style="font-size:12px; color:#cbd5e1;">Life Exp: ${(d["Life expectancy"] ?? 0).toFixed(1)}</div>
                    <div style="font-size:12px; color:#2dd4bf;">${radioYAxisMapping[currentButtonId]}: ${(d[radioMappingData[currentButtonId]] ?? 0).toFixed(2)}</div>
                `);
        })
        .on("mousemove", (event) => {
            scatterToolTip.style("left", (event.clientX + 15) + "px").style("top",  (event.clientY + 15) + "px");
        })
        .on("mouseout", function (event, d) {
            const point = d3.select(this);
            const origColor = point.attr("data-orig-color") || "#2dd4bf";

            point.transition().duration(100)
                .attr("r", d["country"] === selectedCountry ? 7 : 4.5)
                .style("fill", d["country"] === selectedCountry ? "#fff" : origColor) 
                .style("opacity", d["country"] === selectedCountry ? 1 : 0.8);
            
            scatterToolTip.style("display", "none");
        });

    d3.selectAll("input[name='bz']").on("change.scatter-plot", function (event) {
        currentButtonId  = event.target.id;
        const data       = getCurrentScatterData();
        const dataKey    = radioMappingData[currentButtonId];

        yAxis.text(radioYAxisMapping[currentButtonId]);
        updateYDomain(data, dataKey);

        d3.selectAll(".data-point")
            .transition("positionTrans") 
            .duration(750)
            .attr("cx", d => x(d["Life expectancy"] ?? 0))
            .attr("cy", d => y(d[dataKey] ?? 0));

        refreshDotColors();
    });

    document.addEventListener("themeChange", function (e) {
        currentButtonId = e.detail.theme; 
        const data       = getCurrentScatterData();
        const dataKey    = radioMappingData[currentButtonId];

        yAxis.text(radioYAxisMapping[currentButtonId]);
        updateYDomain(data, dataKey);

        d3.selectAll(".data-point")
            .transition("positionTrans") 
            .duration(750)
            .attr("cx", d => x(d["Life expectancy"] ?? 0))
            .attr("cy", d => y(d[dataKey] ?? 0));

        refreshDotColors();
    });

    document.addEventListener("yearChange", function (e) {
        updateScatterForYear(e.detail.year);
    });
});