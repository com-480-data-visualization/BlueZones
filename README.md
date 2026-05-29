# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Achour Myriam Sarah| 415138 |
| Ben Fraj Yaman | 346591 |
| Poulou Ioanna | 416522 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

[Milestone 1 report (PDF)](Milestone1/Milestone1_report.pdf)

## Milestone 2 (17th April, 5pm)

[Milestone 2 report (PDF)](Milestone2/Milestone2_report.pdf)

[Milestone 2 Website](https://com-480-data-visualization.github.io/BlueZones/)

## Milestone 3 (29th May, 5pm)

We recommend using Google Chrome to visit our website.

[Website](https://com-480-data-visualization.github.io/BlueZones/)

[Process book](process_book.pdf)

[Screencast](https://drive.google.com/file/d/1KXCaXPjfBPm9d168H0eEHgNsxRWohVLi/view?usp=sharing)

## About the Website

**Blue Zones - The Science of Living Longer** is an interactive data visualization exploring the five Blue Zones, regions where people naturally live longer, and the lifestyle factors behind their longevity.

### Sections

| Section | Description |
|---|---|
| **Landing** | Video intro with key statistics |
| **Discover Blue Zones** | Interactive force-directed bubble chart of the Power 9 longevity principles |
| **The 5 Blue Zones** | Flippable card carousel with a rotating 3D globe |
| **Process** | Methodology, how 9 qualitative habits became 5 measurable pillars |
| **Explore the World** | World map + correlation scatter plot |
| **Quiz** | 5-question knowledge check with a final score |

### Visualizations

**Power 9 Bubble Chart** (`power9.js`)  
A D3 force-directed graph showing the nine pillars of Blue Zones grouped into four clusters (Eat Wisely, Right Outlook, Connect, Move Naturally). Nodes are draggable, clicking a bubble updates the info card on the left. The cards content has been extracted from the following [source](https://pmc.ncbi.nlm.nih.gov/articles/PMC6125071/)

**Cards Carousel + Globe** (`carousel.js`, `cards.js`, `globe.js`)  
An Embla Carousel with a scale-tween effect displays the five Blue Zone location cards. It rotates continuously or by mouse drag, pauses on hover, and resumes when the mouse leaves the carousel area. Cards flip on click to reveal fun facts. As the carousel scrolls, the globe rotates to the active Blue Zone.

**World Map** (`map.js`)  
A Map built with D3 + TopoJSON. Six metrics are selectable: Blue Zone Score, Happiness, Activity, Wine, Plant Slant (Ratio computed by summing daily calorie intake from plant-based columns (wheat, rice, maize, fruits, vegetables, nuts, pulses, etc.) divided by the country's daily average per capita per year total caloric intake), and the 80% Rule (Quantified via a scoring function based on daily caloric intake: an optimal intake up to 2100 kcal scores 1.0, while excessive overeating or severe undereating (< 1200 kcal) are penalized). A year slider (1965–2024, metric-dependent) animates the map over time. Hovering a country shows a radar chart (Blue Zone Score mode) or a simple score (other modes).

**Scatter Plot** (`scatter-plot.js`)  
A slide-out drawer showing the correlation between the selected metric and life expectancy across all countries. Clicking a country on the map highlights the corresponding dot. Colors follow the same per-metric palette as the map.

**Radar Chart** (`radar.js`)  
Rendered inside the map tooltip (Blue Zone Score mode only). Shows a country's normalized scores across all five pillars.

### Tech Stack

| Tool | Use |
|---|---|
| [D3.js v7](https://d3js.org/) | All charts and the world map |
| [TopoJSON](https://github.com/topojson/topojson) | World display  |
| [Embla Carousel](https://www.embla-carousel.com/) | Cards carousel with scale tween plugin |
| HTML / CSS / JS | 

## Technical Setup & Installation

Either click on the following link: [Website](https://com-480-data-visualization.github.io/BlueZones/) or:

1. Clone the repository:
   ```bash
   git clone https://github.com/com-480-data-visualization/BlueZones.git
   cd BlueZones
2. python -m http.server 8000
3. Open your browser and navigate to http://localhost:8000. We highly recommend using **Google Chrome** for the best experience.


### Project Structure

```
BlueZones/
├── index.html                       # Main page markup
├── style.css                        # All styles 
│
├── power9.js                        # Force-directed Power 9 bubble chart
├── globe.js                         # Globe (cards section)
├── map.js                           # World map + year slider
├── radar.js                         # Radar chart (rendered inside map tooltip)
├── scatter-plot.js                  # Scatter plot side drawer
├── quiz.js                          # Quiz and score animation
├── cards.js                         # Card flip interaction 
├── carousel.js                      # Embla carousel init + globe sync
├── EmblaCarouselTweenScale.js       # Scale tween plugin for carousel
├── animation_landingpage.js         # Fade on scroll for landing title
│
├── data/
├── img/                             # Card and banner images
├── video/                           # Landing page background video
└── lib/
```

### Data Sources

| Metric | Source |
|---|---|
| Life expectancy | [Our World in Data](https://ourworldindata.org/grapher/life-expectancy?country=OWID_WRL~Americas~OWID_EUR~OWID_AFR)|
| Happiness / Life evaluation | [World Happiness Report](https://www.worldhappiness.report/data-sharing/) |
| Physical activity (steps) | [Global physical activity dataset](https://github.com/timalthoff/activityinequality) |
| Wine consumption | [Our World in Data](https://ourworldindata.org/grapher/wine-consumption-per-capita) |
| Plant-based diet ratio and 80% Rule (caloric intake proxy) | [Our World in Data](https://ourworldindata.org/grapher/dietary-composition-by-country) |
| Blue Zone Score | Index derived from the above |

---
