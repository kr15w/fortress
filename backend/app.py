from flask import Flask, jsonify, request, Response, render_template, session, request, url_for, redirect
import requests
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from database import DatabaseService, User

from flask_socketio import SocketIO, emit
import uuid
from game import Game
import secrets
from flask_oauthlib.client import OAuth
import string
import random
from flask_mail import Mail, Message
app = Flask(__name__)
CORS(app, supports_credentials=True)
socketio = SocketIO(app)
db = DatabaseService('sqlite:///users.db')

# Store client sessions, game rooms, active games and user tokens
clients = {}
game_rooms = {}
active_games = {}
user_tokens = {}  # user_id -> token mapping
app.config['GOOGLE_CLIENT_ID'] = ''
app.config['GOOGLE_CLIENT_SECRET'] = '
app.config['GOOGLE_DISCOVERY_URL'] = (
    "https://accounts.google.com/.well-known/openid-configuration"
)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''


# Initialize OAuth
oauth = OAuth(app)

mail = Mail(app)

verification_codes = {}


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

@app.route('/auth/google/login')
def google_login():
    return google.authorize(callback=url_for('google_callback', _external=True))

@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    resp = google.authorized_response()
    if resp is None or 'access_token' not in resp:
        return redirect('http://localhost:5173/license?error=access_denied')
    session['google_token'] = (resp['access_token'], '')
    dbSession = db.Session() 
    # Check if the user exists in your database, otherwise prompts for license key
    user_info = google.get('userinfo').data
    user = dbSession.query(User).filter_by(email=user_info['email'], username=user_info['name']).first()
    if user:
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
        response = jsonify({'message': 'Login successful'})
        response.set_cookie('access_token', access_token, httponly=True, secure=True)
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True)
        return redirect('http://localhost:5173/menu')
    
    # Generate a JWT token for the user
    payload = {
        'user_id': user_info["id"],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }

    token = jwt.encode(payload, app.secret_key, algorithm='HS256')

    # Attach token to redirect URL
    redirect_url = f'http://localhost:5173/license?token={token}'
    return redirect(redirect_url)

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')

@app.route('/api/match_demo')
def index():
    session['id'] = str(uuid.uuid4())
    clients[session['id']] = {'response': '', 'status': ''}
    return render_template('match_demo.html')

@socketio.on('connect')
def handle_connect(auth):
    session['id'] = str(uuid.uuid4())
    clients[session['id']] = {
        'response': '',
        'status': '',
        'room': None,
        'sid': request.sid
    }
    emit('update', {
        'response': clients[session['id']]['response'],
        'status': clients[session['id']]['status']
    })

