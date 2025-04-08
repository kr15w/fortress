from database import DatabaseService

def main():
    db = DatabaseService()
    keys = db.get_all_license_keys()
    
    print("License Keys:")
    print("------------")
    print(f"{'ID':<5} | {'Status':<15} | {'User ID':<10}")
    print("-" * 35)
    
    for key in keys:
        status = "USED" if key.user_id != -1 else "AVAILABLE"
        user_id = key.user_id if key.user_id != -1 else "N/A"
        print(f"{key.id:<5} | {status:<15} | {user_id:<10}")

if __name__ == "__main__":
    main()