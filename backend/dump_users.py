from database import DatabaseService, User

def dump_users():
    db = DatabaseService('sqlite:///users.db')
    with db.Session() as session:
        users = session.query(User).all()
        print("ID\tUsername\tEmail\t\t\tPassword Hash")
        print("--------------------------------------------------")
        for user in users:
            print(f"{user.id}\t{user.username}\t{user.email}\t{user.password_hash}")

def id_to_name(usr_id):
    if type(usr_id) == str:
        try:
            usr_id = int(usr_id)
        except:
            return 'USER ID CAN NOT BE CONVERTED TO INT'
        
    db = DatabaseService('sqlite:///users.db')
    with db.Session() as session:
        users = session.query(User).all()
        #print("ID\tUsername\tEmail\t\t\tPassword Hash")
        #print("--------------------------------------------------")
        for user in users:
            if user.id == usr_id:
                return user.username

    return 'USER NOT FOUND'

if __name__ == '__main__':
    dump_users()
    #print(id_to_name(1))