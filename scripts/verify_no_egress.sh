#!/bin/bash
# ---------------------------------------------------------
# SIH26117 Sovereign Workbench - Sovereignty Audit Harness
# ---------------------------------------------------------
# This script is designed for the technical judging panel.
# It proactively configures an egress firewall to block and LOG
# all outbound traffic during the demo. 
# It then monitors the logs, providing real-time audit proof.
# ---------------------------------------------------------

echo "🔒 Starting Sovereignty Audit Harness (iptables setup)..."
echo "---------------------------------------------------------"

# Ensure we are running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Fatal Error: This audit script requires root privileges (sudo)."
   exit 1
fi

# 1. Initialize firewall chain
echo "🛡️  Initializing audit ruleset..."
iptables -N SOVEREIGN_AUDIT || true
iptables -F SOVEREIGN_AUDIT

# 2. Add an EXPLICIT ALLOW rule for local traffic (LAN & Loopback)
# This allows the backend to talk to Ollama, Qdrant, etc. on localhost.
# It does NOT allow external internet access.
iptables -A SOVEREIGN_AUDIT -o lo -j ACCEPT
# Assuming the venue provides DHCP in 10.x.x.x, 172.16.x.x, or 192.168.x.x
iptables -A SOVEREIGN_AUDIT -d 10.0.0.0/8 -j ACCEPT
iptables -A SOVEREIGN_AUDIT -d 172.16.0.0/12 -j ACCEPT
iptables -A SOVEREIGN_AUDIT -d 192.168.0.0/16 -j ACCEPT

# 3. Add the ultimate SIH Sovereignty Proof rule
# Blocks and LOGS (via syslog/journald) any other outbound attempt.
echo "⚠️  Enforcing strict DROP-ALL ruleset with LOGGING..."
iptables -A SOVEREIGN_AUDIT -p tcp -j LOG --log-prefix "🔒 SOVEREIGN_BREACH_ALERT: " --log-level 4
iptables -A SOVEREIGN_AUDIT -j DROP

# 4. Insert the audit chain at the top of the standard OUTPUT table
# This ensures it is processed BEFORE any standard system rules.
iptables -I OUTPUT 1 -j SOVEREIGN_AUDIT

echo "✅ Firewall secured. Sovereignty Mode is ACTIVE."
echo "---------------------------------------------------------"
echo "📋 Starting real-time audit monitoring (Press Ctrl+C to stop)"
echo "   Monitor your Agentic traces in the workbench UI."
echo "   This view proves zero data packets have left the network."
echo "---------------------------------------------------------"

# 5. Start auditing logs (polling via journalctl is usually safest on modern Linux)
# Look specifically for the log prefix we defined above.
journalctl -f | grep --line-buffered "SOVEREIGN_BREACH_ALERT"