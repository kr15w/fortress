# Fortress le gaym

A turn-based tower defense game where players build shields and bombs, with moves determined by Rock-Paper-Scissors.

## Game Overview

Players take turns by playing Rock-Paper-Scissors. The winner can do one of:

- Complete their tower if it has <4 health
- Build a shield (1 health)
- Build a bomb (1 damage when attacking)
- Attack using one bomb on opponent's bomb OR opponent's tower
- Upgrade one of their shields to sustain 1 more damage
- Upgrade one of their bombs to deal 1 more damage

Damage is applied top-down on the opponent's stack. The game ends when a player's empty tower is attacked.

## Game Logic

The "round winner" here means winner of a RPS match at the start of a round.

### The Tower

- Each player has one tower, originally empty with 4 slots.
- When the winner gets their turn, they can complete their tower (+1 hp)
- If the tower has < 4hp, the winner can only complete their tower before building shields and bombs
- Else, the winner can build a shield or a bomb

### Shields

- Each player maintains a stack of shields (integers)
- New shields start with 1 health
- Only the most outward shield takes damage
- A shield is destroyed when its health is depleted

### Bombs

- Each player maintains a list of bombs (integers)
- New bombs start with 1 damage, and always only have 1 health
- Players can use any bomb on their field
- All bombs are one-use
- A bomb is destroyed when its health is depleted

### Rock-Paper-Scissors

- Standard rules apply (rock > scissors, scissors > paper, paper > rock)
- Both players submit choices asynchronously
- If choices match, round is skipped
- Winner gets to choose next action (Build/Attack/Upgrade)

### Turn Flow

1. Both players submit RPS choices
2. Game determines winner when both choices received
3. Winner submits action choice
4. Game processes action and updates state
5. Check for win condition (tower health of one player depleted (hp <0))
6. Repeat until game ends

## Error Handling

For the prototype, let's not worry about it yet. But we do need to worry about these later:

- user quits suddenly mid match
- just see srs lmao

## Class Documentation

### Message Classes

_These classes should be JSONs sent between server and client. For code clarity, they are objects in [flow.py](flow.py)._

#### RpsAction

- Represents a player's RPS choice
- Contains player reference and their choice (r/p/s)

#### RpsResult

- Contains winner and loser references after RPS round
- Used to notify both players of result

#### TowerAction

- Represents a player's tower action (build/attack/upgrade)
- Contains player reference, action type, and optional target indices

### Player Class

Manages a player's game state including user id, tower, shields and bombs.
_The return statements here should be messages sent to the server via Websocket._

#### Attributes

- `name`: Player identifier
- `hp`: Tower health (0-4)
- `shields`: List of shields with variable health
- `bombs`: List of bombs with variable power

#### Methods

- `handleInputRps() -> RpsAction`: Get player's RPS choice
- `handleInputTower() -> TowerAction`: Get player's tower action
- `on_notify(move: TowerAction)`: Receive game state updates
- `display()`: Print player state

### Table Class

Manages game state and processes player actions.

#### Attributes

- `players`: List of Player objects
- `roundWinner`: Current round's winner
- `roundLoser`: Current round's loser
- `rounds`: Number of rounds played
- `gameOver`: Game end flag

#### Methods

- `addPlayer(player: Player)`: Register new player
- `removePlayer(player: Player)`: Remove player
- `notify(msg)`: Broadcast message to all players
- `decideWinner(p1RpsAction: RpsAction, p2RpsAction: RpsAction)`: Determine round winner
- `handleBuild(bldAction: TowerAction)`: Process build actions
- `handleAttack(atkAction: TowerAction)`: Process attack actions
- `handleUpgrade(upgAction: TowerAction)`: Process upgrade actions
- `startGame(player1: Player, player2: Player)`: Begin game loop

## Sample Battle Scenario

```python
# Initialize players and table
p1 = Player("discovry")
p2 = Player("noogai67")
table = Table()
table.addPlayer(p1)
table.addPlayer(p2)

# Round 1: P1 wins and builds tower
p1_choice = RpsAction(p1, "r")
p2_choice = RpsAction(p2, "s")
table.decideWinner(p1_choice, p2_choice)  # P1 wins
table.handleBuild(TowerAction(p1, TowerActionTypes.BUILD_TOWER))  # P1 hp = 1

# Round 2: P2 wins and builds tower
p1_choice = RpsAction(p1, "p")
p2_choice = RpsAction(p2, "s")
table.decideWinner(p1_choice, p2_choice)  # P2 wins
table.handleBuild(TowerAction(p2, TowerActionTypes.BUILD_TOWER))  # P2 hp = 1

# Round 3: P1 wins and builds shield
p1_choice = RpsAction(p1, "r")
p2_choice = RpsAction(p2, "s")
table.decideWinner(p1_choice, p2_choice)  # P1 wins
table.handleBuild(TowerAction(p1, TowerActionTypes.BUILD_SHIELD))  # P1 shields = [1]
```

## Integration Notes

_The updated game flow isn't connected to backend yet._
For online play:

1. Call `submit_rps()` when players make choices
2. Check return value to know when both have submitted
3. Call `determine_rps_winner()` to get round winner
4. Call `submit_move()` when winner chooses action
5. Call `process_round()` to apply changes
6. Use `get_state()` to sync game state with clients

<details>
  <summary># outdated</summary>
  
## Class Documentation

### Player Class

Manages a player's stack and defenses.

#### Methods:

- `build_shield()`: Add shield with 3 health to stack
- `build_cannon()`: Add cannon to stack
- `take_damage(damage)`: Process incoming damage
- `is_defeated()`: Check if stack is empty
- `get_stack()`: Return current stack state

### Table Class

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

</details>
