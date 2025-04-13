# Flask Database Persistence Implementation Plan

## Objective
Implement persistent user storage using SQLite database with easy migration path to MySQL.

## Current System Analysis
- Uses in-memory list for user storage
- Basic JWT authentication implemented
- No password hashing
- Data lost on server restart

## Proposed Solution

### Database Schema (SQLite)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### File Structure Changes
1. New file: `backend/database.py` - Database service layer
2. Modified file: `backend/app.py` - Updated auth routes
3. New dependency: SQLAlchemy (add to requirements.txt)

### Database Service Layer (database.py)
```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DatabaseService:
    def __init__(self, db_url='sqlite:///users.db'):
        self.engine = create_engine(db_url)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
    
    def create_user(self, username, email, password):
        session = self.Session()
        try:
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password)
            )
            session.add(user)
            session.commit()
            return user
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    # Other CRUD methods...
```

### Auth Route Modifications (app.py)
Key changes:
1. Remove in-memory users list
2. Import and initialize DatabaseService
3. Update register/login to use database
4. Add password hashing

### Migration Considerations
1. For MySQL migration:
   - Change db_url to MySQL connection string
   - Update SQLAlchemy dialect
   - No changes needed to models or queries
2. Data migration script may be needed

## Implementation Steps
1. Create database.py with above implementation
2. Update requirements.txt with SQLAlchemy
3. Modify app.py auth routes
4. Test register/login functionality
5. Verify data persistence across server restarts