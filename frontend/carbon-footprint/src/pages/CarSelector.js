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
            const res = await axios.get(`http://localhost:5000/car_makes?year=${year}`);
            setMakes(Array.isArray(res.data) ? res.data : []);
            setSelectedMake("");
            setSelectedModel("");
        } catch (err) {
            console.error("Error fetching car makes", err);
        }
    };

    const fetchModels = async (year, make) => {
        try {
            const res = await axios.get(`http://localhost:5000/car_models?year=${year}&make=${make}`);
            setModels(Array.isArray(res.data) ? res.data : []);
            setSelectedModel("");
        } catch (err) {
            console.error("Error fetching car models", err);
        }
    };

    const handleSelectCar = () => {
        if (selectedYear && selectedMake && selectedModel) {
            setSelectedCar({ year: selectedYear, make: selectedMake, model: selectedModel });
        } else {
            alert("Please complete all selections.");
        }
    };

    const dropdownClass = "w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select 
                    className={dropdownClass}
                    value={selectedYear}
                    onChange={(e) => {
                        setSelectedYear(e.target.value);
                        fetchMakes(e.target.value);
                    }}
                >
                    <option value="">Select Year</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <select 
                    className={dropdownClass}
                    value={selectedMake}
                    disabled={!selectedYear}
                    onChange={(e) => {
                        setSelectedMake(e.target.value);
                        fetchModels(selectedYear, e.target.value);
                    }}
                >
                    <option value="">Select Make</option>
                    {makes.map((make, index) => <option key={index} value={make}>{make}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select 
                    className={dropdownClass}
                    value={selectedModel}
                    disabled={!selectedMake}
                    onChange={(e) => setSelectedModel(e.target.value)}
                >
                    <option value="">Select Model</option>
                    {models.map((model, index) => <option key={index} value={model}>{model}</option>)}
                </select>
            </div>

            <button 
                onClick={handleSelectCar}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
            >
                Confirm Car Selection
            </button>
        </div>
    );
};

export default CarSelector;
