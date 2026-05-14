// Code inspired from https://d3-graph-gallery.com/graph/scatter_basic.html and https://d3-graph-gallery.com/graph/custom_theme.html

const blueZonesCountries = ["Japan", "Greece", "Italy", "Costa Rica", "United States of America"];

const drawer    = document.getElementById('scatter-panel');
const toggleBtn = document.getElementById('drawer-toggle');
const mapCard   = document.querySelector('.map-card');

toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    mapCard.classList.toggle('is-shrunk');
    toggleBtn.innerText = isOpen ? "▶" : "◀";
});

const margin             = {top: 40, right: 60, bottom: 70, left: 70};
const widthScatterPlot   = 400 - margin.left - margin.right;
const heightScatterPlot  = 400 - margin.top  - margin.bottom;

var svgScatterPlot = d3.select("#scatter-plot")
    .attr("width",  widthScatterPlot  + margin.left + margin.right)
    .attr("height", heightScatterPlot + margin.top  + margin.bottom)
    .append("g")
    .style("fill", "white")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// X axis — Life Expectancy (raw years, fixed domain)
var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, widthScatterPlot]);

svgScatterPlot.append("g")
    .attr("transform", "translate(0," + heightScatterPlot + ")")
    .call(d3.axisBottom(x));

// Y axis — dynamic
var y = d3.scaleLinear()
    .domain([0, 1])
    .range([heightScatterPlot, 0]);

svgScatterPlot.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("x", widthScatterPlot / 2)
    .attr("y", heightScatterPlot + margin.top + 50)
    .attr("fill", "white")
    .attr("font-size", "16px")
    .text("Life Expectancy");

var yAxis = svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -heightScatterPlot / 2)
    .attr("fill", "white")
    .attr("font-size", "16px")
    .text("Blue Zone Index");

const scatterToolTip = d3.select("#scatter-tooltip");

const radioYAxisMapping = {
    "idx":      "Blue Zone Index",
    "happy":    "Happiness",
    "activity": "Activity",
    "wine":     "Wine Consumption",
    "plant-based": "plant_based_ratio",
    "rule80":"rule80_score"
};

const radioMappingData = {
    "idx":      "blue_zone_index",
    "happy":    "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine":     "Wine Consumption",
    "plant-based": "plant_based_ratio",
    "rule80":"rule80_score"
};

let currentButtonId    = "idx";
let selectedCountry    = null;
let allYearScatterData = {};
let scatterCurrentYear = "2023";

function getCurrentScatterData() {
    return allYearScatterData[scatterCurrentYear] || [];
}

function refreshDotColors() {
    d3.selectAll(".data-point")
        .style("fill", function (d) {
            if (d["country"] === selectedCountry) return "#ff6b35";
            if (blueZonesCountries.includes(d["country"])) return "#339dff";
            return "#ffffff";
        })
        .attr("stroke", function (d) {
            return (d["country"] === selectedCountry) ? "#ff6b35" : "#339dff";
        })
        .attr("stroke-width", function (d) {
            return (d["country"] === selectedCountry) ? 2 : 0.5;
        })
        .attr("r", function (d) {
            return (d["country"] === selectedCountry) ? 8 : 5;
        });

    d3.selectAll(".selected-country-label").remove();
    if (selectedCountry){
        const selectedDot= d3.selectAll(".data-point")
            .filter(d => d["country"] === selectedCountry)
            .node();
        if (selectedDot){
            const cx = parseFloat(d3.select(selectedDot).attr("cx"));
            const cy = parseFloat(d3.select(selectedDot).attr("cy"));

            d3.select(selectedDot.parentNode)
                .append("text")
                .attr("class", "selected-country-label") 
                .attr("x", cx)
                .attr("y", cy - 15) 
                .attr("text-anchor", "middle") 
                .attr("fill", "#ff6b35") 
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .style("pointer-events", "none") 
                .text(selectedCountry);
        }
    }
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
        .transition().duration(500)
        .call(d3.axisLeft(y));
}

function updateScatterForYear(year) {
    scatterCurrentYear = year;
    const data       = getCurrentScatterData();
    const dataKey    = radioMappingData[currentButtonId];

    updateYDomain(data, dataKey);

    svgScatterPlot.selectAll(".data-point")
        .data(data, d => d["country"])
        .transition()
        .duration(500)
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
        .attr("r", 5)
        .attr("stroke", "#339dff")
        .attr("stroke-width", 0.5)
        .style("fill", d => blueZonesCountries.includes(d["country"]) ? "#339dff" : "#ffffff")
        .on("mouseover", function (event, d) {
            d3.select(this).transition().duration(100).attr("r", 10);
            scatterToolTip
                .style("display", "block")
                .style("position", "fixed")
                .style("left", (event.clientX + 15) + "px")
                .style("top",  (event.clientY + 15) + "px")
                .html(`
                    <strong>${d["country"]}</strong><br/>
                    Life Expectancy: ${(d["Life expectancy"] ?? 0).toFixed(2)}<br/>
                    ${radioYAxisMapping[currentButtonId]}: ${(d[radioMappingData[currentButtonId]] ?? 0).toFixed(2)}
                `);
        })
        .on("mousemove", (event) => {
            scatterToolTip
                .style("left", (event.clientX + 15) + "px")
                .style("top",  (event.clientY + 15) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).transition().duration(100)
                .attr("r", d["country"] === selectedCountry ? 8 : 5);
            scatterToolTip.style("display", "none");
        });

    // Radio button changes
    d3.selectAll("input[name='bz']").on("change.scatter-plot", function (event) {
        currentButtonId  = event.target.id;
        const data       = getCurrentScatterData();
        const dataKey    = radioMappingData[currentButtonId];

        yAxis.text(radioYAxisMapping[currentButtonId]);
        updateYDomain(data, dataKey);

        d3.selectAll(".data-point")
            .transition().duration(750)
            .attr("cx", d => x(d["Life expectancy"] ?? 0))
            .attr("cy", d => y(d[dataKey] ?? 0))
            .attr("r", 5);

        refreshDotColors();
    });

    // Year slider changes (dispatched by map.js)
    document.addEventListener("yearChange", function (e) {
        updateScatterForYear(e.detail.year);
    });
});
