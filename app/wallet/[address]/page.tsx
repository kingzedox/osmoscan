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
import { motion, animate } from 'framer-motion';
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
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const controls = animate(displayCount, transactions.length, {
      duration: 1,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayCount(Math.floor(value));
      }
    });
    return () => controls.stop();
  }, [transactions.length]);

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

      const txs = await client.fetchTransactions(address, { limit: 500 }, (newTxs) => {
        setTransactions(newTxs);
      });
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
    <div className="min-h-screen bg-[#F9F9F9] text-[#111111]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900">
                  Wallet Transactions
                </h1>
                <p className="text-xs font-mono text-gray-600">
                  {truncateAddress(address)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSaved && !isLoading && transactions.length > 0 && (
              <button
                onClick={handleSaveWallet}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-sm font-medium">Save Wallet</span>
              </button>
            )}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <WalletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading State */}
          {isLoading && transactions.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm">
              <LoadingState message="Fetching transactions from Osmosis blockchain..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && transactions.length === 0 && (
            <ErrorDisplay
              message={error}
              onRetry={fetchTransactions}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Transactions */}
          {(transactions.length > 0 || (!isLoading && !error)) && (
            <>
              {/* Stats and Export */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative"
              >

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Transaction History
                    </h2>
                    <div className="text-gray-600">
                      {isLoading && transactions.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span>Scanning... found <strong className="text-primary text-lg">{displayCount}</strong> transactions</span>
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                          </div>
                          <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                            <motion.div
                              className="absolute top-0 bottom-0 left-0 w-1/2 bg-primary rounded-full"
                              initial={{ x: '-100%' }}
                              animate={{ x: '200%' }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p>Found {displayCount} transaction{displayCount !== 1 ? 's' : ''}</p>
                      )}
                    </div>
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
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Save Wallet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
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
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleConfirmSave}
                disabled={!saveLabel.trim()}
                className="flex-1 px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e66000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveLabel('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
