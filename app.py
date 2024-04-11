from flask import jsonify, request, render_template, redirect, Flask
import json
import urllib.parse
import urllib.request
from dbhelper import DBHelper

WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid=89dc97f0c6395963e871b84d4aad6c70"
CURRENCY_URL = "https://openexchangerates.org//api/latest.json?app_id=39132b4e3b464267a47355fa8a3dd095"

DEFAULTS = {'publication': 'bbc', 'city': 'London,UK', 'currency_from': 'GBP', 'currency_to': 'USD'}

app = Flask(__name__)
db = DBHelper()


@app.route('/')
def index():
    # Get customized weather based on user input or default
    city = request.args.get('city')
    if not city:
        city = DEFAULTS['city']
    weather = get_weather(city)

    # Get customized currency based on user input or default
    currency_from = request.args.get("currency_from")
    if not currency_from:
        currency_from = DEFAULTS['currency_from']
    currency_to = request.args.get("currency_to")
    if not currency_to:
        currency_to = DEFAULTS['currency_to']
    rate = get_rate(currency_from, currency_to)

    # Get all staff data or filtered by city
    staff = []
    search_city = request.args.get('search_city')
    if search_city:
        staff = db.get_staff_by_city(search_city)
    else:
        staff = db.get_all_staff()

    return render_template('index.html',
                           weather=weather,
                           currency_from=currency_from,
                           currency_to=currency_to,
                           rate=rate,
                           staff_data=staff)

@app.route('/get_staff_by_city')
def get_staff_by_city():
    city = request.args.get('city')
    if city:
        staff = db.get_staff_by_city(city)
        return jsonify(staff)
    else:
        return jsonify([])
    
 
@app.route('/add_staff', methods=['POST'])
def add_staff():
    # Define required fields
    required_fields = ['full_name', 'birthdate', 'social_insurance_number', 'employee_id', 'phone_number', 'address', 'city', 'postal_code', 'latitude', 'longitude']

    # Check if all required fields are present
    missing_fields = [field for field in required_fields if field not in request.form]
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    # Retrieve form data
    full_name = request.form['full_name']
    birthdate = request.form['birthdate']
    social_insurance_number = request.form['social_insurance_number']
    employee_id = request.form['employee_id']
    phone_number = request.form['phone_number']
    address = request.form['address']
    city = request.form['city']
    postal_code = request.form['postal_code']
    latitude = request.form['latitude']
    longitude = request.form['longitude']

    # Add staff to the database
    db.add_staff(full_name, birthdate, social_insurance_number, employee_id, phone_number, address, city, postal_code, latitude, longitude)

    # Redirect back to the homepage
    return redirect('/')

@app.route('/delete_staff/<int:employee_id>', methods=['POST'])
def delete_staff(employee_id):
    # Delete staff from the database
    db.delete_staff(employee_id)

    # Redirect back to the homepage
    return redirect('/')



@app.route('/update_staff/<int:employee_id>', methods=['GET'])
def get_staff_for_update(employee_id):
    # Fetch staff data from the database
    staff_data = db.get_staff_by_id(employee_id)

    if staff_data:
        return jsonify(staff_data[0])
    else:
        return jsonify({}), 404



@app.route('/update_staff', methods=['POST'])
def update_staff():
    try:
        # Retrieve form data
        employee_id = request.form.get('employee_id')
        full_name = request.form.get('full_name')
        birthdate = request.form.get('birthdate')
        social_insurance_number = request.form.get('social_insurance_number')
        phone_number = request.form.get('phone_number')
        address = request.form.get('address')
        city = request.form.get('city')
        postal_code = request.form.get('postal_code')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')

        # Print received values for debugging
        print("Received values:", employee_id, full_name, birthdate, social_insurance_number, phone_number, address, city, postal_code, latitude, longitude)

        # Update staff information in the database
        db.update_staff(employee_id, full_name, birthdate, social_insurance_number, phone_number, address, city, postal_code, latitude, longitude)
        
        # Return success response
        return jsonify({'success': True})
    except Exception as e:
        # Log the error
        print(f"Error updating staff: {e}")
        # Return error response
        return jsonify({'success': False, 'error': str(e)}), 500


def get_weather(query):
    query = urllib.parse.quote(query)
    url = WEATHER_URL.format(query)
    data = urllib.request.urlopen(url).read()
    parsed = json.loads(data)
    weather = None
    if parsed.get('weather'):
        weather = {'description': parsed['weather'][0]['description'],
                   'temperature': round(parsed['main']['temp']),
                   'city': parsed['name'],
                   'country': parsed['sys']['country']
                   }
    return weather


def get_rate(frm, to):
    all_currency = urllib.request.urlopen(CURRENCY_URL).read()
    parsed = json.loads(all_currency).get('rates')
    frm_rate = parsed.get(frm.upper())
    to_rate = parsed.get(to.upper())
    return to_rate / frm_rate


if __name__ == '__main__':
    app.run(debug=True, port=5001)