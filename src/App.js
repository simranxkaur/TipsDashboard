import React, { Component } from "react";
import tipData from './data/tips.csv';
import * as d3 from "d3";

class App extends Component {
  componentDidMount() {
    // Call the function to draw the chart after the SVG elements are rendered
    this.drawBarChart();
    this.scatterPlot();
  }

  scatterPlot() {
    d3.csv(tipData).then(data => {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;
  
      const svg = d3.select('#scatterplot')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.total_bill)])
        .range([0, width]);
  
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.tip)])
        .range([height, 0]);
  
      svg.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(+d.total_bill))
        .attr('cy', d => yScale(+d.tip))
        .attr('r', 5)
        .attr('fill', 'steelblue');
  
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
  
      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text("Total Bill")
        .attr("x", 250)
        .attr("y", 550);

        svg.append("text")
        .text("Tips")
        .attr("x", -50)
        .attr("y", 250);

    }).catch(error => {
      console.error('Error loading the data: ', error);
    });
  }
  
  
  drawBarChart() {
    d3.csv(tipData).then(data => {
      console.log(data);

      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 700 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;

      const svg = d3.select("#bar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.day))
        .padding(0.2); // Adjust the padding between bars

      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => +d.total_bill)])
        .nice();

      svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.day))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(+d.total_bill))
        .attr('height', d => height - yScale(+d.total_bill))
        .style('fill', 'steelblue');

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text("Day")
        .attr("x", 300)
        .attr("y", 630);

      svg.append("text")
        .text("Total Bill (average)")
        .attr("x", -300)
        .attr("y", -30)
        .attr("transform", "rotate(-90)");

      svg.append("text")
        .text("Assignment 5")
        .attr("x", 500)
        .attr("y", 10);
    }).catch(error => {
      console.error('Error loading the data: ', error);
    });
  }

  render() {
    return (
      <div>
        {/* Render the SVG elements */}
        <svg id="bar" width="600" height="700"></svg>
        <svg id="matrix" width="600" height="700"></svg>
        <svg id="scatterplot" width="600" height="700"></svg>
      </div>
    );
  }
}

export default App;