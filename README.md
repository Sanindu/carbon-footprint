# Car Carbon Footprint Calculator

A Python Flask + React web application to calculate and visualise carbon footprint data.
This app estimates the carbon footprint of a car journey based on vehicle details and the distance travelled. It uses official vehicle fuel efficiency data to calculate how much CO₂ (in kilograms) is emitted. Also at the end it shows the approximate number of full grown trees required to absorb that amount of CO₂ in a year.  
This project includes a REST API backend with unit tests and a CI/CD pipeline powered by GitHub Actions. Also it is designed using Application Factory Pattern software design approach.

---
[Here is the live link to the project. Try it out.](https://carbonfootprint.sanindu.co.uk/)
---

## Features

- REST API to submit and retrieve carbon footprint data
- Python Flask backend with clear modular structure
- React frontend with user-friendly interface to visualise and input data
- Automated testing with `pytest`
- Continuous Integration and Deployment using GitHub Actions

---
# How the Calculations Work

## 1. Input Parameters

The main calculation accepts the following inputs via a POST request in JSON format:

- **year**: The car’s manufacturing year (e.g 2015)  
- **make**: Car manufacturer (e.g Toyota)  
- **model**: Car model (e.g Corolla)  
- **fuel_type**: Type of fuel used (e.g petrol)  
- **distance**: Distance travelled during the trip  
- **unit**: Unit for distance, either "miles" or "km"

---

## 2. Fetching Vehicle Fuel Efficiency

- The app sends a request to an external data source:  
  `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options`  
  using the provided car year, make, and model.  

- The response contains XML data listing different fuel efficiency options for the vehicle.  

- The app extracts the fuel efficiency value, typically measured in miles per gallon (MPG).

---

## 3. Unit Conversion

- If the user provides the distance in kilometres, the app converts it to miles because the fuel efficiency data is in miles per gallon.  

- **Conversion factor:** 1 km = 0.621371 miles.

---

## 4. Carbon Footprint Calculation

- The app uses predefined emission factors (`EMISSION_FACTORS`) for each fuel type, representing kilograms of CO₂ emitted per gallon of fuel burned.  

- The carbon footprint is calculated using the formula:

\[
\text{Carbon Emissions (kg)} = \left(\frac{\text{Distance (miles)}}{\text{Fuel Efficiency (MPG)}}\right) \times \text{Emission Factor (kg CO₂/gallon)}
\]

- In simple terms:  

  - Divide the distance travelled by how many miles the car can go per gallon — this gives gallons of fuel consumed.  
  - Multiply the gallons by the carbon emissions per gallon to get total CO₂ emissions.

---

## 5. Output

- The endpoint returns the carbon footprint rounded to two decimal places in kilograms (kg).  

- Additionally, it provides an estimate of the number of fully grown trees required to absorb that amount of CO₂ in a year (assuming one tree absorbs about 21 kg of CO₂ annually).
---
## Getting Started

### Prerequisites

- Python 3.11+
- `pip` package manager
- Node.js 
- `npm` or `yarn` package manager
### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sanindu/carbon-footprint.git
   cd src/carbon_footprint
   ```

2. Create and activate a virtual environment (recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

---

## Running the Application

To start the Flask application locally:

```bash
python src/carbon_footprint/app.py
```

By default, the app will run on `http://127.0.0.1:5000/`.

---

To start the React application locally:

```bash
cd frontend/carbon-footprint/
npm install
npm start
```

By default, the app will run on `http://127.0.0.1:3000/`.

---

## Running Tests

Tests are written using `pytest`. To run the tests:

```bash
cd tests/
pytest
```

---

## CI/CD with GitHub Actions

This project uses GitHub Actions to automatically:

- Install dependencies
- Run tests on each push or pull request to the `main` branch

You can see the workflow file under `.github/workflows/python-app.yml`.

Test results and logs will be available on the **Actions** tab in the GitHub repository.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

Sanindu Rathnayake  
Email: [rathnayakesanindu99@gmail.com]  
GitHub: [Sanindu](https://github.com/Sanindu)  
