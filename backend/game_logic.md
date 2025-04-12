# Stack Combat Game

A turn-based combat game where players build shields and cannons in stacks, with moves determined by Rock-Paper-Scissors.

## Game Overview

Players alternate turns by playing Rock-Paper-Scissors. The winner can:
- Build a shield (+3 health)
- Build a cannon (1 damage when attacking)
- Attack with all cannons

Damage is applied top-down on the opponent's stack. The game ends when a player's stack is empty.

## Game Logic

### Stack Mechanics
- Each player maintains a stack of shields (integers) and cannons ('C')
- New shields start with 3 health
- Cannons have 1 health and deal 1 damage when attacking
- Stack is processed top-down when taking damage

### Damage Resolution
1. Damage is equal to attacker's number of cannons
2. Damage is applied to opponent's stack from top to bottom:
   - If top item is a shield:
     - Absorbs damage equal to its current health
     - Shield is destroyed if damage >= health
     - Otherwise, health is reduced by damage
   - If top item is a cannon:
     - Absorbs exactly 1 damage and is destroyed
3. Remaining damage continues to next item
4. Process repeats until all damage is absorbed or stack is empty

### Rock-Paper-Scissors
- Standard rules apply (rock > scissors, scissors > paper, paper > rock)
- Both players submit choices asynchronously
- If choices match, round is skipped
- Winner gets to choose next action

### Turn Flow
1. Both players submit RPS choices
2. Game determines winner when both choices received
3. Winner submits action choice
4. Game processes action and updates state
5. Check for win condition (empty stack)
6. Repeat until game ends

### Example Damage Calculation
Attacker has 3 cannons (3 damage), Defender stack: [5, 'C', 3]
1. First 'C' absorbs 1 damage (2 remaining)
2. Shield 3 absorbs 2 damage (1 health remains)
3. Final stack: [5, 1]

## Class Documentation

### Player Class
Manages a player's stack and defenses.

#### Methods:
- `build_shield()`: Add shield with 3 health to stack
- `build_cannon()`: Add cannon to stack
- `take_damage(damage)`: Process incoming damage
- `is_defeated()`: Check if stack is empty
- `get_stack()`: Return current stack state

### Game Class
Manages game state and round processing.

#### Methods:
- `submit_rps(player_num, choice)`: Submit RPS choice (1 or 2)
- `determine_rps_winner()`: Determine RPS winner when both have submitted
- `submit_move(player_num, move)`: Submit move from winner
- `process_round()`: Process the current round
- `get_state()`: Return current game state
- `is_game_over()`: Check if game has ended
- `get_winner()`: Get winning player number

## Function Signatures

```python
# Player class
def build_shield(self) -> None
def build_cannon(self) -> None
def take_damage(self, damage: int) -> int
def is_defeated(self) -> bool
def get_stack(self) -> list

# Game class
def submit_rps(self, player_num: int, choice: str) -> bool
def determine_rps_winner(self) -> Optional[Player]
def submit_move(self, player_num: int, move: str) -> bool
def process_round(self) -> bool
def get_state(self) -> dict
def is_game_over(self) -> bool
def get_winner(self) -> Optional[int]
```

## Example Usage

```python
from game import Game

# Initialize game
game = Game()

# Player 1 submits RPS choice
game.submit_rps(1, 'rock')

# Player 2 submits RPS choice
game.submit_rps(2, 'scissors')

# Determine winner
winner = game.determine_rps_winner()  # Returns Player 1

# Winner submits move
game.submit_move(1, 'attack')

# Process round
game.process_round()
```

## Sample Battle Scenario

```python
from game import Game

# Initialize game
battle = Game()

# Round 1
battle.submit_rps(1, 'rock')
battle.submit_rps(2, 'scissors')  # Player 1 wins
battle.submit_move(1, 'cannon')   # Player 1 builds cannon
battle.process_round()

# Round 2 
battle.submit_rps(1, 'paper')
battle.submit_rps(2, 'paper')     # Draw - round skipped

# Round 3
battle.submit_rps(1, 'scissors')
battle.submit_rps(2, 'paper')     # Player 1 wins
battle.submit_move(1, 'attack')   # Player 1 attacks with 1 cannon
battle.process_round()

# Check game state
print(battle.get_state())
```

## Integration Notes

For online play:
1. Call `submit_rps()` when players make choices
2. Check return value to know when both have submitted
3. Call `determine_rps_winner()` to get round winner
4. Call `submit_move()` when winner chooses action
5. Call `process_round()` to apply changes
6. Use `get_state()` to sync game state with clients