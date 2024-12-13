const main = d3.select("body")
               .append("div")
               .style("text-align", "center")

      main.append("a")
          .attr("href", "?data=videogames")
          .text("Video Game Data Set")
          .style("text-decoration", "none")
      main.append("span")
          .text(" | ")
      main.append("a")
          .attr("href", "?data=movies")
          .text("Movies Data Set")
          .style("text-decoration", "none")
      main.append("span")
          .text(" | ")
      main.append("a")
          .attr("href", "?data=kickstarter")
          .text("Kickstarter Data Set")
          .style("text-decoration", "none")
      main.append("h1")
          .attr("id", "title")
      main.append("text")
          .attr("id", "description")
const w = 1000;
const h = 600;
const svg = main.append("div")
                //.attr("svg-container")
                .append("svg")
                .attr("width", w)
                .attr("height", h)

const tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .attr("id", "tooltip")
                  .style("opacity", "0")

const DATASETS = {
    videogames: {
        TITLE: "Video Game Sales",
        DESCRIPTION: "Top 100 Most Sold Video Game Grouped by Platform",
        FILE_PATH: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
    },
    movies: {
        TITLE: "Movie Sales",
        DESCRIPTION: "Top 100 Highest Grossing Movies Grouped by Genre",
        FILE_PATH: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
    },
    kickstarter: {
        TITLE: "Kickstarter Pledges",
        DESCRIPTION: "Top 100 Most Pledged Kickstarter Campaigns Grouped by Category",
        FILE_PATH: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
    }
}

let urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = "videogames";
const DATASET = DATASETS[urlParams.get("data") || DEFAULT_DATASET];
console.log(DATASET)
document.getElementById("title").innerHTML = DATASET.TITLE;
document.getElementById("description").innerHTML = DATASET.DESCRIPTION;

let fader = function (color) {
    return d3.interpolateRgb(color, '#fff')(0.2);
  };
  
let color = d3.scaleOrdinal().range(
    [
      '#1f77b4',
      '#aec7e8',
      '#ff7f0e',
      '#ffbb78',
      '#2ca02c',
      '#98df8a',
      '#d62728',
      '#ff9896',
      '#9467bd',
      '#c5b0d5',
      '#8c564b',
      '#c49c94',
      '#e377c2',
      '#f7b6d2',
      '#7f7f7f',
      '#c7c7c7',
      '#bcbd22',
      '#dbdb8d',
      '#17becf',
      '#9edae5'
    ].map(fader)
);

d3.json(DATASET.FILE_PATH).then(data => {
    let root = d3.hierarchy(data, (node) => {
        return node.children
    }).sum(d => d.value).sort((n1, n2) => n2.value - n1.value)
     
    let treemap = d3.treemap()
                    .size([1000, 600])
                    .paddingInner(1)
        treemap(root);

    const tile = svg.selectAll("g")
                    .data(root.leaves())
                    .enter()
                    .append("g")
                    .attr("class", "group")
                    .attr("transform", d => "translate("+d.x0+ ", " +d.y0+")")

          tile.append("rect")
              .attr("class", "tile")
              .attr("fill", d => color(d.data.category))
              .attr("data-name", d => d.data.name)
              .attr("data-category", d => d.data.category)
              .attr("data-value", d => d.data.value)
              .attr("width", d => d.x1 - d.x0)
              .attr("height", d => d.y1 - d.y0)
              .on("mousemove", function (event, d) {
                console.log(event)
                    tooltip.style("opacity", "0.9")
                           .style("position", "absolute")
                           .style("pointer-events", "none")
                           .attr("data-value", d.data.value)
                           .style("left", event.pageX + 20 + "px")
                           .style("top", event.pageY - 40 + "px")
                           .style("background-color", "hsl(216 0% 80%)")
                           .style("padding", "10px")
                           .style("border-radius", "10px")
                    tooltip.html(
                        "Name: "
                        + d.data.name
                        + "<br/>Category: "
                        + d.data.category
                        + "<br/>Value: "
                        + d.data.value
                    )
                           
    
              })
              .on("mouseout", () => tooltip.style("opacity", "0"))

          tile.append('text')
              .attr('class', 'tile-text')
              .selectAll('tspan')
              .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
              .enter()
              .append('tspan')
              .attr('x', 4)
              .attr('y', (d, i) => 15 + i * 15)
              .text((d) => d)
              .style("font-size", "10px")
              .style("cursor", "default")
    
    let categories = root.leaves().map(d => d.data.category)
    categories = categories.filter((category, index, self) => {
        return self.indexOf(category) === index;
    })
    const legendContainer = main.append("div")
                                .attr("id", "legend")
                                .append("svg")
                                .attr("width", 500)
                                .attr("height", 500)
                                
    const legend = legendContainer.append("g")
                                  .attr("transform", "translate(60, 10)")
                                  .selectAll("g")
                                  .data(categories)
                                  .enter()
                                  .append("g")
                                  .attr("transform", (d, i) => {
                                    return ("translate("+ (i % 3) * 160 +", "+ (Math.floor(i / 3) * 15) +")"
                                  );
                                  })

          legend.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "legend-item")
                .attr("fill", d => color(d))

          legend.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(d => d)
                .style("font-size", "12px")
    
}).catch(err => console.error(err))