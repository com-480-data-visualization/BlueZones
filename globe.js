async function initBlueZonesGlobe() {
    const container = document.getElementById("bluezones-globe");

    const width = container.clientWidth;
    const height = container.clientHeight;
    const radius = Math.min(width, height) * 0.42;

    const svg = d3
        .select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)

    const projection = d3
        .geoOrthographic()
        .translate([width / 2, height / 2])
        .scale(radius)
        .clipAngle(90);

    const path = d3.geoPath(projection);

    svg.append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "#b7dcff")
        .attr("stroke", "#7aa7d9");

    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries);

    svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#eaf4ff")
        .attr("stroke", "#9bbce6")
        .attr("stroke-width", 0.5);


    // Drag rotate
    svg.call(
        d3.drag().on("drag", (event) => {
        svg.selectAll("path").attr("d", path);
        const rotate = projection.rotate();
        const k = 0.25;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        })
    );
}

document.addEventListener("DOMContentLoaded", initBlueZonesGlobe);