import React from 'react';
import './App.css'; 
import BarChart from './BarChart.js'; 
import CorrelationMatrix from './CorrelationMatrix.js'
import ScatterPlot from './ScatterPlot.js'
function App() {

  return (
    <div className="app">
      <h1 className="title">Assignment 5</h1>
      <div className="bar">
        <label htmlFor="targetDropdown" className="label">Select Target:</label>
        <select id="targetDropdown" className="dropdown">
        </select>
      </div>

      <div className="row">

        <div className="child">
          <BarChart></BarChart>
        </div>

        <div className="child">
          <CorrelationMatrix></CorrelationMatrix>
        </div>

      </div>

      <div className="row">

        <div className="child">
          <ScatterPlot></ScatterPlot>
        </div>

      </div>
    </div>
  );
}

export default App;
