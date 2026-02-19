import subprocess
import sys

def run_scan():
    print("--- Running Dependency Vulnerability Scan (pip-audit) ---")
    try:
        # Check if pip-audit is installed
        subprocess.run(["pip-audit", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("pip-audit not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pip-audit"], check=True)

    result = subprocess.run(["pip-audit", "-r", "requirements.txt"], capture_output=False)
    if result.returncode == 0:
        print("\n✅ No known vulnerabilities found.")
    else:
        print("\n❌ Vulnerabilities detected! Please review the output above.")
        sys.exit(1)

if __name__ == "__main__":
    run_scan()
