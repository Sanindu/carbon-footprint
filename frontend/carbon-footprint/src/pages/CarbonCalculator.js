import React, { useState } from "react";
import axios from "axios";
import CarSelector from "./CarSelector";

const CarbonCalculator = () => {
    const [selectedCar, setSelectedCar] = useState(null);
    const [fuelType, setFuelType] = useState("petrol");
    const [distance, setDistance] = useState(100); // Default distance in km
    const [carbonFootprint, setCarbonFootprint] = useState(null);
    const [error, setError] = useState("");

    const handleCalculateCarbonFootprint = async () => {
        if (!selectedCar || !selectedCar.year || !selectedCar.make || !selectedCar.model) {
            setError("Please select a car before calculating!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/carbon_footprint", {
                ...selectedCar,
                fuel_type: fuelType,
                distance: parseFloat(distance)
            }, {
                headers: { "Content-Type": "application/json" }
            });

            if (response.data.carbon_footprint_kg) {
                console.log("Carbon Footprint:", response.data.carbon_footprint_kg);
                setCarbonFootprint(response.data.carbon_footprint_kg);
                setError(""); // Clear previous errors
            } else {
                setError("No data received. Try a different car model.");
            }
        } catch (error) {
            console.error("Error fetching carbon footprint:", error);
            setError("Failed to calculate carbon footprint.");
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-lg font-bold mb-4">Carbon Footprint Calculator</h1>
            
            <CarSelector setSelectedCar={setSelectedCar} />

            <label>Fuel Type:</label>
            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
            </select>

            <label>Distance (km):</label>
            <input 
                type="number" 
                value={distance} 
                onChange={(e) => setDistance(e.target.value)} 
                className="border p-2 rounded w-full"
            />

            <button 
                onClick={handleCalculateCarbonFootprint}
                className="bg-green-500 text-white p-2 rounded w-full mt-4"
            >
                Calculate Carbon Footprint
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {carbonFootprint !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-bold">Carbon Footprint Result:</h2>
                    <p>{carbonFootprint} kg CO₂</p>
                </div>
            )}
        </div>
    );
};

export default CarbonCalculator;