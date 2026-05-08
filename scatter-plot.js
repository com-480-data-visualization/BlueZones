// Code inspired from https://d3-graph-gallery.com/graph/scatter_basic.html and https://d3-graph-gallery.com/graph/custom_theme.html

const blueZonesCountries = ["Japan", "Greece", "Italy", "Costa Rica", "United States of America"];

const margin = {top: 0, right: 30, bottom: 0, left: 70};
const widthScatterPlot = 600 - margin.left - margin.right;
const heightScatterPlot = 500 - margin.top - margin.bottom;

var svgScatterPlot = d3.select("#scatter-plot")
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
    .call(d3.axisLeft(y));

// Add X axis label:
svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("x", widthScatterPlot / 2)
    .attr("y", heightScatterPlot + margin.top + 50)
    .attr("font-size", "24px")
    .text("Life Expectancy");

// Y axis label:
var yAxis = svgScatterPlot.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 30)
    .attr("x", -margin.top - heightScatterPlot / 2)
    .attr("font-size", "24px")
    .text("Blue Zone Index");

const scatterToolTip = d3.select("#scatter-tooltip");

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

            scatterToolTip
                .style("display", "block")
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 15) + "px")
                .html(`
            <strong>${d["country"]}</strong><br/>
            Life Expectancy: ${((d["Life expectancy"] == null) ? 0 : d["Life expectancy"]).toFixed(2)}<br/>
            ${radioYAxisMapping[currentButtonId]}: ${((d[radioMappingData[currentButtonId]] == null) ? 0 : d[radioMappingData[currentButtonId]]).toFixed(2)}
            `)
        })
        .on("mousemove", (event) => {
            scatterToolTip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 15) + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 5);

            scatterToolTip.style("display", "none");
        });


    const radioYAxisMapping = {
        "idx": "Blue Zone Index",
        "happy": "Happiness",
        "activity": "Activity",
        "wine": "Wine Consumption",
        "food": "Food"
    }

    const radioMappingData = {
        "idx": "blue_zone_index",
        "happy": "Life evaluation",
        "activity": "steps_mean_filtered",
        "wine": "Wine Consumption",
        "food": "Pulses"
    };

    let currentButtonId = "idx";

    d3.selectAll("input[name='bz']").on("change.scatter-plot", function (event) {

        currentButtonId = this.id;
        // We change the name of the Y axis
        yAxis.text(radioYAxisMapping[currentButtonId]);

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
            
    });

});
