from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import json
import uuid
from game import Game
import dump_users
from database import DatabaseService, BattleHistory, User
from sqlalchemy.orm import Session
from decimal import Decimal
db = DatabaseService('sqlite:///users.db')
app = Flask(__name__)


if __name__ == '__main__':
    app.config['SECRET_KEY'] = 'secret!'
    

    
# Store connected clients
clients = {}
player_names = {}
game_rooms = {}
user_tokens= {}

def anti_cheat(session: Session, username: str):
    """Detects if a user has played against the same player 3 times in a row with a high win rate (> 0.9)."""
    # Get last 3 battles for the user (either player1 or player2)
    battles = session.query(BattleHistory).filter(
        (BattleHistory.player1 == username) | (BattleHistory.player2 == username)
    ).order_by(BattleHistory.match_id.desc()).limit(3).all()

    if len(battles) < 3:
        return False  # Not enough matches to detect patterns

    # Extract player opponent information
    opponent = battles[0].player2 if battles[0].player1 == username else battles[0].player1

    # Check if the same opponent appears in all 3 matches
    if all(
        (battle.player1 == username and battle.player2 == opponent) or
        (battle.player2 == username and battle.player1 == opponent)
        for battle in battles
    ):
        # Verify high win rate condition (> 0.9)
        if all(
            battle.player1_rpsWinrate > 0.9 or battle.player2_rpsWinrate > 0.9
            for battle in battles
        ):
            return True  # Potential cheating detected

    return False  # No suspicious behavior

@app.route('/api/match_demo')
def index():
    return render_template('match_demo.html')


socketio = SocketIO(app)
@socketio.on('connect')
def handle_connect(auth):
    print(f'Client connected: {request.sid}')
    clients[request.sid] = request.sid

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    print(f'Client disconnected: {sid}')
    clients.pop(sid, None)


def refresh(room_id, player_name, sid,result='Maunal refresh'):
    if 'game' in game_rooms[room_id]:
        game = game_rooms[room_id]['game']
        player1 = game.player1
        player2 = game.player2
        winner = game.winner
        state = game.state
        
        if player_name == game_rooms[room_id]['player1']:
            current_player = player1
            opponent = player2
            opponent_name = game_rooms[room_id]['player2']
        elif player_name == game_rooms[room_id]['player2']:
            current_player = player2
            opponent = player1
            opponent_name = game_rooms[room_id]['player1']
        else:
            print(f'Player {player_name} not found in room {room_id}')
            emit('message_from_server', f'Error: Player not found in room.', room=sid)
            return
        
        game_state = {
            'reason for refresh' : result,
            'winner': ( current_player == player1 and winner == 1 ) or ( current_player == player2 and winner == 2 )  ,
            'state': state,
            'current_player_health': current_player.health,
            'current_player_weaponry': current_player.weaponry,
            'opponent_health': opponent.health,
            'opponent_weaponry': opponent.weaponry,
            'opponent_id' : opponent_name,
            'opponent_name' : dump_users.id_to_name(opponent_name)
         }
        
        emit('game_state_refresh', game_state, room=sid)
    else:
        print(f'Game instance not found for room {room_id}')
        emit('message_from_server', f'Error: Game instance not found.', room=sid)
        return


