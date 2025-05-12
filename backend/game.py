MIN_HEALTH_FOR_CANNON = 4
DESTROY_CANNON = False

class Player:
    def __init__(self, health=0, cannon=None):
        self.health = health
        self.cannon = cannon if cannon is not None else []
        self.rps_choice = None
        self.bomb_deployed = 0
        self.shields_deployed = 0
    
    def build(self, choice):
        if choice == 'health':
            if self.health >= MIN_HEALTH_FOR_CANNON:
                self.shields_deployed += 1
            self.health += 1
        elif choice == 'cannon' and self.health >= MIN_HEALTH_FOR_CANNON:
            self.cannon.append(1)
    
    def upgrade(self, index):
        if 0 <= index < len(self.cannon):
            self.cannon[index] += 1
    
    def attack(self, cannon_index, target, opponent):
        if cannon_index >= len(self.cannon):
            return False, "Invalid cannon index"
        
        self.bomb_deployed += 1
        max_attacks = self.cannon[cannon_index]
        if len(target) > 1:
            return False, "Too many targets for cannon capacity"

        for t in target:
            if t == 'h':
                if opponent.health > MIN_HEALTH_FOR_CANNON:
                    opponent.health -= 1
                else:
                    opponent.health -= max_attacks

            elif isinstance(t, int) and 0 <= t < len(opponent.cannon):
                opponent.cannon[t] = 0
            else:
                return False, "Invalid target"
            
            opponent.cannon = [i for i in opponent.cannon if i > 0]
            
            if DESTROY_CANNON:
                self.cannon.pop(cannon_index)
            return True, "Attack successful"

class Game:
    def __init__(self):
        self.player1 = Player()
        self.player2 = Player()
        self.state = 0  # 0: RPS, 1: Action, 2: End
        self.player1_rps_win = 0
        self.player2_rps_win = 0
        self.reason_for_update = ''
        self.winner = None
    
    def get_player(self, player_num):
        return self.player1 if player_num == 1 else self.player2
    
    def update_state(self, player, action, value):
        validation_result = self._validate_action(player, action, value)
        if not validation_result[0]:
            return False, validation_result[1]
 
        if self.state == 0:  # RPS state
            player.rps_choice = value.lower()
            print(f"Player {1 if player == self.player1 else 2} set RPS choice: {player.rps_choice}")
            
            if self.player1.rps_choice and self.player2.rps_choice:
                print("Both players made RPS choices")
                self.player1.consecutive_no_choice = 0
                self.player2.consecutive_no_choice = 0
                self._determine_rps_winner()
                print(f"RPS winner: {self.winner}")
                
                if self.winner == 0:  # Tie
                    print("RPS tie - resetting choices")
                    self._reset_rps()
                    self.reason_for_update = "RPS tie - new round starting"
                    return True, "RPS tie - new round starting"
                
                winner_player = self.player1 if self.winner == 1 else self.player2
                if not winner_player.cannon and winner_player.health < MIN_HEALTH_FOR_CANNON:
                    print("Winner has no cannons and low health - auto-building health")
                    winner_player.build('health')
                    self._reset_rps()
                    self.reason_for_update = "The winner built health"
                else:
                    print("Moving to action state")
                    self.state = 1
                    self._reset_rps()
                    self.reason_for_update = "RPS round completed"
                return True, "RPS round end"
            else:
                return False, "RPS choice recorded"
        
        elif self.state == 1:  # Action state
            winner = self.player1 if self.winner == 1 else self.player2
            loser = self.player2 if self.winner == 1 else self.player1
            
            if action == 'build':
                winner.build(value)
                self.state = 0
                self.reason_for_update = f"The winner built {value}"
                return True, f"Player {self.winner} built {value}"
            elif action == 'attack':
                success, message = winner.attack(value[0], value[1], loser)
                if not success:
                    return False, message
                if loser.health <= 0:
                    self.state = 2
                    self.reason_for_update = f"The winner used cannon index {value[0]} to attack {value[1]}"
                    return True, "Game ended"
                else:
                    self.state = 0
                    self.reason_for_update = f"The winner used cannon index {value[0]} to attack {value[1]}"
                    return True, "Attack successful"
            elif action == 'upgrade':
                winner.upgrade(value)
                self.state = 0
                self.reason_for_update = f"The winner upgraded cannon index {value}"
                return True, f"Player {self.winner} upgraded cannon {value}"
        return False, "Invalid game state"
    
    def _validate_action(self, player, action, value):
        if self.state == 0:  # RPS state
            if action != 'RPS':
                return False, "Invalid action for current state"
            if value.lower() not in ['rock', 'paper', 'scissors']:
                return False, "Invalid RPS choice (must be rock/paper/scissors)"
            if player.rps_choice is not None:
                return False, "Player already made RPS choice"
            return True, "Valid RPS action"
        
        elif self.state == 1:  # Action state
            opponent = (self.player1 if self.player2 == player else self.player2)
            if player != (self.player1 if self.winner == 1 else self.player2):
                return False, "Not winner's turn"
            
            if action == 'build':
                if value not in ['health', 'cannon']:
                    return False, "Invalid build choice"
                if value == 'cannon' and player.health < MIN_HEALTH_FOR_CANNON:
                    return False, "Not enough health to build cannon"
                return True, "Valid build action"
            
            elif action == 'attack':
                if not isinstance(value, list) or len(value) != 2:
                    return False, f"Invalid attack format {type(value)} {value}"
                cannon_idx, targets = value
                if cannon_idx >= len(player.cannon):
                    return False, "Invalid cannon index"
                for t in targets:
                    if t != 'h' and (not isinstance(t, int) or t >= len(opponent.cannon)):
                        return False, "Invalid target"
                return True, "Valid attack action"
            
            elif action == 'upgrade':
                if not isinstance(value, int) or value < 0:
                    return False, "Invalid cannon index"
                if value >= len(player.cannon):
                    return False, "Cannon index out of range"
                return True, "Valid upgrade action"
        
        return False, "Invalid game state"
    
    def _determine_rps_winner(self):
        choice = {
            'rock': 0,
            'paper': 1,
            'scissors': 2
        }
        p1 = choice.get(self.player1.rps_choice, -1)
        p2 = choice.get(self.player2.rps_choice, -1)
        
        if p1 == (p2 + 1) % 3:
            self.winner = 1
            self.player1_rps_win += 1
        elif p2 == (p1 + 1) % 3:
            self.winner = 2
            self.player2_rps_win += 1
        else:
            self.winner = 0  # Tie
    
    def _reset_rps(self):
        self.player1.rps_choice = None
        self.player2.rps_choice = None
        if self.state != 1:  # Only clear winner if not moving to action state
            self.winner = None

if __name__ == "__main__":
    print("Game module loaded")