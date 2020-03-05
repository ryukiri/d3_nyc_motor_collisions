"use strict";

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 1000);

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

  d3.csv("data-small.csv").then(points => {
    let dots = svg.append("g");
    dots
      .selectAll("circle")
      .data(points)
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
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(400)
          .attr("r", 2.5);
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
      
  });


}
