from flask import Flask, jsonify, request, Response
import requests
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from database import DatabaseService

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# Initialize database
db = DatabaseService('sqlite:///users.db')

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('access_token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(*args, **kwargs)
    return decorated

# Auth routes
@app.route('/api/auth/validate_license', methods=['POST'])
def validate_license():
    data = request.get_json()
    if not data or 'license_key' not in data:
        return jsonify({'message': 'License key required'}), 400
    
    try:
        if not db.validate_license_key(data['license_key']):
            return jsonify({'message': 'Invalid or already used license key'}), 400
        return jsonify({'valid': True}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if 'license_key' not in data:
        return jsonify({'message': 'License key required'}), 400
    
    try:
        if not all(k in data for k in ['username', 'email', 'password', 'license_key']):
            return jsonify({'message': 'Missing required fields'}), 400

        # First validate license key
        if not db.validate_license_key(data['license_key']):
            return jsonify({'message': 'Invalid or already used license key'}), 400
            
        # Create user and consume license key
        user = db.create_user(data['username'], data['email'], data['password'])
        if not db.consume_license_key(data['license_key'], user.id):
            raise Exception('Failed to consume license key')
            
        return jsonify({'message': 'Registered successfully'}), 201
    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        if "UNIQUE constraint failed" in str(e) and "users.username" in str(e):
            return jsonify({'message': 'Username already taken'}), 400
        elif "UNIQUE constraint failed" in str(e) and "users.email" in str(e):
            return jsonify({'message': 'Email already registered'}), 400
        elif "license_key" in str(e):
            return jsonify({'message': 'Invalid or already used license key'}), 400
        return jsonify({'message': f'Registration failed: {str(e)}'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    auth = request.get_json()
    
    user = db.verify_user(auth['username'], auth['password'])
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Create tokens
    access_token = jwt.encode({
        'user': auth['username'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    refresh_token = jwt.encode({
        'user': auth['username'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    response = jsonify({'message': 'Login successful'})
    response.set_cookie('access_token', access_token, httponly=True, secure=True)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True)
    
    return response

# Protected route example
@app.route('/api/user/profile', methods=['GET'])
@token_required
def profile():
    return jsonify({'message': 'This is protected content'})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/'):
        return Response('Not Found', status=404)
    
    frontend_url = f'http://localhost:5173/{path}'
    try:
        resp = requests.request(
            method=request.method,
            url=frontend_url,
            headers={key: value for (key, value) in request.headers if key != 'Host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False)
        
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for (name, value) in resp.raw.headers.items()
                  if name.lower() not in excluded_headers]
        
        response = Response(resp.content, resp.status_code, headers)
        return response
    except requests.exceptions.RequestException as e:
        return Response(str(e), status=500)

if __name__ == '__main__':
    app.run(host='::', port=5000, debug=True)