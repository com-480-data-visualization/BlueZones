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
    .domain([0, 100])
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

// Add dots
svgScatterPlot.append('g')
    .selectAll("dot")
    .data(dataScatterPlot)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", function (d) { return x(d.x); })
    .attr("cy", function (d) { return y(d.y); })
    .attr("r", 5)
    .style("fill", (c) => {
            if (blueZonesCountries.includes(c.country)) {
                return "#339dff";
            } else {
                return "#ffffff";
            }
        })
    .on("mouseover", function (event, d) {
        d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 10);

        scatterToolTip
            .style("display", "block")
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY + 15) + "px")
            .html(`
            <strong>${d.country}</strong><br/>
            Life Expectancy: ${d.x}<br/>
            Blue Zone Index: ${d.y}
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
d3.selectAll("input[name='bz']").on("change.scatter-plot", function (event) {
    // We change the name of the Y axis
    yAxis.text(radioYAxisMapping[this.id]);
});