from flask import Flask, jsonify, request
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
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        db.create_user(data['username'], data['email'], data['password'])
        return jsonify({'message': 'Registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

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

if __name__ == '__main__':
    app.run(host='::', port=5000, debug=True)