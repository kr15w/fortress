# Flask Server and Database Commands

## Hosting the Flask Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment and start server
source venv/bin/activate && flask run --host :: --port 5000 --debugger
```

Key parameters:
- `--host ::` - Makes server accessible on all network interfaces
- `--port 5000` - Default Flask port
- `--debugger` - Enables debug mode with auto-reload

## Dumping Database Data

```bash
# Dump all user credentials
python3 dump_users.py

# Expected output format:
# ID  Username  Email  Password_Hash
# --------------------------
# 1   testuser  test@example.com  pbkdf2:sha256:...
```

## Database File Location
- SQLite database: `backend/users.db`
- Can be inspected using SQLite CLI:
  ```bash
  sqlite3 backend/users.db
  .tables           # Show tables
  SELECT * FROM users;  # View all users
  ```

## Important Notes
- Always stop the server (Ctrl+C) before dumping data
- Password hashes are encrypted - never stored in plaintext
- For production, use proper database backups instead of dumping