from database import DatabaseService, User

def dump_users():
    db = DatabaseService('sqlite:///users.db')
    with db.Session() as session:
        users = session.query(User).all()
        print("ID\tUsername\tEmail\t\t\tPassword Hash")
        print("--------------------------------------------------")
        for user in users:
            print(f"{user.id}\t{user.username}\t{user.email}\t{user.password_hash}")

if __name__ == '__main__':
    dump_users()