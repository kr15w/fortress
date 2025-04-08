# Fortress Game

A fun multiplayer card game

## Development Setup

### Frontend
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`

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

## Production Deployment
(Add your production deployment instructions here)

## TODO
- [ ] Implement room creation/joining logic
- [ ] Develop server-side game logic
- [ ] Create system for storing user stats
- [ ] Implement leaderboard functionality
(Add your production deployment instructions here)
