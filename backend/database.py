from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

Base = declarative_base()

class LicenseKey(Base):
    __tablename__ = 'license_keys'
    
    id = Column(Integer, primary_key=True)
    hashed_key = Column(String(128), unique=True, nullable=False)
    user_id = Column(Integer, default=-1)  # -1 means unused

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
            session.refresh(user)  # Ensure we have the ID
            return user
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_user_by_username(self, username):
        session = self.Session()
        try:
            return session.query(User).filter_by(username=username).first()
        finally:
            session.close()
    
    def verify_user(self, username, password):
        user = self.get_user_by_username(username)
        if user and check_password_hash(user.password_hash, password):
            return user
        return None

    def add_license_key(self, key):
        session = self.Session()
        try:
            license_key = LicenseKey(
                hashed_key=generate_password_hash(key),
                user_id=-1
            )
            session.add(license_key)
            session.commit()
            return license_key
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def validate_license_key(self, key):
        session = self.Session()
        try:
            # Get all unused keys
            unused_keys = session.query(LicenseKey).filter(
                LicenseKey.user_id == -1
            ).all()
            
            # Check if any unused key matches the input
            for license_key in unused_keys:
                if check_password_hash(license_key.hashed_key, key):
                    return True
            return False
        except Exception as e:
            print(f"License validation error: {str(e)}")
            return False
        finally:
            session.close()

    def consume_license_key(self, key, user_id):
        session = self.Session()
        try:
            # Get all unused keys
            unused_keys = session.query(LicenseKey).filter(
                LicenseKey.user_id == -1
            ).all()
            
            # Find and update the matching key
            for license_key in unused_keys:
                if check_password_hash(license_key.hashed_key, key):
                    license_key.user_id = user_id
                    session.commit()
                    session.refresh(license_key)
                    return True
            return False
        except Exception as e:
            session.rollback()
            print(f"License consumption error: {str(e)}")
            raise e
        finally:
            session.close()

    def get_all_license_keys(self):
        session = self.Session()
        try:
            return session.query(LicenseKey).all()
        finally:
            session.close()