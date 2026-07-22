# Osmosis Transaction Viewer

A modern, beautiful web application for viewing Osmosis blockchain transactions and exporting them in Awaken Tax-compatible CSV format.

![Osmosis Transaction Viewer](https://via.placeholder.com/1200x600/8B5CF6/FFFFFF?text=Osmosis+Transaction+Viewer)

## ✨ Features

- 🔍 **View Transaction History** - Enter any Osmosis wallet address to view complete transaction history
- 📊 **Beautiful Table Display** - Sortable, responsive table with all transaction details
- 💾 **CSV Export** - Download transactions in Awaken Tax format for easy tax reporting
- 💼 **Wallet Tracker** - Save and manage multiple wallet addresses for quick access
- 🌓 **Dark Mode** - Smooth light/dark theme switching with system preference support
- 🎨 **Modern UI** - Glassmorphism effects, smooth animations, and gradient accents
- 📱 **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- 🚀 **Fast & Efficient** - Optimized performance with caching and pagination
- 🔓 **No Registration** - Use immediately without creating an account
- 🌐 **Open Source** - MIT licensed, free to use and modify

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- An Osmosis RPC endpoint (default: https://rpc.osmosis.zone)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/osmosis-transaction-viewer.git
cd osmosis-transaction-viewer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables (optional):
```env
NEXT_PUBLIC_OSMOSIS_RPC=https://rpc.osmosis.zone
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open Local host in your browser

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/osmosis-transaction-viewer)

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Configure environment variables (optional)
4. Deploy!

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🏗️ Architecture

The application follows a clean architecture with clear separation of concerns:

```
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage
│   └── wallet/[address]/  # Transaction viewer page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── transaction-table.tsx
│   └── wallet-tracker.tsx
├── lib/                   # Business logic
│   ├── blockchain/       # Blockchain integration
│   ├── export/           # CSV export functionality
│   ├── storage/          # Local storage management
│   └── utils/            # Utility functions
└── public/               # Static assets
```

### Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **CosmJS** - Cosmos blockchain interaction
- **shadcn/ui** - Beautiful UI components

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_OSMOSIS_RPC` | Osmosis RPC endpoint | `https://rpc.osmosis.zone` |

### Customization

The application is designed to be easily customizable:

- **Colors**: Edit `tailwind.config.ts` and `app/globals.css`
- **Fonts**: Update font imports in `app/layout.tsx`
- **RPC Endpoint**: Change in `.env.local`

## 🔄 Adapting for Other Blockchains

The architecture is designed for easy adaptation to other Cosmos-based blockchains:

1. **Create a new blockchain client** implementing the `BlockchainClient` interface:
```typescript
// lib/blockchain/your-chain-client.ts
export class YourChainClient implements BlockchainClient {
  validateAddress(address: string): boolean {
    // Implement address validation
  }
  
  async fetchTransactions(address: string): Promise<Transaction[]> {
    // Implement transaction fetching
  }
  
  // ... other methods
}
```

2. **Update the transaction parser** for chain-specific message types

3. **Update branding** (name, colors, logo)

4. **Deploy** as a separate application

### Supported Chains

This architecture works with any Cosmos SDK-based blockchain:
- Osmosis ✅
- Cosmos Hub
- Juno
- Stargaze
- And many more...

## 📊 CSV Export Format

Transactions are exported in Awaken Tax format with the following columns:

| Column | Description |
|--------|-------------|
| Date | ISO 8601 timestamp |
| Type | Transaction type (Trade, Buy, Sell, etc.) |
| Buy Amount | Amount received |
| Buy Currency | Currency received |
| Sell Amount | Amount sent |
| Sell Currency | Currency sent |
| Fee Amount | Transaction fee |
| Fee Currency | Fee currency |
| Exchange | "Osmosis" |
| Transaction ID | Transaction hash |

Learn more about the format: [Awaken Tax CSV Format](https://help.awaken.tax/en/articles/10453931-formatting-perpetuals-futures-csvs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Osmosis](https://osmosis.zone) - The decentralized exchange protocol
- [CosmJS](https://github.com/cosmos/cosmjs) - Cosmos blockchain library
- [Awaken Tax](https://awaken.tax) - Crypto tax reporting platform
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Vercel](https://vercel.com) - Deployment platform

## 📧 Support

For support, please open an issue on GitHub or contact [kingzedox@gmail.com](kiingzedox@gmail.com).

## 🔗 Links

- [Live Demo](https://your-demo-url.vercel.app)
- [Documentation](https://github.com/yourusername/osmosis-transaction-viewer/wiki)
- [Report Bug](https://github.com/yourusername/osmosis-transaction-viewer/issues)
- [Request Feature](https://github.com/yourusername/osmosis-transaction-viewer/issues)

---

Built with ❤️ for the Osmosis community
