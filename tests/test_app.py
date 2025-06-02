import pytest
from unittest.mock import patch, Mock
from carbon_footprint.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Helper mock response for XML data
def mock_xml_response(text):
    mock_resp = Mock()
    mock_resp.status_code = 200
    mock_resp.text = text
    return mock_resp

@patch("carbon_footprint.app.requests.get")
def test_get_car_makes(mock_get, client):
    # Mock a sample XML response for car makes
    xml_data = """
    <menuItems>
        <menuItem><text>Toyota</text></menuItem>
        <menuItem><text>Ford</text></menuItem>
    </menuItems>
    """
    mock_get.return_value = mock_xml_response(xml_data)
    
    response = client.get('/car_makes?year=2020')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert "Toyota" in data

@patch("carbon_footprint.app.requests.get")
def test_get_car_models(mock_get, client):
    xml_data = """
    <menuItems>
        <menuItem><text>Camry</text></menuItem>
        <menuItem><text>Corolla</text></menuItem>
    </menuItems>
    """
    mock_get.return_value = mock_xml_response(xml_data)

    response = client.get('/car_models?year=2020&make=Toyota')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert "Camry" in data

@patch("carbon_footprint.app.requests.get")
def test_get_fuel_efficiency(mock_get, client):
    xml_data = """
    <menuItems>
        <menuItem>
            <text>25 MPG</text>
            <value>1</value>
        </menuItem>
        <menuItem>
            <text>30 MPG</text>
            <value>2</value>
        </menuItem>
    </menuItems>
    """
    mock_get.return_value = mock_xml_response(xml_data)

    response = client.post('/fuel_efficiency', json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert "fuel_efficiency_options" in data
    assert isinstance(data["fuel_efficiency_options"], list)
    assert any(option["description"] == "25 MPG" for option in data["fuel_efficiency_options"])

@patch("carbon_footprint.app.requests.get")
def test_calculate_carbon_footprint(mock_get, client):
    xml_data = """
    <menuItems>
        <menuItem>
            <text>25 MPG</text>
        </menuItem>
    </menuItems>
    """
    mock_get.return_value = mock_xml_response(xml_data)

    response = client.post('/carbon_footprint', json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry",
        "fuel_type": "petrol",
        "distance": 100,
        "unit": "miles"
    })
    assert response.status_code == 200
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
