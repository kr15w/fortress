from sqlalchemy import create_engine, Column, Integer, String, Numeric, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from decimal import Decimal

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
    win_count = Column(Integer, default=0)
    loss_count = Column(Integer, default=0)
    total_bomb_count = Column(Integer, default=0)
    total_shield_count = Column(Integer, default=0)

class BattleHistory(Base):
    __tablename__ = 'battle_history'
    MatchId = Column(Integer, primary_key=True)
    match_end_time = Column(DateTime, default=datetime.utcnow)
    player1 = Column(String(50), nullable=False) 
    player2 = Column(String(50), nullable=False)  
    player1_rpsWinrate = Column(Numeric(5, 2), default=0.00)
    player2_rpsWinrate = Column(Numeric(5, 2), default=0.00)
    winner = Column(String(50), nullable=False)  

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

    def increment_count(self, username, increment, move):
        session = self.Session()
        user = session.query(User).filter_by(username = username).first()
        if user:
            if move == "bomb":
                user.total_bomb_count += increment
            elif move == "shield":
                user.total_shield_count += increment
            elif move == "win":
                user.win_count += increment
            elif move == "lose":
                user.loss_count += increment
            session.commit()
            return True
        
    def is_username_taken(self, username):
        """Check if the username already exists in the database."""
        session = self.Session()
        exists = session.query(User).filter_by(username=username).first() is not None
        session.close()
        return exists

    def is_email_taken(self, email):
        """Check if the email is already registered."""
        session = self.Session()
        exists = session.query(User).filter_by(email=email).first() is not None
        session.close()
        return exists

    def update_user(self, current_username, new_username, new_email):
        """Update the username and email of a user."""
        session = self.Session()
        try:
            user = session.query(User).filter_by(username = current_username).first()
            if user:
                user.username = new_username
                user.email = new_email
                session.commit()
                session.close()
                return True
            return False
        except Exception as e:
            session.rollback()
            print(f"Error updating user: {e}")
            return False

    def add_match_history(self, player1, player2, player1_rpsWinrate, player2_rpsWinrate, winner):
        session = self.Session()
        try:
            history = BattleHistory(
            matchId=None,  # Auto-incremented by the database
            match_end_time=datetime.utcnow(),  
            player1=player1,
            player2=player2,
            player1_rpsWinrate=player1_rpsWinrate,
            player2_rpsWinrate=player2_rpsWinrate,
            winner=winner
        )
            session.add(history)
            session.commit()
            return history
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()