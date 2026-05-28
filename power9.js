const data = {
    id: "Blue Zones\nHabits", group: 0, radius: 55,
    children: [
        {
            id: "Eat\nWisely", group: 1, radius: 40, desc: "The core principle of 3 dietary habits of the world's longest-lived people.",
            children: [
                { id: "Plant\nSlant", group: 1, radius: 30, desc: "Whole grains, nuts, legumes, fruits and vegetables, are the cornerstone of most centenarian diets. Meat and dairy are eaten but generally in smaller quantities." },
                { id: "80% Rule", group: 1, radius: 30, desc: "Stop eating when your stomach is 80% full, as it takes time for your brain to register that your stomach is satisfied." },
                { id: "Wine at 5", group: 1, radius: 30, desc: "People in Blue Zones drink alcohol moderately, 1-2 glasses per day maximum with <strong>friends and/or with food</strong>." }
            ]
        },
        {
            id: "Right\nOutlook", group: 2, radius: 40, desc: "The mental framework built on 2 essential pillars.",
            children: [
                { id: "Purpose", group: 2, radius: 30, desc: "Having a sense of purpose in life means having a reason for waking up in the morning." },
                { id: "Downshift", group: 2, radius: 30, desc: "Stress leads to chronic inflammation. Centenarians have routines to shed that stress: meditating, taking a nap, or reading." }
            ]
        },
        {
            id: "Connect", group: 3, radius: 40, desc: "Social networks, family, and community another base for a longer life.",
            children: [
                { id: "Belong", group: 3, radius: 30, desc: "Cultivate meaningful relationships" },
                { id: "Loved ones\nfirst", group: 3, radius: 30, desc: "Keeping aging parents and grandparents nearby or in the home. Committing to a life partner." },
                { id: "Right\nTribe", group: 3, radius: 30, desc: "Choosing social circles that support healthy behaviors." }
            ]
        },
        {
            id: "Move\nnaturally", group: 4, radius: 40, desc: "The world's longest-lived people don't pump iron, run marathons or join gyms. Instead, they live in environments that constantly nudge them into moving without thinking about it." 
        }
    ]
};

const width = 600;
const height = 500;

const svg = d3.select("#power9-viz")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; overflow: visible;"); 

const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4])
    .range(["#38bdf8", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"]);

const root = d3.hierarchy(data);
const links = root.links();
const nodes = root.descendants();

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.data.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-400)) 
    .force("center", d3.forceCenter(width / 2, height / 2)) 
    .force("collide", d3.forceCollide().radius(d => d.data.radius + 12)); 

const link = svg.append("g")
    .attr("stroke", "rgba(255, 255, 255, 0.15)")
    .attr("stroke-width", 1.5)
    .selectAll("line")
    .data(links)
    .join("line");

const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .call(drag(simulation));

node.append("circle")
    .attr("r", d => d.data.radius)
    .attr("fill", d => color(d.data.group))
    .attr("stroke", "#0f172a")
    .attr("stroke-width", 1.5)
    .style("stroke-dasharray", d => (d.depth === 1 && d.children) ? "6,4" : "none")
    .style("opacity", d => (d.depth === 1 && d.children) ? 0.6 : 1)
    .style("cursor", "pointer");

node.append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("fill", "#0f172a") 
    .style("font-size", d => d.depth === 0 ? "13px" : "9px")
    .style("font-weight", "600")
    .style("pointer-events", "none")
    .each(function(d) {
        const lines = d.data.id.split('\n');
        for (let i = 0; i < lines.length; i++) {
            d3.select(this).append("tspan")
                .attr("x", 0)
                .attr("y", (i - lines.length / 2 + 0.8) * 1.2 + "em")
                .text(lines[i]);
        }
    });

node.on("click", function(event, d) {
    const nodeColor = color(d.data.group);
    const title = d.data.id.replace('\n', ' ');
    const desc = d.data.desc || "Researchers identified nine key lifestyle principles that may be linked to this exceptional longevity, known as the 'Power 9'. <strong>Click on another bubble to discover them</strong>.";

    const card = document.getElementById("power9-card");
    const cardTextContainer = document.getElementById("card-text");
    const cardAccent = document.getElementById("card-accent");

    cardTextContainer.innerHTML = `
        <h2 style="color: ${nodeColor}; font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; transition: color 0.3s ease;">
            ${title}
        </h2>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin: 0;">
            ${desc}
        </p>
    `; 
    
    cardAccent.style.backgroundColor = nodeColor;
    card.style.borderColor = nodeColor;
    card.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${nodeColor}22`;

    const connectBtn = document.querySelector(".connect-btn");
    if (connectBtn) {
        connectBtn.innerHTML = `Power 9 principles <span class="btn-icon-placeholder"></span>`;
        
        connectBtn.style.borderColor = nodeColor;
        connectBtn.style.boxShadow = `0 0 15px ${nodeColor}33`;
    }
});

node.on("mouseover", function(event, d) {
    d3.select(this).select("circle")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 3)
        .style("filter", `drop-shadow(0 0 8px ${color(d.data.group)})`);
}).on("mouseout", function() {
    d3.select(this).select("circle")
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 1.5)
        .style("filter", "none");
});

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}