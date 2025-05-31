from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

EMISSION_FACTORS = {
    "petrol": 2.31,
    "diesel": 2.68
}

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    distance = data.get("distance")  # in km
    fuel_type = data.get("fuel_type").lower()
    efficiency = data.get("efficiency")  # litres per 100km
    frequency = data.get("frequency")  # daily, weekly, monthly, yearly

    if fuel_type not in EMISSION_FACTORS:
        return jsonify({"error": "Invalid fuel type"}), 400

    multiplier = {
        "daily": 365,
        "weekly": 52,
        "monthly": 12,
        "yearly": 1
    }.get(frequency, 1)

    # Total distance over time
    total_distance = distance * multiplier
    litres_used = (total_distance * efficiency) / 100
    co2_emitted = litres_used * EMISSION_FACTORS[fuel_type]

    return jsonify({
        "total_distance": total_distance,
        "litres_used": litres_used,
        "co2_emitted": round(co2_emitted, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)
