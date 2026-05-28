async function initBlueZonesGlobe() {
    const container = document.getElementById("globe-container");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const radius = Math.min(width, height) * 1.2;
    const blueZoneFocusCoordinates = {
        // Coordinates of blue zones
        "United States of America": [-117.24, 34.05], 
        "Japan": [127.68, 26.21], 
        "Greece": [26.16, 37.60], 
        "Costa Rica": [-85.45, 10.20], 
        "Italy": [9.00, 40.10] 
    };
    let activeCountry = window.currentBlueZoneCountry || "Japan";

    const svg = d3
        .select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("id", "bluezones-globe")

    const svgTopOffset = parseFloat(window.getComputedStyle(svg.node()).top) || 0;
    const visibleCenterYOffset = -svgTopOffset;
    const normalizedYOffset = Math.max(-0.85, Math.min(-0.75, -visibleCenterYOffset / radius));
    const latitudeBias = (Math.asin(normalizedYOffset) * 180) / Math.PI;

    const projection = d3
        .geoOrthographic()
        .translate([width / 2, height / 0.8])
        .scale(radius)
        .clipAngle(90);

    const path = d3.geoPath(projection);
    const redrawGlobe = () => {
        svg.selectAll("path").attr("d", path);
    };

    svg.append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "#b7dcff")

    const world = await d3.json("data/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries);

    const countryPaths = svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (c) => (c.properties.name === activeCountry ? "#005cb8" : "#eaf4ff"))
        .attr("stroke", "#9bbce6")
        .attr("stroke-width", 0.5);

    const updateActiveCountry = (countryName) => {
        if (!countryName || !blueZoneFocusCoordinates[countryName]) return;
        activeCountry = countryName;
        countryPaths.attr("fill", (c) => (c.properties.name === activeCountry ? "#005cb8" : "#eaf4ff"));
    };

    const normalizeRotation = (current, target) => {
        let targetLon = target[0];
        while (targetLon - current[0] > 180) targetLon -= 360;
        while (targetLon - current[0] < -180) targetLon += 360;
        return [targetLon, target[1], 0];
    };

    const rotateToCountry = (countryName, duration = 900) => {
        const focusCoordinates = blueZoneFocusCoordinates[countryName];
        if (!focusCoordinates) return;

        const [longitude, latitude] = focusCoordinates;
        const target = [-longitude, -latitude - latitudeBias];

        const start = projection.rotate();
        const end = normalizeRotation(start, target);
        const interpolateRotation = d3.interpolate(start, end);

        d3.transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
            .tween("rotate", () => (t) => {
                projection.rotate(interpolateRotation(t));
                redrawGlobe();
            });
    };

    window.addEventListener("bluezone:active-country-change", (event) => {
        const country = event.detail?.country;
        updateActiveCountry(country);
        rotateToCountry(country);
    });

    updateActiveCountry(activeCountry);
    rotateToCountry(activeCountry, 0);

    // Drag rotate
    svg.call(
        d3.drag().on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 0.25;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        redrawGlobe();
        })
    );
    
}

document.addEventListener("DOMContentLoaded", initBlueZonesGlobe);