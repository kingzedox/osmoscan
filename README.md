# ⚛️ Osmoscan

A lightning-fast, sleek, and modern transaction viewer for the Osmosis blockchain. Osmoscan allows you to instantly track, parse, and export wallet history with real-time progress indicators and precise block timestamps.

## Highlights

- **Instant Insights**: Enter any Osmosis address and watch transactions stream in with an animated, real-time counter.
- **Pinpoint Accuracy**: Fetches exact block headers in the background for millisecond-accurate transaction timestamps.
- **Clean UI**: Beautiful glassmorphism, fluid animations, and a pristine minimalist design tailored for maximum readability.
- **Smart Parsing**: Automatically translates raw Protobuf transactions (like IBC transfers and smart contract executions) into human-readable types.
- **CSV Export**: Instantly export your transaction history into clean CSV files with a single click.
- **Wallet Tracker**: Save your favorite addresses directly to your browser's local storage for quick access.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS & Framer Motion
- **Blockchain**: `@cosmjs/stargate` (Cosmos SDK/Tendermint RPC)

## ⚡️ Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/kingzedox/osmoscan.git
cd osmoscan

# 2. Install dependencies
npm install

# 3. Start the engine
npm run dev
```

Visit `http://localhost:3000` to start scanning!

---
*Built for the Cosmos ecosystem. No databases, no tracking, just pure frontend querying.*
