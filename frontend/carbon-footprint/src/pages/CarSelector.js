import React, { useState, useEffect } from "react";
import axios from "axios";

const CarSelector = ({ setSelectedCar }) => {
    const [years, setYears] = useState([]);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMake, setSelectedMake] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    useEffect(() => {
        setYears(Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i));
    }, []);

    const fetchMakes = async (year) => {
        try {
            const response = await axios.get(`http://localhost:5000/car_makes?year=${year}`);
            console.log("Fetched Makes:", response.data); // Debugging log
            setMakes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching car makes", error);
        }
    };

    const fetchModels = async (year, make) => {
        try {
            const response = await axios.get(`http://localhost:5000/car_models?year=${year}&make=${make}`);
            console.log("Fetched Models:", response.data); // Debugging log
            setModels(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching car models", error);
        }
    };
const handleSelectCar = () => {
    if (selectedYear && selectedMake && selectedModel) {
        setSelectedCar({ year: selectedYear, make: selectedMake, model: selectedModel });
        console.log("Selected Car:", { year: selectedYear, make: selectedMake, model: selectedModel });
    } else {
        console.error("Incomplete selection!");
    }
};
    return (
        <div>
            <label>Year:</label>
            <select 
                onChange={(e) => { setSelectedYear(e.target.value); fetchMakes(e.target.value); }} 
                value={selectedYear}
            >
                <option value="">Select Year</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>

            <label>Car Make:</label>
            <select 
                onChange={(e) => { setSelectedMake(e.target.value); fetchModels(selectedYear, e.target.value); }} 
                value={selectedMake} 
                disabled={!selectedYear}
            >
                <option value="">Select Make</option>
                {makes.length > 0 ? (
                    makes.map((make, index) => <option key={index} value={make}>{make}</option>)
                ) : (
                    <option disabled>Loading makes...</option>
                )}
            </select>

            <label>Car Model:</label>
            <select 
                onChange={(e) => setSelectedModel(e.target.value)} 
                value={selectedModel} 
                disabled={!selectedMake}
            >
                <option value="">Select Model</option>
                {models.length > 0 ? (
                    models.map((model, index) => <option key={index} value={model}>{model}</option>)
                ) : (
                    <option disabled>Loading models...</option>
                )}
            </select>
            <button onClick={handleSelectCar}>Confirm Selection</button>
        </div>
    );
};

export default CarSelector;