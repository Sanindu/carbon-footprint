// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CarSelector from './pages/CarSelector';
import CarbonCalculator from './pages/CarbonCalculator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CarbonCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
