'use client';

/**
 * TransactionViewer page component
 * 
 * Main page for viewing wallet transactions with table, export, and wallet tracker.
 * Integrates all components and handles transaction fetching logic.
 * 
 * Requirements: 1.3, 2.1, 2.3, 2.4, 2.5, 3.1, 4.1, 5.1 - Transaction viewing
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet as WalletIcon, Bookmark } from 'lucide-react';
import { OsmosisClient } from '@/lib/blockchain/osmosis-client';
import { WalletManager } from '@/lib/storage/wallet-manager';
import type { Transaction } from '@/lib/blockchain/types';
import { TransactionTable } from '@/components/transaction-table';
import { ExportButton } from '@/components/ui/export-button';
import { WalletTracker } from '@/components/wallet-tracker';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { SuccessToast } from '@/components/ui/success-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TransactionViewerPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (address) {
      fetchTransactions();
      checkIfSaved();
    }
  }, [address]);

  const checkIfSaved = () => {
    if (typeof window !== 'undefined') {
      try {
        const walletManager = new WalletManager();
        setIsSaved(walletManager.isWalletSaved(address));
      } catch (error) {
        console.error('Error checking saved wallet:', error);
      }
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new OsmosisClient();
      await client.initialize();

      if (!client.validateAddress(address)) {
        throw new Error('Invalid Osmosis wallet address');
      }

      const txs = await client.fetchTransactions(address);
      setTransactions(txs);

      if (txs.length === 0) {
        setError('No transactions found for this wallet address');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWallet = () => {
    if (!isSaved) {
      setShowSaveDialog(true);
    }
  };

  const handleConfirmSave = () => {
    if (saveLabel.trim() && typeof window !== 'undefined') {
      const walletManager = new WalletManager();
      walletManager.saveWallet(address, saveLabel.trim());
      setIsSaved(true);
      setShowSaveDialog(false);
      setSaveLabel('');
      setSuccessMessage('Wallet saved successfully!');
    }
  };

  const handleExportSuccess = () => {
    setSuccessMessage('CSV exported successfully!');
  };

  const handleExportError = (error: Error) => {
    setError(`Export failed: ${error.message}`);
  };

  const handleSelectWallet = (newAddress: string) => {
    router.push(`/wallet/${newAddress}`);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Wallet Transactions
                </h1>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {truncateAddress(address)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSaved && !isLoading && transactions.length > 0 && (
              <button
                onClick={handleSaveWallet}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-sm font-medium">Save Wallet</span>
              </button>
            )}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <WalletIcon className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="glass p-12 rounded-2xl border border-gray-200 dark:border-gray-800">
              <LoadingState message="Fetching transactions from Osmosis blockchain..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorDisplay
              message={error}
              onRetry={fetchTransactions}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Transactions */}
          {!isLoading && !error && transactions.length > 0 && (
            <>
              {/* Stats and Export */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                      Transaction History
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ExportButton
                    transactions={transactions}
                    walletAddress={address}
                    onSuccess={handleExportSuccess}
                    onError={handleExportError}
                  />
                </div>
              </motion.div>

              {/* Transaction Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TransactionTable transactions={transactions} />
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Wallet Tracker */}
      <WalletTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onSelectWallet={handleSelectWallet}
        currentAddress={address}
      />

      {/* Save Wallet Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Save Wallet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Give this wallet a label for easy access later
            </p>
            <input
              type="text"
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              placeholder="e.g., My Main Wallet"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleConfirmSave}
                disabled={!saveLabel.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveLabel('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        isVisible={!!successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </div>
  );
}
