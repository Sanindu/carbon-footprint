import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
import xml.etree.ElementTree as ET
import re
import logging
import toml

# ----------------------------
# Utility Function
# ----------------------------
def extract_mpg(text, logger):
    """
    Extracts numeric fuel efficiency (MPG) from a descriptive string.
    """
    match = re.search(r"(\d+(\.\d+)?)", text)
    logger.info(f"Extracted MPG from text '{text}': {match.group(1) if match else 'None'}")
    return float(match.group(1)) if match else None

# ----------------------------
# Application Factory
# ----------------------------
def create_app(config_filename="basic_config.toml"):
    # Load Configuration
    config_path = os.path.join(os.path.dirname(__file__), config_filename)
    config = toml.load(config_path)

    # Create Flask app instance
    app = Flask(__name__)

    # Configure app
    app.config["CACHE_TYPE"] = config["flask"]["cache_type"]
    app.config["CACHE_DEFAULT_TIMEOUT"] = config["flask"]["cache_default_timeout"]
    app.config["DEBUG"] = config["flask"]["debug"]

    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Initialise extensions
    CORS(app, supports_credentials=True)
    cache = Cache(app)

    # Load base URLs and emission factors
    BASE_URL = config["api"]["base_url"]
    BASE_URL2 = config["api"]["base_url2"]
    EMISSION_FACTORS = config["emission_factors"]

    # ----------------------------
    # API Routes
    # ----------------------------

    @app.route('/carbon_footprint', methods=['POST'])
    def calculate_carbon_footprint():
        data = request.json
        year = data.get("year")
        make = data.get("make")
        model = data.get("model")
        fuel_type = data.get("fuel_type")
        distance = data.get("distance")
        unit = data.get("unit", "miles").lower()

        logger.info(f"Request: {year=} {make=} {model=} {fuel_type=} {distance=} {unit=}")

        if fuel_type not in EMISSION_FACTORS:
            return jsonify({"error": f"Unsupported fuel type: {fuel_type}"}), 400

        try:
            response = requests.get(f"{BASE_URL2}?year={year}&make={make}&model={model}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return jsonify({"error": "Failed to fetch vehicle data"}), 500

        if response.status_code == 200 and response.text.strip():
            root = ET.fromstring(response.text)
            efficiency_data = [item.find("text").text for item in root.findall("menuItem")]

            if not efficiency_data:
                return jsonify({"error": "No fuel efficiency data available"}), 404

            fuel_efficiency = extract_mpg(efficiency_data[0], logger)
            if not fuel_efficiency:
                return jsonify({"error": "Failed to extract fuel efficiency"}), 500

            if unit == "km":
                distance *= 0.621371  # Convert km to miles

            carbon_emissions = (distance / fuel_efficiency) * EMISSION_FACTORS[fuel_type]
            return jsonify({"carbon_footprint_kg": round(carbon_emissions, 2)})

        return jsonify({"error": "Failed to fetch vehicle data"}), 500

    @app.route('/car_makes', methods=['GET'])
    @cache.cached()
    def get_car_makes():
        year = request.args.get("year")

        try:
            response = requests.get(f"{BASE_URL}/make?year={year}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch car makes: {e}")
            return jsonify({"error": "Failed to fetch car makes"}), 500

        if response.status_code == 200:
            root = ET.fromstring(response.text)
            makes = [item.find("text").text for item in root.findall("menuItem")]
            return jsonify(makes)

        return jsonify({"error": "Failed to fetch car makes", "status_code": response.status_code}), 500

    @app.route('/car_models', methods=['GET'])
    def get_car_models():
        year = request.args.get("year")
        make = request.args.get("make")

        try:
            response = requests.get(f"{BASE_URL}/model?year={year}&make={make}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch car models: {e}")
            return jsonify({"error": "Failed to fetch car models"}), 500

        if response.status_code == 200:
            root = ET.fromstring(response.text)
            models = [item.find("text").text for item in root.findall("menuItem")]
            return jsonify(models)

        return jsonify({"error": "Failed to fetch car models", "status_code": response.status_code}), 500

    @app.route('/fuel_efficiency', methods=['POST'])
    def get_fuel_efficiency():
        data = request.json
        year = data.get("year")
        make = data.get("make")
        model = data.get("model")

        try:
            response = requests.get(f"{BASE_URL2}?year={year}&make={make}&model={model}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch fuel efficiency: {e}")
            return jsonify({"error": "Failed to fetch fuel efficiency"}), 500

        if response.status_code == 200 and response.text.strip():
            root = ET.fromstring(response.text)
            efficiency_options = [
                {"description": item.find("text").text, "id": item.find("value").text}
                for item in root.findall("menuItem")
            ]
            return jsonify({"fuel_efficiency_options": efficiency_options})

        return jsonify({"error": "No fuel efficiency data found"}), 404

    return app


# ----------------------------
# Run Server
# ----------------------------
if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000)
