import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";

const ScheduleVisualization = ({ tasks, algorithm }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous visualization

    const margin = { top: 20, right: 20, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height =
      Math.max(400, tasks.length * 50) - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const yScale = d3
      .scaleBand()
      .domain(tasks.map((d) => d.title))
      .range([0, height])
      .padding(0.1);

    const maxTime = d3.max(tasks, (d) => d.estimatedTime) || 1;
    const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, width]);

    // Color scale based on priority
    const colorScale = d3
      .scaleOrdinal()
      .domain(["low", "medium", "high"])
      .range(["#4caf50", "#ff9800", "#f44336"]);

    // Create bars
    g.selectAll(".bar")
      .data(tasks)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.title))
      .attr("width", (d) => xScale(d.estimatedTime))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.priority))
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        // Tooltip functionality
        d3.select(this).attr("opacity", 1);

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.8)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("pointer-events", "none");

        tooltip.transition().duration(200).style("opacity", 0.9);

        tooltip
          .html(
            `
          <strong>${d.title}</strong><br/>
          Time: ${d.estimatedTime}h<br/>
          Priority: ${d.priority}<br/>
          Due: ${new Date(d.dueDate).toLocaleDateString()}
        `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8);
        d3.selectAll(".tooltip").remove();
      });

    // Add text labels on bars
    g.selectAll(".bar-text")
      .data(tasks)
      .enter()
      .append("text")
      .attr("class", "bar-text")
      .attr("x", (d) => xScale(d.estimatedTime) + 5)
      .attr("y", (d) => yScale(d.title) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text((d) => `${d.estimatedTime}h`);

    // Add y-axis (task names)
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px");

    // Add x-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Tasks");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Estimated Time (hours)");

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${width + margin.left - 100}, ${margin.top})`
      );

    const legendData = [
      { priority: "high", color: "#f44336", label: "High Priority" },
      { priority: "medium", color: "#ff9800", label: "Medium Priority" },
      { priority: "low", color: "#4caf50", label: "Low Priority" },
    ];

    const legendItems = legend
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => d.color);

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .text((d) => d.label);
  }, [tasks, algorithm]);

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Gantt Chart - {algorithm} Algorithm
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <svg ref={svgRef}></svg>
      </Box>
    </Box>
  );
};

export default ScheduleVisualization;
