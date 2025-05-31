import React, { useState } from 'react';
import axios from 'axios';
import CarSelector from './CarSelector';

const CarbonCalculator = () => {
  const [efficiency, setEfficiency] = useState(null);
  const [distance, setDistance] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [frequency, setFrequency] = useState('weekly');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (!efficiency || !distance) {
      alert('Please select a car and enter the distance.');
      return;
    }

    axios.post('http://localhost:5000/calculate', {
      distance: parseFloat(distance),
      fuel_type: fuelType,
      efficiency: parseFloat(efficiency.combined),
      frequency
    })
    .then(response => {
      setResult(response.data);
    })
    .catch(error => {
      alert('Error calculating carbon footprint.');
    });
  };

  return (
    <div>
      <CarSelector onEfficiencySelect={setEfficiency} />

      <label>Distance (km):</label>
      <input type="number" value={distance} onChange={e => setDistance(e.target.value)} />

      <label>Fuel Type:</label>
      <select value={fuelType} onChange={e => setFuelType(e.target.value)}>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
      </select>

      <label>Frequency:</label>
      <select value={frequency} onChange={e => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <button onClick={handleCalculate}>Calculate</button>

      {result && (
        <div>
          <p>Total Distance: {result.total_distance} km</p>
          <p>Fuel Used: {result.litres_used.toFixed(2)} litres</p>
          <p>CO₂ Emitted: {result.co2_emitted} kg</p>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator;
