function drawRadar(data, countryName, selector) {
    const width = 340;
    const height = 260;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;
    
    const features = data.map(d => d.axis);
    const totalAxes = features.length;

    const container = d3.select(selector);
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 15})`);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 15)
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(countryName);

    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);
    const angleOffset = -Math.PI / 2;
    const lineGenerator = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveLinearClosed);

    const ticks = [1, 0.75, 0.5, 0.25];
    ticks.forEach((t, index) => {
        const points = features.map((_, i) => {
            const angle = (Math.PI * 2 * i / totalAxes) + angleOffset;
            return [rScale(t) * Math.cos(angle), rScale(t) * Math.sin(angle)];
        });

        svg.append("path")
            .datum(points)
            .attr("d", lineGenerator)
            .style("fill", index === 0 ? "#e5e7eb" : "none") 
            .style("stroke", "#0f172a") 
            .style("stroke-width", index === 0 ? 2 : 1);
    });

    features.forEach((f, i) => {
        const angle = (Math.PI * 2 * i / totalAxes) + angleOffset;
        const labelRadius = radius * 1.15; 
        
        svg.append("text")
            .attr("x", labelRadius * Math.cos(angle))
            .attr("y", labelRadius * Math.sin(angle))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", "#ffffff")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .text(f);
    });

    const dataCoordinates = data.map((d, i) => {
        const angle = (Math.PI * 2 * i / totalAxes) + angleOffset;
        return [rScale(d.value) * Math.cos(angle), rScale(d.value) * Math.sin(angle)];
    });

    svg.append("path")
        .datum(dataCoordinates)
        .attr("d", lineGenerator)
        .style("fill", "none")
        .style("stroke", "#38bdf8") 
        .style("stroke-width", 2.5);

    svg.selectAll(".data-point")
        .data(dataCoordinates)
        .enter()
        .append("circle")
        .attr("cx", d => d[0])
        .attr("cy", d => d[1])
        .attr("r", 3.5)
        .style("fill", "#1e3a8a") 
        .style("stroke", "#0a01bb")
        .style("stroke-width", 1);
}