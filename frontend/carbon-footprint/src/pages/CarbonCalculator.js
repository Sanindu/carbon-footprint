import React, { useState, useEffect } from "react";
import { ChevronRight, Car, Fuel, Route, Calculator, CheckCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
const BASE_URL = "http://127.0.0.1:5000";

const CarbonCalculator = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCar, setSelectedCar] = useState({ year: "", make: "", model: "" });
    const [fuelType, setFuelType] = useState("");
    const [distance, setDistance] = useState("");
    const [carbonFootprint, setCarbonFootprint] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [unit, setUnit] = useState("km"); // or "miles" as default
    
    const [treesRequired, setTreesRequired] = useState(null);


    // Car selector states
    const [years, setYears] = useState([]);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);

    useEffect(() => {
        setYears(Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i));
    }, []);

    const steps = [
        { id: 'year', title: '1. Select Year', icon: Car, description: 'Choose your vehicle year' },
        { id: 'make', title: '2. Select Make', icon: Car, description: 'Choose your vehicle make' },
        { id: 'model', title: '3. Select Model', icon: Car, description: 'Choose your vehicle model' },
        { id: 'fuel', title: '4. Fuel Type', icon: Fuel, description: 'Select your fuel type' },
        { id: 'distance', title: '5. Distance', icon: Route, description: 'Enter travel distance' },
        { id: 'calculate', title: '6. Calculate', icon: Calculator, description: 'Get your carbon footprint' }
    ];

    const fetchMakes = async (year) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/car_makes?year=${year}`);
            const data = await response.json();
            setMakes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching car makes", err);
            setError("Failed to load car makes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchModels = async (year, make) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/car_models?year=${year}&make=${make}`);
            const data = await response.json();
            setModels(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching car models", err);
            setError("Failed to load car models. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearSelect = (year) => {
        setSelectedCar({ ...selectedCar, year, make: "", model: "" });
        setMakes([]);
        setModels([]);
        fetchMakes(year);
        setCurrentStep(2); // Fixed: Changed from 1 to 2 to go to make selection
    };

    const handleMakeSelect = (make) => {
        setSelectedCar({ ...selectedCar, make, model: "" });
        setModels([]);
        fetchModels(selectedCar.year, make);
        setCurrentStep(3);
    };

    const handleModelSelect = (model) => {
        setSelectedCar({ ...selectedCar, model });
        setCurrentStep(4); 
    };

    const handleFuelSelect = (fuel) => {
        setFuelType(fuel);
        setCurrentStep(5); 
    };

    const handleDistanceSubmit = (dist) => {
        setDistance(dist);
        setCurrentStep(6); 
    };

const calculateCarbonFootprint = async () => {
    if (!selectedCar || !selectedCar.year || !selectedCar.make || !selectedCar.model) {
        setError("Please select a car before calculating!");
        return;
    }

    let distanceInKm = parseFloat(distance);
    if (unit === "miles") {
        distanceInKm *= 1.60934;
    }

    try {
        const response = await axios.post(`${BASE_URL}/carbon_footprint`, {
            ...selectedCar,
            fuel_type: fuelType,
            distance: distanceInKm,
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data.carbon_footprint_kg) {
            
            console.log("Carbon Footprint:", response.data.carbon_footprint_kg);
            setCarbonFootprint(response.data.carbon_footprint_kg);
            const carbonValue = response.data.carbon_footprint_kg;
            const trees = Math.ceil(carbonValue / 21);
            setTreesRequired(trees);
            setError(""); // Clear previous errors
        } else {
            setError("No data received. Try a different car model.");
        }
    } catch (error) {
        console.error("Error fetching carbon footprint:", error);
        setError("Failed to calculate carbon footprint.");
    }
};


    const resetCalculator = () => {
        setCurrentStep(0);
        setSelectedCar({ year: "", make: "", model: "" });
        setFuelType("");
        setDistance("");
        setCarbonFootprint(null);
        setError("");
        setMakes([]);
        setModels([]);
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    const StepModal = ({ children, title, canGoBack = true }) => (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>{title}</h2>
                    {canGoBack && currentStep > 0 && (
                        <button
                            onClick={goBack}
                            style={styles.backButton}
                            onMouseEnter={(e) => {
                                e.target.style.color = '#ffffff';
                                e.target.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = '#9ca3af';
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                </div>
                {children}
                {error && (
                    <p style={styles.errorMessage}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );

    const SelectionGrid = ({ items, onSelect, placeholder }) => (
        <div style={styles.selectionGrid}>
            {items.length === 0 ? (
                <div style={styles.placeholder}>
                    {isLoading ? "Loading..." : placeholder}
                </div>
            ) : (
                items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(item)}
                        style={styles.selectionButton}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#374151';
                            e.target.style.borderColor = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1f2937';
                            e.target.style.borderColor = '#4b5563';
                        }}
                    >
                        {item}
                    </button>
                ))
            )}
        </div>
    );

    // Main dashboard when no step is active
    if (currentStep === 0 && !carbonFootprint) {
        return (
            <div style={styles.mainContainer}>
                <div style={styles.dashboard}>
                    <div style={styles.dashboardHeader}>
                        <div style={styles.iconContainer}>
                            <Calculator style={styles.headerIcon} />
                        </div>
                        <h1 style={styles.mainTitle}>Carbon Footprint Calculator</h1>
                        <p style={styles.subtitle}>Every journey leaves a mark, but it doesn't have to be a lasting one. Use this carbon footprint calculator to find out how much CO₂ your car trip emits and discover exactly how many trees you need to plant to balance it out. Whether it’s a quick commute or a cross-country road trip, you can take climate action with every mile. Let’s drive towards a greener future, one tree at a time. </p>
                    </div>
                    
                    <div style={styles.stepsGrid}>
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = (
                                (index === 0 && selectedCar.year) ||
                                (index === 1 && selectedCar.make) ||
                                (index === 2 && selectedCar.model) ||
                                (index === 3 && fuelType) ||
                                (index === 4 && distance) ||
                                (index === 5 && carbonFootprint)
                            );
                            
                            return (
                                <div key={step.id} style={styles.stepCard}>
                                    <div style={styles.stepHeader}>
                                        <div style={{
                                            ...styles.stepIcon,
                                            backgroundColor: isCompleted ? '#059669' : '#374151'
                                        }}>
                                            {isCompleted ? 
                                                <CheckCircle size={20} style={{ color: '#ffffff' }} /> : 
                                                <Icon size={20} style={{ color: '#d1d5db' }} />
                                            }
                                        </div>
                                        <span style={styles.stepTitle}>{step.title}</span>
                                    </div>
                                    <p style={styles.stepDescription}>{step.description}</p>
                                    {isCompleted && (
                                        <div style={styles.completedValue}>
                                            {index === 0 && selectedCar.year}
                                            {index === 1 && selectedCar.make}
                                            {index === 2 && selectedCar.model}
                                            {index === 3 && fuelType}
                                            {index === 4 && `${distance} km`}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div style={styles.startButtonContainer}>
                        <button
                            onClick={() => setCurrentStep(1)}
                            style={styles.startButton}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(to right, #047857, #059669)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(to right, #059669, #10b981)';
                            }}
                        >
                            Start Calculation
                            <ChevronRight style={{ marginLeft: '8px' }} size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // Results screen
    if (carbonFootprint !== null) {
        return (
            <div style={styles.mainContainer}>
                <div style={styles.resultsContainer}>
                    <div style={styles.resultIcon}>
                        <CheckCircle style={{ width: '40px', height: '40px', color: '#ffffff' }} />
                    </div>
                    <h2 style={styles.resultsTitle}>Carbon Footprint Result</h2>
                    
                    <div style={styles.resultValue}>
                        <div style={styles.carbonValue}>{carbonFootprint}</div>
                        <div style={styles.carbonUnit}>kg CO₂</div>
                    </div>
                    
                    <div style={styles.resultsSummary}>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Vehicle:</span>
                            <span style={styles.summaryValue}>{selectedCar.year} {selectedCar.make} {selectedCar.model}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Fuel Type:</span>
                            <span style={{ ...styles.summaryValue, textTransform: 'capitalize' }}>{fuelType}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Distance:</span>
                            <span style={styles.summaryValue}>{distance} km</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={resetCalculator}
                        style={styles.resetButton}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(to right, #047857, #059669)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(to right, #059669, #10b981)';
                        }}
                    >
                        Calculate Again
                    </button>

                                 {/* Trees required display with animation */}
                {treesRequired !== null && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ 
                            marginTop: 20,
                            padding: 15,
                            backgroundColor: '#065f46',
                            borderRadius: 8,
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            userSelect: 'none',
                        }}
                    >
                        🌳 You would need about <span style={{ fontSize: '1.5rem' }}>{treesRequired}</span> full grown tree{treesRequired > 1 ? 's' : ''} to absorb this CO₂ in a year.
                    </motion.div>
                )}
                
                </div>
            </div>
        );
    }

    // Step modals
    return (
        <div style={styles.mainContainer}>
            {currentStep === 1 && (
                <StepModal title="Select Vehicle Year" canGoBack={false}>
                    <SelectionGrid
                        items={years}
                        onSelect={handleYearSelect}
                        placeholder="Loading years..."
                    />
                </StepModal>
            )}

            {currentStep === 2 && (
                <StepModal title="Select Vehicle Make">
                    <SelectionGrid
                        items={makes}
                        onSelect={handleMakeSelect}
                        placeholder="No makes available"
                    />
                </StepModal>
            )}

            {currentStep === 3 && (
                <StepModal title="Select Vehicle Model">
                    <SelectionGrid
                        items={models}
                        onSelect={handleModelSelect}
                        placeholder="No models available"
                    />
                </StepModal>
            )}

            {currentStep === 4 && (
                <StepModal title="Select Fuel Type">
                    <div style={styles.fuelTypeContainer}>
                        {['petrol', 'diesel', 'electric'].map((fuel) => (
                            <button
                                key={fuel}
                                onClick={() => handleFuelSelect(fuel)}
                                style={{ ...styles.selectionButton, textTransform: 'capitalize' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#374151';
                                    e.target.style.borderColor = '#10b981';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#1f2937';
                                    e.target.style.borderColor = '#4b5563';
                                }}
                            >
                                {fuel}
                            </button>
                        ))}
                    </div>
                </StepModal>
            )}

            {currentStep === 5 && (
                <StepModal title="Enter Distance">
                        <div style={styles.distanceContainer}>
                        <div style={styles.inputGroup}>
                            <input
                            type="number"
                            placeholder="Enter distance"
                            style={styles.distanceInput}
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            autoFocus
                            onFocus={(e) => {
                                e.target.style.borderColor = '#10b981';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#4b5563';
                            }}
                            />
                            <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            style={styles.unitSelect}
                            >
                            <option value="km">km</option>
                            <option value="miles">miles</option>
                            </select>
                        </div>

                        <button
                            onClick={() => distance && handleDistanceSubmit(distance)}
                            disabled={!distance}
                            style={{
                            ...styles.continueButton,
                            opacity: distance ? 1 : 0.5,
                            cursor: distance ? 'pointer' : 'not-allowed'
                            }}
                            onMouseEnter={(e) => {
                            if (distance) {
                                e.target.style.background = 'linear-gradient(to right, #047857, #059669)';
                            }
                            }}
                            onMouseLeave={(e) => {
                            if (distance) {
                                e.target.style.background = 'linear-gradient(to right, #059669, #10b981)';
                            }
                            }}
                        >
                            Continue
                        </button>
                        </div>

                </StepModal>
            )}

            {currentStep === 6 && (
                <StepModal title="Calculate Carbon Footprint">
                    <div style={styles.calculateContainer}>
                        <div style={styles.summaryContainer}>
                            <h3 style={styles.summaryTitle}>Summary</h3>
                            <div style={styles.summaryDetails}>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Vehicle:</span>
                                    <span style={styles.summaryValue}>{selectedCar.year} {selectedCar.make} {selectedCar.model}</span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Fuel Type:</span>
                                    <span style={{ ...styles.summaryValue, textTransform: 'capitalize' }}>{fuelType}</span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Distance:</span>
                                    <span style={styles.summaryValue}>{distance} km</span>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={calculateCarbonFootprint}
                            disabled={isLoading}
                            style={{
                                ...styles.calculateButton,
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(to right, #047857, #059669)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(to right, #059669, #10b981)';
                                }
                            }}
                        >
                            {isLoading ? "Calculating..." : "Calculate Carbon Footprint"}
                        </button>
                    </div>


                </StepModal>
            )}

            
        </div>

        
    );
};



const styles = {
    mainContainer: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #064e3b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    dashboard: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '1024px',
        width: '100%',
        border: '1px solid #374151',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    dashboardHeader: {
        textAlign: 'center',
        marginBottom: '48px'
    },
    iconContainer: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        backgroundColor: '#059669',
        borderRadius: '50%',
        marginBottom: '16px'
    },
    headerIcon: {
        width: '32px',
        height: '32px',
        color: '#ffffff'
    },
    mainTitle: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: '16px',
        margin: '0 0 16px 0'
    },
    subtitle: {
        color: '#d1d5db',
        fontSize: '18px',
        margin: 0
    },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
    },
    stepCard: {
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #374151'
    },
    stepHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px'
    },
    stepIcon: {
        padding: '8px',
        borderRadius: '8px',
        marginRight: '12px'
    },
    stepTitle: {
        color: '#ffffff',
        fontWeight: '600'
    },
    stepDescription: {
        color: '#9ca3af',
        fontSize: '14px',
        margin: 0
    },
    completedValue: {
        marginTop: '8px',
        color: '#10b981',
        fontSize: '14px'
    },
    startButtonContainer: {
        textAlign: 'center'
    },
    startButton: {
        background: 'linear-gradient(to right, #059669, #10b981)',
        color: '#ffffff',
        padding: '16px 32px',
        borderRadius: '12px',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 50
    },
    modalContent: {
        backgroundColor: '#111827',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '448px',
        width: '100%',
        margin: '0 16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #374151'
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        margin: 0
    },
    backButton: {
        padding: '8px',
        color: '#9ca3af',
        transition: 'all 0.2s',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorMessage: {
        color: '#f87171',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(153, 27, 27, 0.2)',
        borderRadius: '8px',
        border: '1px solid #7f1d1d',
        margin: '16px 0 0 0'
    },
    selectionGrid: {
        maxHeight: '256px',
        overflowY: 'auto'
    },
    placeholder: {
        color: '#9ca3af',
        textAlign: 'center',
        padding: '32px 0'
    },
    selectionButton: {
        width: '100%',
        padding: '16px',
        textAlign: 'left',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        borderRadius: '12px',
        transition: 'all 0.2s',
        border: '1px solid #4b5563',
        cursor: 'pointer',
        marginBottom: '12px',
        fontSize: '16px'
    },
    fuelTypeContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    distanceContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    distanceInput: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #4b5563',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontSize: '16px',
        boxSizing: 'border-box'
    },
    continueButton: {
        width: '100%',
        background: 'linear-gradient(to right, #059669, #10b981)',
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        transition: 'all 0.2s',
        border: 'none',
        fontSize: '16px'
    },
    calculateContainer: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    summaryContainer: {
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #374151'
    },
    summaryTitle: {
        color: '#ffffff',
        fontWeight: '600',
        marginBottom: '16px',
        margin: '0 0 16px 0'
    },
    summaryDetails: {
        color: '#d1d5db',
        fontSize: '14px',
        textAlign: 'left'
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
    },
    summaryLabel: {
        color: '#d1d5db'
    },
    summaryValue: {
        color: '#ffffff'
    },
    calculateButton: {
        width: '100%',
        background: 'linear-gradient(to right, #059669, #10b981)',
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        transition: 'all 0.2s',
        border: 'none',
        fontSize: '16px'
    },
    resultsContainer: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '448px',
        width: '100%',
        border: '1px solid #374151',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
    },
    resultIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        backgroundColor: '#059669',
        borderRadius: '50%',
        marginBottom: '24px'
    },
    resultsTitle: {
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: '16px',
        margin: '0 0 16px 0'
    },
    resultValue: {
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #374151'
    },
    carbonValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: '8px'
    },
    carbonUnit: {
        color: '#d1d5db'
    },
    resultsSummary: {
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: '1px solid #374151',
        textAlign: 'left'
    },
    resetButton: {
        width: '100%',
        background: 'linear-gradient(to right, #059669, #10b981)',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        transition: 'all 0.2s',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    },

        inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        },

        distanceInput: {
        flex: 1,
        padding: '0.5rem',
        fontSize: '1rem',
        border: '2px solid #4b5563',
        borderRadius: '0.5rem',
        outline: 'none',
        },

        unitSelect: {
        padding: '0.5rem',
        fontSize: '1rem',
        border: '2px solid #4b5563',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        }


};

export default CarbonCalculator;