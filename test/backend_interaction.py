import subprocess
import os
import sys
from typing import Tuple

def run_backend_script(script_name: str, args=None) -> Tuple[bool, str]:
    """Helper function to run backend script with timeout and output capture"""
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    venv_activate = os.path.join(backend_dir, 'venv', 'bin', 'activate')
    
    if not os.path.exists(venv_activate):
        return (False, f"Virtual environment not found at {venv_activate}")

    # Change to backend directory and activate venv
    cmd = f'cd {backend_dir} && source {venv_activate} && python {script_name}'
    if args:
        cmd += ' ' + ' '.join(str(arg) for arg in args)
    
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            executable='/bin/bash',
            check=True,
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            timeout=10
        )
        return (True, result.stdout.decode('utf-8').strip())
    except subprocess.TimeoutExpired:
        return (False, "Command timed out after 10 seconds")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8').strip() or "Unknown error occurred"
        return (False, error_msg)

def dump_user() -> Tuple[bool, str]:
    """Run dump_user.py script"""
    print("Running user dump...")
    return run_backend_script('dump_users.py')

def view_license_key() -> Tuple[bool, str]:
    """Run view_license_key.py script"""
    print("Viewing license keys...")
    return run_backend_script('view_license_keys.py')

def add_license_key(count: int) -> Tuple[bool, str]:
    """Run add_license_key.py script with key count"""
    print(f"Adding {count} license keys...")
    return run_backend_script('add_license_key.py', [count])

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Backend interaction script')
    subparsers = parser.add_subparsers(dest='command', required=True)
    
    # Dump user command
    dump_parser = subparsers.add_parser('dump_user', help='Dump user data')
    
    # View license key command
    view_parser = subparsers.add_parser('view_license_key', help='View license keys')
    
    # Add license key command
    add_parser = subparsers.add_parser('add_license_key', help='Add license keys')
    add_parser.add_argument('count', type=int, help='Number of license keys to add')
    
    args = parser.parse_args()
    
    if args.command == 'dump_user':
        success, output = dump_user()
    elif args.command == 'view_license_key':
        success, output = view_license_key()
    elif args.command == 'add_license_key':
        success, output = add_license_key(args.count)
    
    if success:
        print("Command executed successfully:")
        print(output)
    else:
        print("Command failed:")
        print(output)
        sys.exit(1)