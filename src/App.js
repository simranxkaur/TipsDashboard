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
    this.scatterPlot = this.scatterPlot.bind(this);
  }

  targetDropdown = (event) => {
    const selectedVariable = event.target.value;
    this.setState({ target: selectedVariable }, () => {
      this.drawBarChart();
    });
  }

  xaxisChange = (event) => {
    const selectedXAxis = event.target.value;
    this.setState({ selectedXAxis: selectedXAxis }, () => {
      this.drawBarChart();
    });
  }

  componentDidMount() {
    // Call the function to draw the chart after the SVG elements are rendered
    this.drawBarChart();

    const initVar1 = 'total_bill';
    const initVar2 = 'tip';
    this.scatterPlot(initVar1, initVar2);
    this.drawCorrelationMatrix();
  }

  scatterPlot(selectedVariable1, selectedVariable2) {
    d3.select("#scatterplot").selectAll("*").remove();
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
        .domain([0, d3.max(data, d => +d[selectedVariable1])])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d[selectedVariable2])])
        .range([height, 0]);

      svg.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(+d[selectedVariable1]))
        .attr('cy', d => yScale(+d[selectedVariable2]))
        .attr('r', 5)
        .attr('fill', 'grey');

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text(selectedVariable1)
        .attr("x", width / 2)
        .attr("y", 550);

      svg.append("text")
        .text(selectedVariable2)
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
      // const correlationMatrix = variables.map((variable1, i) =>
      //   variables.map((variable2, j) => i === j ? 1 : correlationCoefficient(data.map(d => +d[variable1]), data.map(d => +d[variable2])))
      // );

      const correlationMatrix = variables.map((variable1, i) =>
        variables.map((variable2, j) => {
          if (i === j) {
            return { variable1, variable2, correlation: 1 };
          } else {
            const correlation = correlationCoefficient(data.map(d => +d[variable1]), data.map(d => +d[variable2]));
            return { variable1, variable2, correlation };
          }
        })
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

      const correlationValues = correlationMatrix.flat().map(item => item.correlation);

      svg.selectAll()
        .data(correlationMatrix.flat())
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(variables[i % variables.length]))
        .attr("y", (d, i) => yScale(variables[Math.floor(i / variables.length)]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.correlation))
        .on("click", (event, d) => {
          const variable1 = d.variable1;
          const variable2 = d.variable2;
          this.scatterPlot(variable1, variable2);
        });


      svg.selectAll(".corr-label")
        .data(correlationValues)
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
      const height = 500 - margin.top - margin.bottom;

      const selectedVariable = this.state.target;
      const selectedXAxis = this.state.selectedXAxis;

      const svg = d3.select("#bar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      console.log(selectedVariable)
      console.log(selectedXAxis)

      const catMap = {};
      data.forEach(d => {
        const cat = d[selectedXAxis];
        const value = +d[selectedVariable];
        if (catMap[cat]) {
          catMap[cat].total += value;
          catMap[cat].count++;
        } else {
          catMap[cat] = { total: value, count: 1 };
        }
      });
      const avgVals = Object.keys(catMap).map(cat => ({
        cat,
        average: catMap[cat].total / catMap[cat].count
      }));

      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(avgVals.map(d => d.cat))
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(avgVals, d => d.average)])
        .nice();

      svg.selectAll('.bar')
        .data(avgVals)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.cat))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d.average))
        .attr('height', d => height - yScale(d.average))
        .style('fill', 'grey');

      svg.selectAll('.bar-label')
        .data(avgVals)
        .enter().append('text')
        .attr('class', 'bar-label')
        .attr("x", d => xScale(d.cat) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.average) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.average.toFixed(2));

      // const xScale = d3.scaleBand()
      //   .range([0, width])
      //   .domain(data.map(d => d[selectedXAxis]))
      //   .padding(0.2); // Adjust the padding between bars

      // const yScale = d3.scaleLinear()
      //   .range([height, 0])
      //   .domain([0, d3.max(data, d => +d[selectedVariable])])
      //   .nice();

      // svg.selectAll('.bar')
      //   .data(data)
      //   .enter().append('rect')
      //   .attr('class', 'bar')
      //   .attr('x', d => xScale(d[selectedXAxis]))
      //   .attr('width', xScale.bandwidth())
      //   .attr('y', d => yScale(+d[selectedVariable]))
      //   .attr('height', d => height - yScale(+d[selectedVariable]))
      //   .style('fill', 'grey');

      // svg.selectAll('.bar-label')
      //   .data(data)
      //   .enter().append('text')
      //   .attr('class', 'bar-label')
      //   .attr('x', d => xScale(d[selectedXAxis]) + xScale.bandwidth() / 2)
      //   .attr('y', d => yScale(+d[selectedVariable]) - 5)
      //   .attr('text-anchor', 'middle')
      //   .text(d => +d[selectedVariable]);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append("text")
        .text(selectedXAxis)
        .attr("x", 250)
        .attr("y", 440);

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
        <div style={{ backgroundColor: "#d3d3d3", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
            onChange={this.xaxisChange}
          />
          <label htmlFor="sex">Sex</label>
          <input
            type="radio"
            id="smoker"
            name="xAxis"
            value="smoker"
            checked={this.state.selectedXAxis === "smoker"}
            onChange={this.xaxisChange}
          />
          <label htmlFor="smoker">Smoker</label>
          <input
            type="radio"
            id="day"
            name="xAxis"
            value="day"
            checked={this.state.selectedXAxis === "day"}
            onChange={this.xaxisChange}
          />
          <label htmlFor="day">Day</label>
          <input
            type="radio"
            id="time"
            name="xAxis"
            value="time"
            checked={this.state.selectedXAxis === "time"}
            onChange={this.xaxisChange}
          />
          <label htmlFor="time">Time</label>
        </div>
        <svg id="bar" width="600" height="500"></svg>
        <svg id="matrix" width="600" height="400"></svg>
        <svg id="scatterplot" width="600" height="700"></svg>
      </div>
    );
  }
}

export default App;