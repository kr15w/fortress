import sys
from werkzeug.security import generate_password_hash
from database import DatabaseService

def main():
    if len(sys.argv) != 2:
        print("Usage: python add_license_key.py \"YOUR_LICENSE_KEY\"")
        return

    key = sys.argv[1]
    db = DatabaseService()
    
    try:
        db.add_license_key(key)
        print(f"Successfully added license key: {key}")
    except Exception as e:
        print(f"Error adding license key: {str(e)}")

if __name__ == "__main__":
    main()