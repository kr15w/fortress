# License Key Implementation Plan

## Overview
Implement license key validation for user account creation with:
1. New database table for license keys
2. Modified user creation flow
3. Two utility scripts for managing license keys

## Database Changes
1. Add new `LicenseKey` model to `database.py`:
```python
class LicenseKey(Base):
    __tablename__ = 'license_keys'
    
    id = Column(Integer, primary_key=True)
    hashed_key = Column(String(128), unique=True, nullable=False)
    user_id = Column(Integer, default=-1)  # -1 means unused
```

## User Creation Flow Modifications
1. Update `create_user()` in `DatabaseService` to:
```python
def create_user(self, username, email, password, license_key):
    session = self.Session()
    try:
        # Verify license key exists and is unused
        license_record = session.query(LicenseKey).filter_by(
            hashed_key=generate_password_hash(license_key),
            user_id=-1
        ).first()
        if not license_record:
            raise ValueError("Invalid or already used license key")

        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        session.add(user)
        session.flush()  # Get user.id
        
        # Update license key record
        license_record.user_id = user.id
        session.commit()
        return user
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
```

## Utility Scripts
1. `add_license_key.py`:
```python
# Takes license key as command line argument
# Hashes and stores in LicenseKey table
# Prints success/error message
```

2. `show_license_keys.py`:
```python
# Displays all license keys in table
# Shows hashed key and user_id (or "Unused")
# Formats output clearly
```

## Implementation Steps
1. Update database.py with LicenseKey model
2. Modify create_user() implementation
3. Create add_license_key.py script
4. Create show_license_keys.py script
5. Update any API endpoints that use create_user()