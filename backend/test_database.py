from database import DatabaseService, User
import os

def test_database_operations():
    # Use in-memory SQLite for testing
    db = DatabaseService('sqlite:///:memory:')
    
    # Test create_user
    user = db.create_user('testuser', 'test@example.com', 'testpass')
    assert isinstance(user, User)
    
    # Test get_user_by_username
    with db.Session() as session:
        fetched_user = session.query(User).filter_by(username='testuser').first()
        assert fetched_user is not None
        assert fetched_user.username == 'testuser'
        assert fetched_user.email == 'test@example.com'
    
    # Test verify_user
    assert db.verify_user('testuser', 'testpass') is not None
    assert db.verify_user('testuser', 'wrongpass') is None
    assert db.verify_user('nonexistent', 'testpass') is None
    
    print("All database tests passed successfully!")

if __name__ == '__main__':
    test_database_operations()