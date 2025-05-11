import json
import random
import time
from mock_browser_client import Mock_Browser_Client

def random_test():
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

def deterministic_test():
    try:
        # Step 1: Login test users
        client1 = Mock_Browser_Client("http://127.0.0.1:5000")
        client2 = Mock_Browser_Client("http://127.0.0.1:5000")
        browser1 = client1.create_browser()
        browser2 = client2.create_browser()
        client1.login("testuser_8", "testpassword")
        client2.login("testuser_9", "testpassword")

        time.sleep(0.3)

        # Step 2: Create room and join
        client1.go_to_match_demo()
        client1.press_button("joinRoomButton")
        room_id = client1.get_room_id()
        client2.go_to_match_demo()
        client2.set_text_field("roomId", room_id)
        client2.press_button("joinRoomButton")

        time.sleep(0.3)

        # Step 3: Make players ready
        client1.press_button("readyButton")
        client2.press_button("readyButton")

        time.sleep(0.3)
        # Step 4: Perform 4 rounds of RPS (steps 4-5)
        for _ in range(4):
            client1.press_button("rockButton")
            client2.press_button("scissorsButton")
            time.sleep(0.3)
        assert json.loads(client1.get_game_state())["current_player_health"] == 4

        time.sleep(0.3)
        # Step 6: Build weapons (steps 6-7)
        for _ in range(3):
            client1.press_button("rockButton")
            client2.press_button("scissorsButton")
            time.sleep(0.3)
            client1.press_button("buildWeaponButton")
            time.sleep(0.3)
        assert json.loads(client1.get_game_state())["current_player_weaponry"] == [1, 1, 1]

        time.sleep(0.3)
        # Step 8: Upgrade weapon (steps 8-9)
        client1.press_button("rockButton")
        client2.press_button("scissorsButton")
        time.sleep(0.3)
        client1.set_text_field("weaponIndex", "1")
        client1.press_button("upgradeButton")
        time.sleep(0.3)
        assert json.loads(client1.get_game_state())["current_player_weaponry"] == [1, 2, 1]

        time.sleep(0.3)
        # Step 10: Player 2 RPS rounds (steps 10-11)
        for _ in range(4):
            client2.press_button("rockButton")
            client1.press_button("scissorsButton")
            time.sleep(0.3)
        assert json.loads(client2.get_game_state())["current_player_health"] == 4

        time.sleep(0.3)
        # Step 12: Player 2 builds health (steps 12-13)
        client2.press_button("rockButton")
        client1.press_button("scissorsButton")
        time.sleep(0.3)
        client2.press_button("buildHealthButton")
        time.sleep(0.3)
        assert json.loads(client2.get_game_state())["current_player_health"] == 5

        time.sleep(0.3)
        # Step 14: Player 1 attacks (steps 14-15)
        client1.press_button("rockButton")
        client2.press_button("scissorsButton")
        time.sleep(0.3)
        client1.set_text_field("weaponIndex", "1")
        client1.set_text_field("targetList", 'h')
        client1.press_button("attackButton")
        time.sleep(0.3)
        assert json.loads(client2.get_game_state())["current_player_health"] == 4

        time.sleep(0.3)
        # Step 16: Player 2 builds weapon (steps 16-17)
        client2.press_button("rockButton")
        client1.press_button("scissorsButton")
        time.sleep(0.3)
        client2.press_button("buildWeaponButton")

        time.sleep(0.3)
        # Step 18: Player 2 upgrades weapon (steps 18-19)
        for _ in range(2):
            client2.press_button("rockButton")
            client1.press_button("scissorsButton")
            time.sleep(0.3)
            client2.set_text_field("weaponIndex", "0")
            client2.press_button("upgradeButton")
            time.sleep(0.3)
        assert json.loads(client2.get_game_state())["current_player_weaponry"] == [3]

        time.sleep(0.3)
        # Step 20: Player 2 attacks (steps 20-21)
        client2.press_button("rockButton")
        client1.press_button("scissorsButton")
        time.sleep(0.3)
        client2.set_text_field("weaponIndex", "0")
        client2.set_text_field("targetList", '0')
        client2.press_button("attackButton")
        time.sleep(0.3)
        assert json.loads(client1.get_game_state())["current_player_weaponry"] == [2, 1]

        time.sleep(0.3)
        # Step 22: Player 2 attacks health (steps 22-23)
        client2.press_button("rockButton")
        client1.press_button("scissorsButton")
        time.sleep(0.3)
        client2.set_text_field("weaponIndex", "0")
        client2.set_text_field("targetList", 'h')
        client2.press_button("attackButton")
        time.sleep(0.3)
        assert json.loads(client1.get_game_state())["current_player_health"] == 1

        time.sleep(0.3)
        # Step 23: Final attack (step 23)
        client2.press_button("rockButton")
        client1.press_button("scissorsButton")
        time.sleep(0.3)
        client2.set_text_field("weaponIndex", "0")
        client2.set_text_field("targetList", 'h')
        client2.press_button("attackButton")
        time.sleep(0.3)

        assert json.loads(client1.get_game_state())["current_player_health"] == -2
        assert json.loads(client1.get_game_state())["state"] == 2
        assert json.loads(client2.get_game_state())["state"] == 2

        client1.close_browser()
        client2.close_browser()
    
        return True
    except exception as e:
        print(e)
        return False


def check_win_lose_count(id,win,lose):
    client = Mock_Browser_Client("http://127.0.0.1:5000")
    
    # Setup browser
    browser1 = client.create_browser()
    success1, message1 = client.login("testuser_0", "testpassword")

    # Get win/lose counts for user_id=4
    stats = client.get_win_lose_counts(id)
    
    client.close_browser()

    return stats == {'win_count': str(win), 'lose_count': str(lose)}

if __name__ == "__main__":
    deterministic_test_result = deterministic_test()
    print("Deterministic test result:", deterministic_test_result)
    deterministic_test_db_updated = check_win_lose_count(10,6,0) and check_win_lose_count(9,0,6)
    print("deterministic_test_db_updated:", deterministic_test_db_updated)

    random_test_result = random_test()
    print("Random test winner:", random_test_result)
    if random_test_result == 2:
        random_test_db_updated = check_win_lose_count(4,6,7) and check_win_lose_count(6,7,6)
    else:
        random_test_db_updated = check_win_lose_count(4,7,6) and check_win_lose_count(6,6,7)
    
    print("random_test_db_updated:", random_test_db_updated)

    