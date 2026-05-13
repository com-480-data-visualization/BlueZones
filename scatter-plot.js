// Code inspired from https://d3-graph-gallery.com/graph/scatter_basic.html and https://d3-graph-gallery.com/graph/custom_theme.html

const blueZonesCountries = ["Japan", "Greece", "Italy", "Costa Rica", "United States of America"];

const drawer = document.getElementById('scatter-panel');
const toggleBtn = document.getElementById('drawer-toggle');
const mapCard = document.querySelector('.map-card'); 


toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    mapCard.classList.toggle('is-shrunk');
    
    toggleBtn.innerText = isOpen ? "▶" : "◀";
});

const margin = {top: 40, right: 60, bottom: 70, left: 70};
const widthScatterPlot = 400 - margin.left - margin.right;
const heightScatterPlot = 400 - margin.top - margin.bottom;

var svgScatterPlot = d3.select("#scatter-plot")
    .attr("width", widthScatterPlot + margin.left + margin.right)
    .attr("height", heightScatterPlot + margin.top + margin.bottom)
    .append("g")
    .style("fill", "white")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dataScatterPlot = [{ x: 50, y: 50, country: "Canada" }, { x: 70, y: 70, country: "Italy" }];

// Add X axis
var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, widthScatterPlot]);

svgScatterPlot.append("g")
    .attr("transform", "translate(0," + heightScatterPlot + ")")
    .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 1])
    .range([heightScatterPlot, 0]);

svgScatterPlot.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// Add X axis label:
svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("x", widthScatterPlot / 2)
    .attr("y", heightScatterPlot + margin.top + 50)
    .attr("fill", "white")
    .attr("font-size", "16px")
    .text("Life Expectancy");

// Y axis label:
var yAxis = svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", - heightScatterPlot / 2)
    .attr("fill", "white")
    .attr("font-size", "16px")
    .text("Blue Zone Index");

const scatterToolTip = d3.select("#scatter-tooltip");
const radioYAxisMapping = {
    "idx":      "Blue Zone Index",
    "happy":    "Happiness",
    "activity": "Activity",
    "wine":     "Wine Consumption",
    "food":     "Food"
};
 
const radioMappingData = {
    "idx":      "blue_zone_index",
    "happy":    "Life evaluation",
    "activity": "steps_mean_filtered",
    "wine":     "Wine Consumption",
    "food":     "Pulses"
};
 
let currentButtonId  = "idx";
let selectedCountry  = null; 



function refreshDotColors() {
        d3.selectAll(".data-point")
            .style("fill", function(d) {
                const country = d["country"];
                const isSelected = (country === selectedCountry);
                const isBZ       = blueZonesCountries.includes(country);
 
                if (isSelected)  return "#ff6b35";          // highlighted orange
                if (isBZ)        return "#339dff";           // blue zone blue
                return "#ffffff";                            // default white
            })
            .attr("stroke", function(d) {
                return (d["country"] === selectedCountry) ? "#ff6b35" : "#339dff";
            })
            .attr("stroke-width", function(d) {
                return (d["country"] === selectedCountry) ? 2 : 0.5;
            })
            .attr("r", function(d) {
                return (d["country"] === selectedCountry) ? 8 : 5;
            });
    }

    window.highlightCountryOnScatter = function(countryName) {
        selectedCountry = (selectedCountry === countryName) ? null : countryName;
        refreshDotColors();
    };

d3.json("data/blue-zone-index-scatter-plot.csv").then((blue_zone_data) => {

    //console.log(blue_zone_data);

    // Add dots
    svgScatterPlot.append('g')
        .selectAll("dot")
        .data(blue_zone_data)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", function (d) { return x((d["Life expectancy"] == null) ? 0 : d["Life expectancy"]); })
        .attr("cy", function (d) { return y((d["blue_zone_index"] == null) ? 0 : d["blue_zone_index"]); })
        .attr("r", 5)
        .attr("stroke", "#339dff")
        .attr("stroke-width", 0.5)
        .style("fill", (c) => {
            //console.log(c);
            if (blueZonesCountries.includes(c["country"])) {
                return "#339dff";
            } else {
                return "#ffffff";
            }
        })
        .on("mouseover", function (event, d) {
            //console.log(d);
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 10);
            const yKey   = radioMappingData[currentButtonId];
            const yLabel = radioYAxisMapping[currentButtonId];
            const yVal   = (d[yKey] == null) ? 0 : +d[yKey];

            scatterToolTip
                .style("display", "block")
                .style("position", "fixed")
                .style("left", (event.clientX + 15) + "px")
                .style("top", (event.clientY + 15) + "px")
                .html(`
            <strong>${d["country"]}</strong><br/>
            Life Expectancy: ${((d["Life expectancy"] == null) ? 0 : d["Life expectancy"]).toFixed(2)}<br/>
            ${radioYAxisMapping[currentButtonId]}: ${((d[radioMappingData[currentButtonId]] == null) ? 0 : d[radioMappingData[currentButtonId]]).toFixed(2)}
            `)
        })
        .on("mousemove", (event) => {
            scatterToolTip
                .style("left", (event.clientX + 15) + "px")
                .style("top", (event.clientY + 15) + "px");
        })
        .on("mouseout", function (event, d) {
            const isSelected = (d["country"] === selectedCountry);
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", isSelected ? 8 : 5);

            scatterToolTip.style("display", "none");
        });

    



    d3.selectAll("input[name='bz']").on("change.scatter-plot", function (event) {

        currentButtonId = event.target.id;
        const currentDataKey = radioMappingData[currentButtonId];
        // We change the name of the Y axis
        yAxis.text(radioYAxisMapping[currentButtonId]);
        const maxYValue = d3.max(blue_zone_data, d => {
            const val = parseFloat(d[currentDataKey]);
            return isNaN(val) ? 0 : val;
        }) || 1;

        y.domain([0, maxYValue]);

        //redraw y-axis
        svgScatterPlot.select(".y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(y));

        d3.selectAll(".data-point")
            .transition()
            .duration(750)
            .attr("cx", function (d) { return x((d["Life expectancy"] == null) ? 0 : d["Life expectancy"]); })
            .attr("cy", function (d) { return y((d[radioMappingData[currentButtonId]] == null) ? 0 : d[radioMappingData[currentButtonId]]); })
            .attr("r", 5)
            .style("fill", (c) => {
                if (blueZonesCountries.includes(c["country"])) {
                    return "#339dff";
                } else {
                    return "#ffffff";
                }
            });
        refreshDotColors();

            
    });

});
