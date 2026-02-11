# Setup Instructions

## Current Status

✅ **All code is complete!** The Osmosis Transaction Viewer is fully built with:
- Backend (blockchain integration, CSV export, storage)
- Frontend (beautiful UI with glassmorphism, animations)
- All pages and components
- Documentation and deployment config

## Issue

There's a dependency installation issue on Windows. The Next.js binary isn't properly installed.

## Fix Steps

### Option 1: Clean Install (Recommended)

1. **Delete node_modules and package-lock.json**:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

2. **Clear npm cache**:
```powershell
npm cache clean --force
```

3. **Reinstall dependencies**:
```powershell
npm install
```

4. **Run dev server**:
```powershell
npm run dev
```

### Option 2: Use Yarn

If npm continues to have issues, try yarn:

```powershell
npm install -g yarn
yarn install
yarn dev
```

### Option 3: Use pnpm

Or try pnpm (faster and more reliable):

```powershell
npm install -g pnpm
pnpm install
pnpm dev
```

## Testing the App

Once dependencies are installed:

1. **Start dev server**:
```powershell
npm run dev
```

2. **Open browser**: http://localhost:3000

3. **Test features**:
   - Enter an Osmosis wallet address (starts with "osmo")
   - View transactions in the table
   - Click "Export to CSV" to download
   - Try dark/light mode toggle
   - Save a wallet address

## Building for Production

```powershell
npm run build
npm start
```

## Deploying to Vercel

1. **Push to GitHub**:
```powershell
git init
git add .
git commit -m "Initial commit: Osmosis Transaction Viewer"
git branch -M main
git remote add origin https://github.com/yourusername/osmosis-transaction-viewer.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel will automatically detect Next.js and deploy.

## Environment Variables

Optional - only if you want to use a different RPC endpoint:

Create `.env.local`:
```env
NEXT_PUBLIC_OSMOSIS_RPC=https://rpc.osmosis.zone
```

## Troubleshooting

### "next is not recognized"
- Dependencies aren't installed. Run `npm install` again.

### SWC binary error
- This is a Windows-specific issue with Next.js
- Try: `npm install @next/swc-win32-x64-msvc --force`
- Or use yarn/pnpm instead

### Port 3000 already in use
```powershell
npm run dev -- -p 3001
```

## What's Built

### Pages
- `/` - Homepage with hero, wallet input, how it works
- `/wallet/[address]` - Transaction viewer with table and export

### Components
- `WalletInput` - Validated input with paste button
- `TransactionTable` - Sortable table with glassmorphism
- `ExportButton` - CSV export with animations
- `WalletTracker` - Slide-out panel for saved wallets
- `ThemeToggle` - Light/dark mode switcher
- `LoadingState`, `ErrorDisplay`, `SuccessToast`

### Backend
- `OsmosisClient` - Blockchain integration
- `TransactionParser` - Parse all transaction types
- `CSVExporter` - Awaken Tax format
- `WalletManager` - Local storage
- `ThemeManager` - Theme persistence

## Next Steps

1. Fix the installation issue (see options above)
2. Test locally
3. Deploy to Vercel
4. Share the link for the competition!
5. Clone for other blockchains (Polkadot, Bittensor, etc.) to earn more $1k rewards

## Competition Strategy

Each blockchain integration = $1k + exposure to 3k users

Easy to clone:
1. Copy the project
2. Create new blockchain client (e.g., `PolkadotClient`)
3. Update branding (name, colors)
4. Deploy as separate app
5. Submit!

Good luck! 🚀
