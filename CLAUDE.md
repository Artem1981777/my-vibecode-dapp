Project: Daily BTC Tip Jar (OPNet L1)
This document explains how to build, run, and reason about the Daily BTC Tip Jar dApp using OPNet Bitcoin L1 smart contracts written in AssemblyScript compiled to WASM.
The goal is a minimal vibecode-style reference project demonstrating:
OPNet smart contract development
Wallet interaction
Micro-tipping logic
Cooldown mechanics
Quantum-safe signatures
A cyberpunk themed frontend
This guide is written for Claude (and other AI coding agents) so they can reliably extend and maintain the repository.
Architecture Overview
daily-btc-tip-jar/
│
├─ contract/                 # OPNet smart contract
│  ├─ index.ts
│  ├─ asconfig.json
│  └─ package.json
│
├─ frontend/                 # React + Vite UI
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  ├─ hooks/
│  │  └─ lib/
│  │
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.ts
│
├─ README.md
├─ CLAUDE.md
└─ .gitignore
Core Concept
The Daily BTC Tip Jar is a public contract where anyone can:
Send 1 tip per wallet per day
Tip any amount of BTC
View total jar balance
View recent tips
Key mechanics:
Feature
Behavior
Daily limit
1 tip per address every 24h
Tip storage
store last tip timestamp per address
Tip history
store last 10 tips
Owner withdraw
only owner
Withdraw cooldown
once every 7 days
Wallet connect
OP_WALLET
Signature scheme
ML-DSA (quantum-safe)
Contract Design
The contract is written in AssemblyScript and compiled to WASM.
Core storage structures:
map<address, u64> last_tip_time
vector<Tip> recent_tips
u64 last_withdraw_time
u64 jar_balance
address owner
Tip struct:
class Tip {
  sender: Address
  amount: u64
  timestamp: u64
}
Contract Logic
Tip Function
tip()
Steps:
Read sender address
Read current block timestamp
Check last_tip_time[sender]
If:
now - last_tip_time < 86400
→ reject transaction
Otherwise:
accept BTC
update last tip timestamp
append tip
trim list to 10 entries
Withdraw Function
withdraw()
Checks:
sender == owner
and
now - last_withdraw_time >= 7 days
If valid:
transfer full balance to owner
update withdraw timestamp
Quantum Safe Signatures
Transactions use:
ML-DSA
Reasons:
Post-quantum signature scheme
Compatible with OPNet architecture
Secure against Shor-style attacks
Wallets sign payloads before submission.
Frontend Design
Framework:
React
Vite
TypeScript
Wallet integration:
OP_WALLET
Transaction flow:
simulateTransaction()
if success:
   sendTransaction()
else:
   show error
Simulation uses null signers.
UI Style
Theme: Dark Cyberpunk
Visual characteristics:
black background
neon cyan/purple highlights
glass panels
glow effects
animated lightning
UI sections:
HEADER
Jar Balance
Tip Button
Cooldown Timer
Recent Tips List
Owner Withdraw Panel
Tip Cooldown UI
Display timer:
Next tip in HH:MM:SS
Derived from:
last_tip_time + 24h
Updates every second.
Confetti / Lightning Animation
When a tip succeeds:
Trigger:
tipSuccessAnimation()
Effects:
lightning flash
neon pulse
confetti burst
Libraries that can be used:
canvas-confetti
framer-motion
Tip List UI
Display last 10 tips:
bc1qf...8e9a     120 sats     12:44
bc1qa...12ff      50 sats     12:43
Address truncation:
first 4 chars
...
last 4 chars
Wallet Flow
Connect wallet:
await window.op_wallet.connect()
Get address:
wallet.getAddress()
Send tip:
wallet.sendTransaction(tx)
Transaction Simulation
Before sending:
simulateTransaction()
Use null signer to check:
cooldown violation
insufficient funds
invalid payload
If simulation fails:
Show readable error.
Frontend Components
Expected components:
JarBalance.tsx
TipButton.tsx
CooldownTimer.tsx
RecentTips.tsx
WalletConnect.tsx
OwnerWithdraw.tsx
Security Rules
Smart contract must enforce:
cooldown strictly on-chain
withdraw only owner
7-day withdraw delay
bounded storage (tips capped to 10)
Never rely on frontend enforcement.
Developer Commands
Run frontend:
cd frontend
npm install
npm run dev
Compile contract:
cd contract
npm install
npm run build
Testing Strategy
Test cases:
Tip Success
wallet tips once
transaction accepted
Tip Cooldown Fail
wallet tips twice within 24h
transaction rejected
Tip After Cooldown
24h passed
tip accepted
Withdraw Fail
non-owner withdraw
rejected
Withdraw Cooldown
owner withdraw twice within 7 days
rejected
Code Style
Follow Vibecode Bible style:
Principles:
minimal logic
explicit state
deterministic behavior
avoid dynamic allocation
readable security checks
Example:
Good:
if (now - lastTip < DAY) {
  revert("Cooldown active")
}
Bad:
if (cooldownActive(sender))
Expected Files To Generate Next
Claude should generate files in this order:
1️⃣ contract/index.ts
2️⃣ frontend/src/App.tsx
3️⃣ frontend components
4️⃣ README.md
5️⃣ .gitignore
End Goal
A working demo where:
users tip BTC once per day
jar balance updates
last 10 tips visible
neon cyberpunk UI
owner withdraws weekly
All powered by OPNet Bitcoin L1 smart contracts compiled to WASM.
