from flask import Flask, jsonify, request, Response, render_template, session, request, url_for, redirect
import flask
import requests
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from database import DatabaseService, User, BattleHistory

from flask_socketio import SocketIO, emit
import uuid
from game import Game
import secrets
from flask_oauthlib.client import OAuth
import string
import random
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

import game_flask
from game_flask import *

CORS(app, supports_credentials=True)
db = DatabaseService('sqlite:///users.db')

# Store client sessions, game rooms, active games and user tokens
clients = {}
user_tokens = {}  # user_id -> token mapping
game_flask.user_tokens = user_tokens

app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_DISCOVERY_URL'] = (
    "https://accounts.google.com/.well-known/openid-configuration"
)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
# Initialize OAuth
oauth = OAuth(app)

mail = Mail(app)

verification_codes = {}


try:

    # Configure Google OAuth
    google = oauth.remote_app(
        'google',
        consumer_key=app.config['GOOGLE_CLIENT_ID'],
        consumer_secret=app.config['GOOGLE_CLIENT_SECRET'],
        request_token_params={
            'scope': 'email profile',
        },
        base_url='https://www.googleapis.com/oauth2/v1/',
        request_token_url=None,
        access_token_url='https://accounts.google.com/o/oauth2/token',
        authorize_url='https://accounts.google.com/o/oauth2/auth',
    )

    @google.tokengetter
    def get_google_oauth_token():
        return flask.session.get('google_token')
except:
    google = None
    print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    print("Please input google private key, googl login is not functining")
    print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

@app.route('/auth/google/login')
def google_login():
    return google.authorize(callback=url_for('google_callback', _external=True))

