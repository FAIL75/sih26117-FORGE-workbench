#!/bin/bash
# ---------------------------------------------------------
# SIH26117 Sovereign Workbench - Sovereignty Audit Harness
# ---------------------------------------------------------

echo "🔒 Starting Sovereignty Audit Harness..."
echo "---------------------------------------------------------"

# Ensure we are running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Fatal Error: This audit script requires root privileges (sudo)."
   exit 1
fi

# 0. Pre-flight Check: Cache Docker Images
# This MUST happen before the firewall drops outbound traffic. 
# If the image isn't local, the air-gapped demo will hang on the first code execution.
echo "🐳 Verifying local Docker cache for sandbox environment..."
docker pull python:3.11-slim
if [ $? -ne 0 ]; then
    echo "❌ Fatal Error: Could not pull the sandbox image. Check internet connection before sealing the network."
    exit 1
fi
echo "✅ Sandbox image cached locally."

# 1. Initialize firewall chain
echo "🛡️  Initializing audit ruleset..."
iptables -N SOVEREIGN_AUDIT || true
iptables -F SOVEREIGN_AUDIT

# 2. Add an EXPLICIT ALLOW rule for local traffic (LAN & Loopback)
# This allows the backend to talk to Ollama, Qdrant, etc. on localhost.
iptables -A SOVEREIGN_AUDIT -o lo -j ACCEPT
iptables -A SOVEREIGN_AUDIT -d 10.0.0.0/8 -j ACCEPT
iptables -A SOVEREIGN_AUDIT -d 172.16.0.0/12 -j ACCEPT
iptables -A SOVEREIGN_AUDIT -d 192.168.0.0/16 -j ACCEPT

# 3. Add the ultimate SIH Sovereignty Proof rule
# FIX: Removed the '-p tcp' flag. This now logs ALL protocols (TCP, UDP, ICMP)
# before dropping them. Omission of this would allow DNS-based exfiltration to vanish silently.
echo "⚠️  Enforcing strict DROP-ALL ruleset with LOGGING..."
iptables -A SOVEREIGN_AUDIT -j LOG --log-prefix "🔒 SOVEREIGN_BREACH_ALERT: " --log-level 4
iptables -A SOVEREIGN_AUDIT -j DROP

# 4. Insert the audit chain at the top of the standard OUTPUT table
# Ensure it processes BEFORE any standard system rules.
iptables -I OUTPUT 1 -j SOVEREIGN_AUDIT

echo "✅ Firewall secured. Sovereignty Mode is ACTIVE."
echo "---------------------------------------------------------"
echo "📋 Starting real-time audit monitoring (Press Ctrl+C to stop)"
echo "   Monitor your Agentic traces in the workbench UI."
echo "   This view proves zero data packets have left the network."
echo "---------------------------------------------------------"

# 5. Start auditing logs
# Look specifically for the log prefix we defined above.
journalctl -f | grep --line-buffered "SOVEREIGN_BREACH_ALERT"