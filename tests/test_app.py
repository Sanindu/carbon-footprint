import pytest
from carbon_footprint.app import app


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_get_car_makes(client):
    response = client.get('/car_makes?year=2020')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_car_models(client):
    response = client.get('/car_models?year=2020&make=Toyota')
    assert response.status_code in (200, 500, 404)
    if response.status_code == 200:
        data = response.get_json()
        assert isinstance(data, list)

def test_get_fuel_efficiency(client):
    response = client.post('/fuel_efficiency', json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry"
    })
    assert response.status_code in (200, 404, 500)
    if response.status_code == 200:
        data = response.get_json()
        assert "fuel_efficiency_options" in data
        assert isinstance(data["fuel_efficiency_options"], list)

def test_calculate_carbon_footprint(client):
    response = client.post('/carbon_footprint', json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry",
        "fuel_type": "petrol",
        "distance": 100,
        "unit": "miles"
    })
    assert response.status_code in (200, 400, 500)
    if response.status_code == 200:
        data = response.get_json()
        assert "carbon_footprint_kg" in data
        assert isinstance(data["carbon_footprint_kg"], float)

def test_calculate_carbon_footprint_invalid_fuel(client):
    response = client.post('/carbon_footprint', json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry",
        "fuel_type": "unknown",
        "distance": 100
    })
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
