import random
import os
from mock_browser_client import Mock_Browser_Client
from backend_interaction import add_license_key

# Configuration
BASE_URL = "http://127.0.0.1:5000"
USERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'users.db')

def check_production_db():
    """Check if production database exists"""
    if os.path.exists(USERS_DB_PATH):
        print("ERROR: Production database exists at backend/users.db")
        print("Aborting test to prevent production data loss")
        return False
    return True

def generate_license_keys(count):
    """Generate specified number of license keys"""
    success, keys = add_license_key(count)
    if not success:
        raise Exception(f"Failed to generate license keys: {keys}")
    return [i.split(' ')[-1] for i in keys.split('\n')]

def create_accounts(keys, count):
    """Create accounts using random license keys"""
    selected_keys = random.sample(keys[1:], count)
    client = Mock_Browser_Client(BASE_URL)
    accounts = []
    
    for i, key in enumerate(selected_keys):
        username = f"testuser_{i}"
        email = f"testuser_{i}@example.com"
        password = "testpassword"
        
        try:
            browser = client.create_browser()
            success, message = client.signup(username, email, password, key)
            accounts.append((username, email, password, key))
            print(f"Account {username} created successfully")
        except Exception as e:
            print(f"Account {username} creation failed: {str(e)}")
            return False
        finally:
            client.close_browser()
    
    return accounts

def login_accounts(accounts):
    """Login to all accounts"""
    client = Mock_Browser_Client(BASE_URL)
    for username, _, password, _ in accounts:
        try:
            browser = client.create_browser()
            success, message = client.login(username, password)
            print(f"Login {username}: {'Success' if success else 'Failed'} - {message}")
            if not success:
                return success
        except Exception as e:
            print(f"Login {username} failed: {str(e)}")
            return False
        finally:
            client.close_browser()
        
    return True

def test_invalid_license(accounts):
    """Test account creation with invalid license key"""
    if not accounts:
        return False
        
    client = Mock_Browser_Client(BASE_URL)
    username, email, password, _ = accounts[0]
    
    try:
        browser = client.create_browser()
        success, message = client.signup(f"{username}_invalid", f"invalid_{email}", password, "INVALID_KEY")
        print(f"Invalid license test: {'Failed (unexpected success)' if success else 'Passed'} - {message}")
        return not success  # Test passes if signup fails
    except Exception as e:
        print(f"Invalid license test error: {str(e)}")
        return False
    finally:
        client.close_browser()

def test_duplicate_username(accounts,keys):
    """Test account creation with duplicate username"""
    if not accounts:
        return False
        
    client = Mock_Browser_Client(BASE_URL)
    username, email, password, _ = accounts[0]  
    key = keys[0]# Use valid key
    
    try:
        browser = client.create_browser()
        success, message = client.signup(username, f"duplicate_{email}", password, key)
        print(f"Duplicate username test: {'Failed (unexpected success)' if success else 'Passed'} - {message}")
        return not success  # Test passes if signup fails
    except Exception as e:
        print(f"Duplicate username test error: {str(e)}")
        return False
    finally:
        client.close_browser()

def test_duplicate_email(accounts,keys):
    """Test account creation with duplicate email"""
    if not accounts:
        return False
        
    client = Mock_Browser_Client(BASE_URL)
    username, email, password, _ = accounts[0]
    key = keys[0]# Use valid key
    
    try:
        browser = client.create_browser()
        success, message = client.signup(f"duplicate_{username}", email, password, key)
        print(f"Duplicate email test: {'Failed (unexpected success)' if success else 'Passed'} - {message}")
        return not success  # Test passes if signup fails
    except Exception as e:
        print(f"Duplicate email test error: {str(e)}")
        return False
    finally:
        client.close_browser()

def cleanup():
    """Remove test database file"""
    try:
        if os.path.exists(USERS_DB_PATH):
            os.remove(USERS_DB_PATH)
            print("Cleaned up test database")
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")

def main():
    test_results = []

    if not check_production_db():
        exit(1)
        
    print("Generating 20 license keys...")
    keys = generate_license_keys(20)
    print("Creating 10 accounts...")
    accounts = create_accounts(keys, 10)
    test_results.append(accounts is not None)
    
    print("Logging in to all accounts...")
    login_success = login_accounts(accounts)
    test_results.append(login_success)
    
    print("\nRunning additional tests:")
    test_results.append(test_invalid_license(accounts))
    test_results.append(test_duplicate_username(accounts,keys)) 
    test_results.append(test_duplicate_email(accounts,keys))
    
    if all(test_results):
        print("\n🎉 All tests passed successfully! 🎉")
    else:
        print("\nSome tests failed. See output above for details.")
            


    cleanup()
        
    return all(test_results)

if __name__ == "__main__":
    main()