from player import Player
from database import DatabaseService
'''This is outdated, see flow.py.'''
class Game:
    def __init__(self):
        self.player1 = Player()
        self.player2 = Player()
        self.current_round = 1
        self.p1_rps = None
        self.p2_rps = None
        self.winner_move = None
        self.round_winner = None
        self.db = DatabaseService()
        
    def submit_rps(self, player_num, choice):
        """Submit RPS choice for a player, returns True if both players have submitted"""
        valid_moves = ['rock', 'paper', 'scissors']
        if choice.lower() not in valid_moves:
            return False
            
        if player_num == 1:
            self.p1_rps = choice.lower()
        else:
            self.p2_rps = choice.lower()
        return self.p1_rps is not None and self.p2_rps is not None

    def determine_rps_winner(self):
        """Determine RPS winner when both players have submitted and return result message"""
        if self.p1_rps is None or self.p2_rps is None:
            return None
        
        if self.p1_rps == self.p2_rps:
            self._clear_round_state()
            return None
        
        win_conditions = {
            'rock': 'scissors',
            'paper': 'rock',
            'scissors': 'paper'
        }
        
        if win_conditions[self.p1_rps] == self.p2_rps:
            self.round_winner = self.player1
        else:
            self.round_winner = self.player2
        
        return self.round_winner

    def submit_move(self, player_num, move):
        """
        Submit move from player, returns True if:
        - Player is the round winner
        - Move is valid
        """
        if self.round_winner is None:
            return False
            
        # Check if submitting player is the winner
        is_player1 = player_num == 1
        if (is_player1 and self.round_winner != self.player1) or \
           (not is_player1 and self.round_winner != self.player2):
            return False
            
        self.winner_move = move
        return True

    def process_round(self):
        """Process the round when all moves are submitted"""
        if self.round_winner is None or self.winner_move is None:
            return False
        
        if self.winner_move == 'shield':
            self.round_winner.build_shield()
            self.db.increment_count(self.round_winner.username, 1, 'shield')
        elif self.winner_move == 'cannon':
            self.round_winner.build_cannon()
            self.db.increment_count(self.round_winner.username, 1, 'bomb')
        elif self.winner_move == 'attack':
            self._process_attack()
        
        self._clear_round_state()
        self.current_round += 1
        return True

    def _process_attack(self):
        """Process attack from round winner"""
        defender = self.player2 if self.round_winner == self.player1 else self.player1
        cannons = sum(1 for item in self.round_winner.get_stack() if item == 'C')
        damage = cannons
        
        defender.take_damage(damage)

    def _clear_round_state(self):
        """Clear round-specific state"""
        self.p1_rps = None
        self.p2_rps = None
        self.winner_move = None
        self.round_winner = None

    def get_state(self):
        """Return current game state"""
        return {
            'round': self.current_round,
            'player1_stack': self.player1.get_stack(),
            'player2_stack': self.player2.get_stack(),
            'p1_rps': self.p1_rps,
            'p2_rps': self.p2_rps,
            'winner_move': self.winner_move
        }

    def is_game_over(self):
        """Check if game has ended"""
        return self.player1.is_defeated() or self.player2.is_defeated()

    def get_winner(self):
        """Get winning player if game is over"""
        if self.player1.is_defeated():
            self.db.increment_count(self.player2.username, 1, 'win')
            self.db.increment_count(self.player1.username, 1, 'lose')
            return 2
        elif self.player2.is_defeated():
            self.db.increment_count(self.player1.username, 1, 'win')
            self.db.increment_count(self.player2.username, 1, 'lose')
            return 1
        return None