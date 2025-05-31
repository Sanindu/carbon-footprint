// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CarbonCalculator from './pages/CarbonCalculator';
import CarSelector from './pages/CarSelector';

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>Car Carbon Footprint Calculator</h1>
        <Routes>
          <Route path="/" element={<CarSelector />} />
          <Route path="/calculate" element={<CarbonCalculator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