@socketio.on('message_from_client')
def handle_message(data):
    try:
        message = json.loads(data)
        if 'player_name' in message:
            if not message['player_name'] in user_tokens.values():
                emit('message_from_server', f'Invalid_token', room=request.sid)
                return

            message['player_name'] = message['player_name'].split('_')[0]

            player_names[message['player_name']] = request.sid
            print(f'Player {message["player_name"]} connected with SID: {request.sid}')
            
            room_id = message.get('room_id', '')
            if not room_id:
                room_id = str(uuid.uuid4())[:4]
                print(f'Generated room ID: {room_id}')
                game_rooms[room_id] = {'player1': message['player_name']}
                print(f'Added room {room_id} with player1: {message["player_name"]}')
                emit('message_from_server', f'Room Created: {room_id}', room=request.sid)
            else:
                if room_id in game_rooms:
                    if message['player_name'] in game_rooms[room_id].values():
                        print(f'Player {message["player_name"]} is already in room {room_id}')
                        
                        # Extract action and value from the message
                        action = message.get('action')
                        value = message.get('value')
                        
                        if action == 'refresh':
                            player_name = message['player_name']
                            refresh(room_id, player_name, request.sid)

                        elif action != None and value != None:

                            # Determine if the current player is player 1 or player 2
                            if message['player_name'] == game_rooms[room_id]['player1']:
                                player = game_rooms[room_id]['game'].player1
                            elif message['player_name'] == game_rooms[room_id]['player2']:
                                player = game_rooms[room_id]['game'].player2
                            else:
                                print(f'Player {message["player_name"]} not found in room {room_id}')
                                emit('message_from_server', f'Error: Player not found in room.', room=request.sid)
                                return
                                                                                     
                            if 'game' in game_rooms[room_id]:
                                game = game_rooms[room_id]['game']
                                need_refresh, result = game.update_state(player, action, value)

                                # Check if game has ended
                                if game.state == 2:
                                    if game.winner == 1:
                                        dbSession = db.Session()
                                        winner_username = dump_users.id_to_name(game_rooms[room_id]['player1'])
                                        loser_username = dump_users.id_to_name(game_rooms[room_id]['player2'])
                                        player1_rpsWinrate = round(Decimal(game.player1.rpsWin) / Decimal(game.player1.rpsWin + game.player2.rpsWin), 2)
                                        player2_rpsWinrate = round(Decimal(game.player2.rpsWin) / Decimal(game.player1.rpsWin + game.player2.rpsWin), 2)
                                        db.add_match_history(winner_username, loser_username, player1_rpsWinrate, player2_rpsWinrate, winner_username)
                                        if anti_cheat(dbSession, winner_username):
                                            victim = dbSession.query(User).filter_by(username=winner_username).first()
                                            if victim:
                                                victim.banned = True  
                                                dbSession.commit()  
                                                print(f"User {victim.username} is now banned.")
                                        if anti_cheat(dbSession, loser_username):
                                            victim = dbSession.query(User).filter_by(username=loser_username).first()
                                            if victim:
                                                victim.banned = True  
                                                dbSession.commit()  
                                                print(f"User {victim.username} is now banned.")

                                    elif game.winner == 2:
                                        winner_username = dump_users.id_to_name(game_rooms[room_id]['player2'])
                                        loser_username = dump_users.id_to_name(game_rooms[room_id]['player1'])
                                        winner_player = game.player2
                                        loser_player = game.player1
                                    for username, player in [(winner_username, winner_player), (loser_username, loser_player)]:
                                        db.increment_count(username, getattr(player, 'weapond_deployed', 0), 'bomb')
                                        db.increment_count(username, getattr(player, 'shields_deployed', 0), 'shield')
                                    
                                    # Update win/loss counts
                                    db.increment_count(winner_username, 1, 'win')
                                    db.increment_count(loser_username, 1, 'lose')


                                if need_refresh:
                                    refresh(room_id, game_rooms[room_id]['player1'], player_names[game_rooms[room_id]['player1']],result)
                                    refresh(room_id, game_rooms[room_id]['player2'], player_names[game_rooms[room_id]['player2']],result)

                            else:
                                print(f'Game instance not found for room {room_id}')
                                emit('message_from_server', f'Error: Game instance not found.', room=request.sid)
                                return
                                                                                     
                            # Send the result back to the client
                            emit('message_from_server', result, room=request.sid)
                        
                        else:
                            print(f'Missing action or value in message from player {message["player_name"]}')
                            print(action,value)
                            emit('message_from_server', f'Error: Missing action or value in message.', room=request.sid)
                    elif 'player2' in game_rooms[room_id]:
                        emit('message_from_server', f'Error: Room {room_id} already has two players.', room=request.sid)
                    else:
                        game_rooms[room_id]['player2'] = message['player_name']
                        print(f'Added player2 {message["player_name"]} to room {room_id}')
                        
                        # Create a Game instance and store it in game_rooms
                        game_rooms[room_id]['game'] = Game()
                        print(f'Created game instance for room {room_id}')
                        
                        result = "Both player joined"
                        emit('message_from_server', f'Joined room: {room_id}', room=request.sid)
                        refresh(room_id, game_rooms[room_id]['player1'], player_names[game_rooms[room_id]['player1']],result)
                        refresh(room_id, game_rooms[room_id]['player2'], player_names[game_rooms[room_id]['player2']],result)
                else:
                    emit('message_from_server', f'Error: Room {room_id} does not exist.', room=request.sid)
        else:
            print(f'Received message from {request.sid} without player_name: {message}')
    except json.JSONDecodeError as e:
        print(f'Invalid JSON received from {request.sid}: {e}')
        emit('message_from_server', f'Invalid JSON received: {data}', room=request.sid)

if __name__ == '__main__':
    socketio.run(app, debug=True)