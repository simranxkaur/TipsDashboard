import React, { Component } from "react";
import tipData from './data/tips.csv';
import * as d3 from "d3";

function correlationCoefficient(array1, array2) {
  const mean1 = d3.mean(array1);
  const mean2 = d3.mean(array2);
  let sum = 0;
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < array1.length; i++) {
    sum += (array1[i] - mean1) * (array2[i] - mean2);
    sum1 += Math.pow(array1[i] - mean1, 2);
    sum2 += Math.pow(array2[i] - mean2, 2);
  }
  return sum / Math.sqrt(sum1 * sum2);
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: "total_bill",
      selectedXAxis: "day",
    };
  }

  targetDropdown = (event) => {
    const selectedVariable = event.target.value;
    this.setState({ target: selectedVariable }, () => {
      this.drawBarChart();
    });
  }

  handleXAxisChange = (event) => {
    const selectedXAxis = event.target.value;
    this.setState({ selectedXAxis: selectedXAxis }, () => {
      this.drawBarChart();
    });
  }

  componentDidMount() {
    // Call the function to draw the chart after the SVG elements are rendered
    this.drawBarChart();
    this.scatterPlot();
    this.drawCorrelationMatrix();
  }

  scatterPlot() {
    d3.csv(tipData).then(data => {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 1200 - margin.left - margin.right;
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
        .attr('fill', 'grey');
  
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
  
      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text("Total Bill")
        .attr("x", width / 2)
        .attr("y", 550);

        svg.append("text")
        .text("Tips")
        .attr("x", -50)
        .attr("y", 250);

    }).catch(error => {
      console.error('Error loading the data: ', error);
    });
  }
  
  drawCorrelationMatrix() {
    d3.csv(tipData).then(data => {
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select("#matrix")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const variables = ['total_bill', 'tip', 'size'];
      const correlationMatrix = variables.map((variable1, i) =>
        variables.map((variable2, j) => i === j ? 1 : correlationCoefficient(data.map(d => +d[variable1]), data.map(d => +d[variable2])))
      );

      const xScale = d3.scaleBand()
        .domain(variables)
        .range([0, width]);

      const yScale = d3.scaleBand()
        .domain(variables)
        .range([height, 0]);

      const colorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolatePlasma);

      svg.selectAll()
        .data(correlationMatrix.flat())
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(variables[i % variables.length]))
        .attr("y", (d, i) => yScale(variables[Math.floor(i / variables.length)]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d))
        .on("click", (event, d, i) => {
          const variable1 = variables[i % variables.length];
          const variable2 = variables[Math.floor(i / variables.length)];
        });

      svg.selectAll(".corr-label")
        .data(correlationMatrix.flat())
        .enter()
        .append("text")
        .attr("class", "corr-label")
        .attr("x", (d, i) => xScale(variables[i % variables.length]) + xScale.bandwidth() / 2)
        .attr("y", (d, i) => yScale(variables[Math.floor(i / variables.length)]) + yScale.bandwidth() / 2)
        .attr("dy", "0.5em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text(d => d.toFixed(2));

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Correlation Matrix");

      svg.append("g")
        .call(d3.axisLeft(yScale));
    }).catch(error => {
      console.error('Error loading the data: ', error);
    });
  }
  
  drawBarChart = () => {
    d3.select("#bar").selectAll("*").remove();
    d3.csv(tipData).then(data => {
      console.log(data);

      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;

      const selectedVariable = this.state.target;
      const selectedXAxis = this.state.selectedXAxis;

      const svg = d3.select("#bar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      console.log(selectedVariable)
      console.log(selectedXAxis)

      const groupedData = data.reduce((acc, cur) => {
        const key = cur[selectedVariable];
        if (!acc[key]) {
          acc[key] = { sum: 0, count: 0 };
        }
        acc[key].sum += +cur[selectedVariable];
        acc[key].count++;
        return acc;
      }, {});
  
      const averageData = Object.entries(groupedData).map(([key, value]) => ({
        key,
        value: value.sum / value.count
      }));
      
      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d[selectedXAxis]))
        .padding(0.2); // Adjust the padding between bars

      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => +d[selectedVariable])])
        .nice();

      svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d[selectedXAxis]))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(+d[selectedVariable]))
        .attr('height', d => height - yScale(+d[selectedVariable]))
        .style('fill', 'grey');


      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text(selectedXAxis)
        .attr("x", 300)
        .attr("y", 630);

      // svg.append("text")
      //   .text("Total Bill (average)")
      //   .attr("x", -300)
      //   .attr("y", -30)
      //   .attr("transform", "rotate(-90)");
      svg.append("text")
        .text(`${selectedVariable.replace('_', ' ').toUpperCase()} (average)`) // Update text to reflect the selected variable
        .attr("x", -300)
        .attr("y", -30)
        .attr("transform", "rotate(-90)");

    }).catch(error => {
      console.error('Error loading the data: ', error);
    });
  }

  render() {
    return (
      <div>
        {/* Render the SVG elements */}
        {/* <svg id="title" width="600" height="100">
          <text x="300" y="50" textAnchor="middle">Assignment 5</text>
        </svg> */}
        <div style={{ backgroundColor: "#d3d3d3" , padding: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Select Target:
        <select value={this.state.target} onChange={this.targetDropdown}>
          <option value="total_bill">Total Bill</option>
          <option value="tip">Tip</option>
          <option value="size">Size</option>
        </select>
        </div>
        <div>
          <input
            type="radio"
            id="sex"
            name="xAxis"
            value="sex"
            checked={this.state.selectedXAxis === "sex"}
            onChange={this.handleXAxisChange}
          />
          <label htmlFor="sex">Sex</label>
          <input
            type="radio"
            id="smoker"
            name="xAxis"
            value="smoker"
            checked={this.state.selectedXAxis === "smoker"}
            onChange={this.handleXAxisChange}
          />
          <label htmlFor="smoker">Smoker</label>
          <input
            type="radio"
            id="day"
            name="xAxis"
            value="day"
            checked={this.state.selectedXAxis === "day"}
            onChange={this.handleXAxisChange}
          />
          <label htmlFor="day">Day</label>
          <input
            type="radio"
            id="time"
            name="xAxis"
            value="time"
            checked={this.state.selectedXAxis === "time"}
            onChange={this.handleXAxisChange}
          />
          <label htmlFor="time">Time</label>
        </div>
        <svg id="bar" width="600" height="700"></svg>
        <svg id="matrix" width="600" height="700"></svg>
        <svg id="scatterplot" width="600" height="700"></svg>
      </div>
    );
  }
}

export default App;