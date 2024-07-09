const url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

fetch(url)
  .then((response) => response.json())
  .then((data) => createTreeMap(data));

function createTreeMap(data) {
  const width = 960;
  const height = 600;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const treemap = d3.treemap().size([width, height]).paddingInner(1);

  const root = d3
    .hierarchy(data)
    .eachBefore(
      (d) =>
        (d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    )
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const svg = d3
    .select("#tree-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tile = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  tile
    .append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.data.category))
    .on("mouseover", (event, d) => {
      d3.select("#tooltip")
        .style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .html(
          `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
        )
        .attr("data-value", d.data.value);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });

  tile
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text((d) => d)
    .style("font-size", function () {
      const parentNode = d3.select(this.parentNode);
      const parentData = parentNode.datum();
      const tileWidth = parentData.x1 - parentData.x0;
      const tileHeight = parentData.y1 - parentData.y0;
      const maxSize = Math.min(tileWidth, tileHeight) / 3;
      return `${Math.min(10, maxSize)}px`;
    });

  // Legend
  const categories = root
    .leaves()
    .map((nodes) => nodes.data.category)
    .filter((category, index, self) => self.indexOf(category) === index);

  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", width)
    .attr("height", 50);

  const legendItem = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

  legendItem
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => color(d));

  legendItem
    .append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text((d) => d);
}
