"use strict";

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 800);

let locations = svg.append("g");

const geoMercator = d3.geoMercator();

fetch("nygeo.json")
  .then(res => res.json())
  .then(data => makeMap(data));

function makeMap(data) {
  let map = d3
    .geoAlbers()
    .center([0, 0])
    .rotate([74, 0])
    .scale(100000)
    .translate([600, 68550]);

  let mapBackground = d3.geoPath().projection(map);

  locations
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", mapBackground)
    .attr("fill", "#D3D3D3");

  d3.csv("data-small.csv")
    .then(csvData => (data = csvData))
    .then(() => makeScatterPlot());

  function makeScatterPlot() {
    var tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");

    const dots = svg
      .selectAll(".circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("fill", "#CE0000")
      .attr("r", 2)
      .attr("class", "dot")
      .attr("cx", d => {
        return map([d.LONGITUDE, d.LATITUDE])[0];
      })
      .attr("cy", d => {
        return map([d.LONGITUDE, d.LATITUDE])[1];
      })
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .duration(400)
          .attr("r", 15);
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d) {
        return tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px")
          .text(d["VEHICLE TYPE CODE 1"]);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(400)
          .attr("r", 2.5);
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function() {
        d3.select(this)
          .transition()
          .attr("fill", "blue")
          .duration(250)
          .attr("r", 500)
          .attr("opacity", 0.5)
          .on("end", function() {
            d3.select(this)
              .attr("opacity", 0.5)
              .transition()
              .duration(1000)
              .attr("r", 0)
              .attr("opacity", 0)
              .on("end", () => {
                d3.select(this).remove();
              });
          });
      });

    var dropDown = d3.select("body").append("select");
    var genOptions = dropDown
      .selectAll("option.state")
      .data(
        d3
          .map(data, function(d) {
            return d["CONTRIBUTING FACTOR VEHICLE 1"];
          })
          .keys()
      )
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });

    var genDefault = dropDown
      .append("option")
      .data(data)
      .text("All")
      .attr("value", "All")
      .enter();

    dropDown.on("change", function() {
      var selected = this.value;
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";

      dots
        .filter(function(d) {
          return selected == d["CONTRIBUTING FACTOR VEHICLE 1"];
        })
        .attr("display", display);
      dots
        .filter(function(d) {
          return selected != d["CONTRIBUTING FACTOR VEHICLE 1"];
        })
        .attr("display", displayOthers);

      if (selected == "All") {
        dots.attr("display", display);
      }
    });
  }
}
