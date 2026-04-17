import paramiko
import sys

host = "178.62.254.33"
username = "root"
password = "Q4v@jvB/4_nu::Z"

try:
    print("[*] Connecting to server...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    print("[✓] Connected!\n")
    
    commands = [
        ("uname -a", "Operating System"),
        ("lsb_release -d", "Linux Distribution"),
        ("node --version || echo 'Node.js NOT installed'", "Node.js Version"),
        ("nginx -v 2>&1 || echo 'Nginx NOT installed'", "Nginx"),
        ("psql --version 2>/dev/null || echo 'PostgreSQL NOT installed'", "PostgreSQL"),
        ("git --version || echo 'Git NOT installed'", "Git"),
        ("pm2 --version 2>/dev/null || echo 'PM2 NOT installed'", "PM2"),
    ]
    
    for cmd, label in commands:
        stdin, stdout, stderr = client.exec_command(cmd)
        output = stdout.read().decode().strip()
        print(f"[{label}]")
        print(f"  {output}\n")
    
    client.close()
    print("[✓] Server check complete!")
    
except Exception as e:
    print(f"[✗] Connection failed: {str(e)}")
    sys.exit(1)
