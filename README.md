# Fortress Le game Lmao

## Development Setup

### Game Logic

Fully playable game at `http://<your ip>:5000/api/match_demo`

- [match_demo.html](backend/templates/match_demo.html) - demonstrates WebSocket communication with the game server


If you want bombs to be gone after you used them, change the flag `DESTROY_WEAPON` to `True` at `backend/game.py`

Note: the game logic is not connected to db yet


### Frontend

1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

### Backend

1. Navigate to backend directory: `cd backend`

2. Set up virtual environment (requires Python 3.6+):

   ```bash
   # Create virtual environment
   python3 -m venv venv

   # Activate environment
   source venv/bin/activate       # Linux/Mac
   .\venv\Scripts\activate       # Windows PowerShell
   venv\Scripts\activate.bat     # Windows CMD
   ```

3. Install Python dependencies:

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Run Flask server:
   ```bash
   flask run
   ```

### Database Operations

All database scripts must be run from the backend directory:

```bash
cd backend
```

To view user data:

```bash
python dump_users.py
```

To view license keys:

```bash
python view_license_keys.py
```

To add a new license key:

```bash
python add_license_key.py "key_value" "description"
```

## Game Logic

The game is a turn-based tower defense where players:

- Decide winner from Rock-Paper-Scissors
- Complete their tower (0-4 health) or build shields (1 health)/cannons (1 damage)
- Attack with accumulated bombs
- Damage is applied on shields or the target's tower if shields are depleted

For detailed implementation, see [game_logic.md](game_logic.md)

## Production Deployment

(Add your production deployment instructions here)

## TODO

- [x] Implement core game logic
- [ ] Frontend graphics implementation
- [ ] Database integration
- [ ] User profile customization
- [ ] Dashboard implementation
- [ ] Leaderboard functionality