@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    resp = google.authorized_response()
    if resp is None or 'access_token' not in resp:
        return redirect('http://localhost:5173/license?error=access_denied')

    flask.session['google_token'] = (resp['access_token'], '')
    dbSession = db.Session()

    # Get user info from Google OAuth
    user_info = google.get('userinfo').data
    user = dbSession.query(User).filter_by(email=user_info['email'], username=user_info['name']).first()

    if user:
        if user.banned:
            return redirect('http://localhost:5173/account-banned')

        access_token = jwt.encode({
            'user': user_info['name'],
            'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'])

        refresh_token = jwt.encode({
            'user': user_info['name'],
            'exp': datetime.datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'])

        # Generate game token
        game_token = f"{user.id}_{secrets.token_hex(16)}"
        user_tokens[user.id] = game_token

        # Redirect to /processing and pass username
        redirect_url = f"http://localhost:5173/processing?username={user_info['name']}"
        return redirect(redirect_url)

    # Generate JWT for license check
    payload = {
        'user_id': user_info["id"],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, app.secret_key, algorithm='HS256')

    # Attach token to redirect URL for licensing
    return redirect(f'http://localhost:5173/license?token={token}')

'''
@app.route('/api/match_demo')
def index():
    session['id'] = str(uuid.uuid4())
    clients[session['id']] = {'response': '', 'status': ''}
    return render_template('match_demo.html')
'''


# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# Initialize database


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

@app.route('/api/auth/license', methods=['POST', 'GET'])
def license_check():
    db = DatabaseService('sqlite:///users.db')
    
    req_data = request.get_json()
    user_info = google.get('userinfo').data
    username = user_info['name']
    if 'license_key' not in req_data:
        return jsonify({'error': 'License key required.', 'username': username}), 400
    try:
        # First validate license key
        if not db.validate_license_key(req_data['license_key']):
            return jsonify({'error': 'Invalid or already used license key.', 'username': username}), 400    
        # Check if the user exists in your database, otherwise create a new user
        session_obj = db.Session()
            # Create a new user if not found
        hashed_password = generate_password_hash(secrets.token_urlsafe(16))  # Placeholder password
        user = User(
            username=user_info['name'],
            email=user_info['email'],
            password_hash=hashed_password,  
            created_at=datetime.datetime.utcnow()
        )
        session_obj.add(user)
        session_obj.commit()

        # Create user and consume license key
        if not db.consume_license_key(req_data['license_key'], user.id):
            raise Exception('Failed to consume license key.')

    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        if "UNIQUE constraint failed" in str(e) and "users.email" in str(e):
            return jsonify({'message': 'Email or username already registered. Please use another Google account.', 'username': username}), 400
        elif "license_key" in str(e):
            return jsonify({'message': 'Invalid or already used license key.', 'username': username}), 400
        return jsonify({'message': f'Registration failed: {str(e)}', 'username': username}), 400
    access_token = jwt.encode({
        'user': user_info['name'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    refresh_token = jwt.encode({
        'user': user_info['name'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    # Generate and store game token
    
    game_token = f"{user.id}_{secrets.token_hex(16)}"
    user_tokens[user.id] = game_token
    
    response = jsonify({'message': 'Login successful', 'id': user.id})
    response.set_cookie('access_token', access_token, httponly=True, secure=True)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True)
    
    return response

@app.route('/api/auth/login', methods=['POST'])
def login():
    auth = request.get_json()
    
    user = db.verify_user(auth['username'], auth['password'])
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    if user.banned == True:
        return redirect('http://localhost:5173/account-banned')
    # Create tokens
    access_token = jwt.encode({
        'user': auth['username'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    refresh_token = jwt.encode({
        'user': auth['username'],
        'exp': datetime.datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    # Generate and store game token
    
    game_token = f"{user.id}_{secrets.token_hex(16)}"
    user_tokens[user.id] = game_token
    
    response = jsonify({'message': 'Login successful'})
    response.set_cookie('access_token', access_token, httponly=True, secure=True)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True)
    
    return response

# Token endpoint
@app.route('/api/token', methods=['GET'])
@token_required
def get_token():
    token = request.cookies.get('access_token')
    data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    user = db.get_user_by_username(data['user'])
    if user.id not in user_tokens:
        return jsonify({'token': 'No token, please login'}), 404
    return jsonify({'token': user_tokens[user.id]}), 200

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

@app.route('/api/auth/send-reset-code', methods=['POST'])
def send_reset_code():
    req_data = request.get_json()
    email = req_data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Check if the email exists in the database
    try:
        db = DatabaseService('sqlite:///users.db')  # Replace with your DB connection
        session = db.Session()  # Create a DB session
        user = session.query(User).filter_by(email=email).first()

        if not user:  # No user found
            return jsonify({'error': 'Email not found in database'}), 404
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    # Generate a verification code
    code = ''.join(random.choices(string.digits, k=6))
    verification_codes[email] = code

    # Send the email
    try:
        msg = Message('Password Reset Code', sender='your_email@gmail.com', recipients=[email])
        msg.body = f'Your verification code is: {code}'
        mail.send(msg)
        return jsonify({'message': 'Verification code sent to email.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/change-password', methods=['POST'])
def change_password():
    req_data = request.get_json()
    email = req_data.get('email')
    code = req_data.get('code')
    new_password = req_data.get('newPassword')

    if not email or not code or not new_password:
        return jsonify({'error': 'All fields are required'}), 400

    # Verify code
    if verification_codes.get(email) != code:
        return jsonify({'error': 'Invalid or expired verification code'}), 400

    # Update password in database
    try:
        db = DatabaseService('sqlite:///users.db')
        session = db.Session()
        user = session.query(User).filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        hashed_password = generate_password_hash(new_password)
        user.password_hash = hashed_password
        session.commit()

        # Remove the verification code
        del verification_codes[email]
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile/<int:user_id>/', methods=['GET'])
def get_user_profile(user_id):
    session = db.Session()
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch user data
        profile = {
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "win_count": user.win_count,
            "loss_count": user.loss_count,
            "total_bomb_count": user.total_bomb_count,
            "total_shield_count": user.total_shield_count,
        }

        return jsonify(profile)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/user-stats', methods=['GET'])
def get_user_stats():
    session = db.Session()
    try:
        users = session.query(User).all()
        user_stats = [
            {   
                "id": user.id,
                "username": user.username,
                "win_count": user.win_count,
                "loss_count": user.loss_count,
                "total_bomb_count": user.total_bomb_count,
                "total_shield_count": user.total_shield_count
            }
            for user in users
        ]
        print(user_stats)  # Debugging line to check the output
        return jsonify(user_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/edit', methods=['POST'])
def edit_user():
    data = request.get_json()
    db = DatabaseService('sqlite:///users.db')  

    # Validate required fields
    if not all(k in data for k in ['current_username', 'new_username', 'new_email']):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        # Use `db` to check if the user exists
        session = db.Session()
        user = session.query(User).filter_by(username=data['current_username']).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # **IMPORTANT:** Call `db.is_username_taken()` instead of `session.is_username_taken()`
        if db.is_username_taken(data['new_username']) and data['new_username'] != data['current_username']:
            return jsonify({'message': 'Username already taken'}), 400

        if db.is_email_taken(data['new_email']) and data['new_email'] != user.email:
            return jsonify({'message': 'Email already registered'}), 400

        # Update user details
        success = db.update_user(data['current_username'], data['new_username'], data['new_email'])
        if not success:
            raise Exception('Failed to update user details')

        return jsonify({'message': 'User details updated successfully'}), 200
    
    except Exception as e:
        app.logger.error(f"Edit user error: {str(e)}")
        return jsonify({'message': f'Failed to update user details: {str(e)}'}), 400
    
@app.route('/api/battle-history/<user_id>', methods=['GET'])
def get_battle_history(user_id):
    db = DatabaseService('sqlite:///users.db')
    session = db.Session()
    user = session.query(User).filter_by(id=user_id).first()
    battle_history = session.query(BattleHistory)
    battle_history = battle_history.filter(
        (BattleHistory.player1 == user.username) | (BattleHistory.player2 == user.username)
    ).limit(10).all()
    
    return jsonify([
        {
            "match_id": battle.MatchId,
            "match_end_time": battle.match_end_time,
            "player1": battle.player1,
            "player2": battle.player2,
            "winner": battle.winner
        } for battle in battle_history
    ])

if __name__ == '__main__':
    app.run(host='::', port=5000, debug=True)