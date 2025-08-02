import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const GanttChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = data.length * 50 + margin.top + margin.bottom;

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.endTime)])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.taskName))
      .range([0, data.length * 40])
      .padding(0.1);

    const colorScale = d3
      .scaleOrdinal()
      .domain([1, 2, 3, 4, 5])
      .range(["#4caf50", "#8bc34a", "#ffeb3b", "#ff9800", "#f44336"]);

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.startTime))
      .attr("y", (d) => yScale(d.taskName))
      .attr("width", (d) => xScale(d.duration))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.priority))
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    // Task labels
    g.selectAll(".task-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "task-label")
      .attr("x", -10)
      .attr("y", (d) => yScale(d.taskName) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) =>
        d.taskName.length > 15
          ? d.taskName.substring(0, 15) + "..."
          : d.taskName
      )
      .attr("font-size", "12px");

    // Time labels on bars
    g.selectAll(".time-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "time-label")
      .attr("x", (d) => xScale(d.startTime) + xScale(d.duration) / 2)
      .attr("y", (d) => yScale(d.taskName) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => `${d.startTime}-${d.endTime}`)
      .attr("font-size", "10px")
      .attr("fill", "white");

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${data.length * 40})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Time Units");

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${width - 100}, 10)`);

    const priorities = [1, 2, 3, 4, 5];
    const legendItems = legend
      .selectAll(".legend-item")
      .data(priorities)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => colorScale(d));

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text((d) => `Priority ${d}`)
      .attr("font-size", "12px");
  }, [data]);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GanttChart;