@socketio.on('button_click')
def handle_button_click(data):
    emmited = False

    client_id = session['id']
    button_id = data['button_id']
    main_text = data['main_text']
    sub_text = data['sub_text']

    # Check if main_text exists in user_tokens values
    if main_text not in user_tokens.values():
        emit('update', {
            'response': 'Invalid token',
            'status': 'Please provide a valid token'
        }, room=request.sid)
        return

    # Initialize response and status for all cases
    response = ""
    status = ""
    
    if button_id == 'room_id':
        # Handle room creation/joining
        if not sub_text.strip():
            # Create new room
            room_id = str(uuid.uuid4())[:8]
            game_rooms[room_id] = [client_id]
            clients[client_id]['room'] = room_id
            response = f"Created new room: {room_id}"
            status = "Waiting for player 2"
        else:
            # Join existing room
            room_id = sub_text.strip()
            if room_id in game_rooms and len(game_rooms[room_id]) < 2:
                game_rooms[room_id].append(client_id)
                clients[client_id]['room'] = room_id
                response = f"Joined room: {room_id}"
                status = f"Player {len(game_rooms[room_id])} of 2"
            else:
                response = f"Invalid room ID or room full: {room_id}"
                status = "Try another room"

    
    elif button_id == 'rps_move':
        # Validate RPS move
        valid_moves = ['rock', 'paper', 'scissors']
        if sub_text.lower() not in valid_moves:
            response = "Invalid move! Use 'rock', 'paper' or 'scissors'"
            status = "Try again"
        else:
            # Get game instance
            room_id = clients[client_id].get('room')
            if not room_id or room_id not in active_games:
                response = "You're not in an active game"
                status = "Join a room first"
            else:
                game = active_games[room_id]
                move = sub_text.lower()
                
                # Determine player number (1 or 2)
                player_num = 1 if client_id == game_rooms[room_id][0] else 2
                
                # Submit RPS move
                both_moved = game.submit_rps(player_num, move)
                
                if not both_moved:
                    response = f"You played: {move}"
                    status = "Waiting for other player"
                else:
                    # Both players moved - determine winner
                    winner = game.determine_rps_winner()
                    
                    
                    # Include stacks in RPS result announcement for both players
                    game_state = game.get_state()

                    emmited = True
                    for i,player_id in enumerate(game_rooms[room_id]):
                        player_num = i+1
                        my_stack = game_state['player1_stack'] if player_num == 1 else game_state['player2_stack']
                        opponent_stack = game_state['player2_stack'] if player_num == 1 else game_state['player1_stack']
                        if winner is None:
                            result_msg = "It's a draw!"
                            game._clear_round_state()  # Reset for next round
                        else:
                            # Determine if current player is the winner
                            is_winner = (player_num == 1 and winner == game.player1) or (player_num == 2 and winner == game.player2)
                            result_msg = "You win! Make a move." if is_winner else "You lose! Wait for you opponent."
                        status = f"Round {game_state['round']} - You: {my_stack} vs Opponent: {opponent_stack}"
                        #print(result_msg)
                        #print(status)
                        #print(clients[player_id]['sid'])
                        emit('update', {
                            'response': result_msg,
                            'status': status
                        }, room=clients[player_id]['sid'])

                   


    
    elif button_id == 'game_move':
        # Validate game move
        valid_moves = ['shield', 'cannon', 'attack']
        if sub_text.lower() not in valid_moves:
            response = "Invalid move! Use 'shield', 'cannon' or 'attack'"
            status = "Try again"
        else:
            # Get game instance
            room_id = clients[client_id].get('room')
            if not room_id or room_id not in active_games:
                response = "You're not in an active game"
                status = "Join a room first"
            else:
                game = active_games[room_id]
                move = sub_text.lower()
                player_num = 1 if client_id == game_rooms[room_id][0] else 2
                
                # Submit move
                success = game.submit_move(player_num, move)
                
                if not success:
                    response = "You can't make a move - win an RPS round first!"
                    status = "Try again"
                else:
                    # Process the round if both players have moved
                    if game.process_round():
                        game_state = game.get_state()
                        # Notify both players
                        emmited = True
                        for i,player_id in enumerate(game_rooms[room_id]):
                            player_num = i+1
                            my_stack = game_state['player1_stack'] if player_num == 1 else game_state['player2_stack']
                            opponent_stack = game_state['player2_stack'] if player_num == 1 else game_state['player1_stack']
                            response = f"Move accepted! {move}      Make your next RPS choice."
                            status = f"Round {game_state['round']} - You: {my_stack} vs Opponent: {opponent_stack}"
                            emit('update', {
                                'response': response,
                                'status': status
                            }, room=clients[player_id]['sid'])
                    else:
                        response = f"Move accepted: {move}"
                        status = "Waiting for other player"

    if not emmited:
        # Update client data
        clients[client_id]['response'] = response
        clients[client_id]['status'] = status
        
        # Send update to client
        emit('update', {
            'response': response,
            'status': status
        }, room=request.sid)
    
    # If room has 2 players, create game instance and notify
    if button_id == 'room_id' and 'room' in clients[client_id]:
        room_id = clients[client_id]['room']
        if room_id in game_rooms and len(game_rooms[room_id]) == 2:
            # Create new game instance
            active_games[room_id] = Game()
            
            for player_id in game_rooms[room_id]:
                emit('update', {
                    'response': f"Game started in room {room_id}",
                    'status': "Player 1 vs Player 2 - Make your moves!"
                }, room=clients[player_id]['sid'])

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
    if 'license_key' not in req_data:
        return jsonify({'error': 'License key required.'}), 400
    try:
        # First validate license key
        if not db.validate_license_key(req_data['license_key']):
            return jsonify({'error': 'Invalid or already used license key.'}), 400    
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
            return jsonify({'message': 'Email or username already registered. Please use another Google account.'}), 400
        elif "license_key" in str(e):
            return jsonify({'message': 'Invalid or already used license key.'}), 400
        return jsonify({'message': f'Registration failed: {str(e)}'}), 400
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
    
    response = jsonify({'message': 'Login successful'})
    response.set_cookie('access_token', access_token, httponly=True, secure=True)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True)
    
    return response

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
        return jsonify({'message': 'Token not found'}), 404
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


if __name__ == '__main__':
    app.run(host='::', port=5000, debug=True)