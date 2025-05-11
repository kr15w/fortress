import account_creation_test
import game_logic_test


if account_creation_test.main():
    game_logic_test.main()
else:
    print("Account creation and login test failed, aborting game logic test")