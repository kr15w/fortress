import json
import random
import time
from mock_browser_client import Mock_Browser_Client

def main():
    # Create clients for both players
    client1 = Mock_Browser_Client("http://127.0.0.1:5000")
    client2 = Mock_Browser_Client("http://127.0.0.1:5000")
    
    try:
        # Setup both browsers
        browser1 = client1.create_browser()
        browser2 = client2.create_browser()
        
        # Login both players
        success1, _ = client1.login("testuser_3", "testpassword")
        success2, _ = client2.login("testuser_5", "testpassword")
        
        if not success1 or not success2:
            print("Login failed for one or both players")
            return False

        # Player 1 creates room
        if not client1.go_to_match_demo() or not client1.press_button("joinRoomButton"):
            print("Player 1 failed to create room")
            return False
            
        room_id = client1.get_room_id()
        print(f"Room created with ID: {room_id}")

        # Player 2 joins room
        if not (client2.go_to_match_demo() and 
                client2.set_text_field("roomId", room_id) and 
                client2.press_button("joinRoomButton")):
            print("Player 2 failed to join room")
            return False

        # Both players ready up
        if not (client1.press_button("readyButton") and 
                client2.press_button("readyButton")):
            print("Failed to ready up players")
            return False

        print("Both players ready - game starting")

        # Main game loop
        while True:
            time.sleep(0.3)  # Throttle requests
            
            # Process Player 1
            game_state1 = json.loads(client1.get_game_state())
            if not game_state1.get("game_started", False):
                continue
                
            if game_state1["state"] == 2:  # Game ended
                if game_state1.get("winner", False):
                    game_winner = 1
                else:
                    game_winner = 2
                break
                 
                
            process_player_turn(client1, game_state1)
            
            # Process Player 2
            game_state2 = json.loads(client2.get_game_state())

                
            process_player_turn(client2, game_state2)

        print("Game ended")
        client1.close_browser()
        client2.close_browser()
        return game_winner

    except exception as e:
        print(e)
        client1.close_browser()
        client2.close_browser()
        return False

def process_player_turn(client, game_state):
    if game_state["state"] == 0:  # RPS phase
        # Pick random RPS move
        moves = ["rockButton", "paperButton", "scissorsButton"]
        client.press_button(random.choice(moves))
        
    elif game_state["state"] == 1 and game_state.get("winner", False):
        # We won the RPS round, choose action
        while True:
            action = random.choice(["buildHealth", "buildWeapon", "upgrade", "attack", "upgrade", "attack", "attack"])

        
            if action == "buildHealth":
                client.press_button("buildHealthButton")
                return
            elif action == "buildWeapon":
                client.press_button("buildWeaponButton")
                return
            elif action == "upgrade":
                if game_state["current_player_weaponry"]:
                    weapon_idx = random.randrange(len(game_state["current_player_weaponry"]))
                    client.set_text_field("weaponIndex", str(weapon_idx))
                    client.press_button("upgradeButton")
                    return
            elif action == "attack":
                if game_state["current_player_weaponry"]:
                    weapon_idx = random.randrange(len(game_state["current_player_weaponry"]))
                    client.set_text_field("weaponIndex", str(weapon_idx))
                    
                    # Choose target (80/20 health vs weapon if available)
                    if game_state["opponent_weaponry"] and random.random() < 0.2:
                        target = str(random.randrange(len(game_state["opponent_weaponry"])))
                    else:
                        target = "h"  # Attack health
                        
                    client.set_text_field("targetList", target)
                    client.press_button("attackButton")
                    return

if __name__ == "__main__":
    print(f"Winner: {main()}")