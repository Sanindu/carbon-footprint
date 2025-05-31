import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CarSelector = ({ onEfficiencySelect }) => {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [trims, setTrims] = useState([]);
  const [selected, setSelected] = useState({ make: '', model: '', year: '' });

  useEffect(() => {
    // Fetch car makes
    axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes')
      .then(response => {
        const makesData = response.data.Makes;
        setMakes(makesData);
      });
  }, []);

  useEffect(() => {
    if (selected.make) {
      // Fetch models for the selected make
      axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${selected.make}`)
        .then(response => {
          const modelsData = response.data.Models;
          setModels(modelsData);
        });
    }
  }, [selected.make]);

  useEffect(() => {
    if (selected.make && selected.model) {
      // Fetch years for the selected make and model
      axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getYears&make=${selected.make}&model=${selected.model}`)
        .then(response => {
          const yearsData = response.data.Years;
          setYears(yearsData);
        });
    }
  }, [selected.model]);

  useEffect(() => {
    if (selected.make && selected.model && selected.year) {
      // Fetch trims for the selected make, model, and year
      axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${selected.make}&model=${selected.model}&year=${selected.year}`)
        .then(response => {
          const trimsData = response.data.Trims;
          setTrims(trimsData);
        });
    }
  }, [selected.year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelected(prev => ({ ...prev, [name]: value }));
  };

  const handleTrimSelect = (trim) => {
    // Extract fuel efficiency data from the selected trim
    const efficiency = {
      city: trim.model_lkm_city,
      highway: trim.model_lkm_hwy,
      combined: trim.model_lkm_mixed
    };
    onEfficiencySelect(efficiency);
  };

  return (
    <div>
      <label>Make:</label>
      <select name="make" onChange={handleChange}>
        <option value="">Select Make</option>
        {makes.map(make => (
          <option key={make.make_id} value={make.make_id}>{make.make_display}</option>
        ))}
      </select>

      <label>Model:</label>
      <select name="model" onChange={handleChange}>
        <option value="">Select Model</option>
        {models.map(model => (
          <option key={model.model_name} value={model.model_name}>{model.model_name}</option>
        ))}
      </select>

      <label>Year:</label>
      <select name="year" onChange={handleChange}>
        <option value="">Select Year</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <label>Trim:</label>
      <select onChange={(e) => handleTrimSelect(JSON.parse(e.target.value))}>
        <option value="">Select Trim</option>
        {trims.map(trim => (
          <option key={trim.model_id} value={JSON.stringify(trim)}>{trim.model_trim}</option>
        ))}
      </select>
    </div>
  );
};

export default CarSelector;
