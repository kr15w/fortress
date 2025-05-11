# Testing guide

To run test, first set up the requirement venv:
```bash
cd <repo_root_dir>/test/ # make sure you are in the test directory!
python -m venv venv
source venv/bin/activate
pip install -r requirement.txt
```

## Test cases 
There are 2 test cases the first one is to test account creation and login:
```bash
cd <repo_root_dir>/test/ # make sure you are in the test directory!
source venv/bin/activate
python3 account_creation_test.py
```

The second on is to test the game logic:
```bash
cd <repo_root_dir>/test/ # make sure you are in the test directory!
source venv/bin/activate
python3 game_logic_test.py
```

Or to run both test together:
```bash
cd <repo_root_dir>/test/ # make sure you are in the test directory!
source venv/bin/activate
python3 run_all_test.py
```
