# My Vibecode dApp – Daily BTC Tip Jar

Simple tipping jar on Bitcoin L1 via OPNet. Users send micro-tips in BTC once per day per wallet. Jar owner withdraws every 7 days.

Built with Vibecode Bible + Claude Code + buidl-opnet-plugin.

## Features
- Daily cooldown (24h per wallet)
- Show balance, last 10 tips
- Dark cyberpunk UI with timer and animation
- OP_WALLET connect, simulate tx before send
- Quantum-safe (ML-DSA signatures)

## How to Run Locally
```bash
# Frontend
cd frontend
npm install
npm run dev
