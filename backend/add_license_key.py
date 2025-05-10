import sys
from werkzeug.security import generate_password_hash
from database import DatabaseService
import random

def main():
    if len(sys.argv) != 2:
        print("Usage: python add_license_key.py <number_of_keys_generated>")
        return

    n = int(sys.argv[1])  # Convert input to integer
    pw_string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    pw_length = 16

    with open("tmp_keys.txt", "a") as file:  # Use "a" mode to append
        for _ in range(n):
            license_key = ''.join(random.choices(pw_string, k=pw_length))
            hash_value = generate_password_hash(license_key)
            db = DatabaseService()
            try:
                db.add_license_key(license_key)
                file.write(f"{license_key}\n")  # Append to file
                print(f"Successfully added license key: {license_key}")
            except Exception as e:
                print(f"Error adding license key: {str(e)}")

if __name__ == "__main__":
    main()