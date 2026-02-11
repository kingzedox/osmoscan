'use client';

/**
 * WalletTracker component
 * 
 * Slide-out panel for managing saved wallet addresses.
 * Allows users to save, edit, delete, and quickly access wallet addresses.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 - Wallet tracking functionality
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Wallet, Plus } from 'lucide-react';
import { WalletManager, type SavedWallet } from '@/lib/storage/wallet-manager';
import { DateFormatter } from '@/lib/utils/date-formatter';

interface WalletTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (address: string) => void;
  currentAddress?: string;
}

export function WalletTracker({
  isOpen,
  onClose,
  onSelectWallet,
  currentAddress,
}: WalletTrackerProps) {
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // Load wallets on mount and when panel opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      loadWallets();
    }
  }, [isOpen]);

  const loadWallets = () => {
    if (typeof window === 'undefined') return;
    const walletManager = new WalletManager();
    const saved = walletManager.getSavedWallets();
    setWallets(saved);
  };

  const handleDelete = (address: string) => {
    if (typeof window === 'undefined') return;
    const walletManager = new WalletManager();
    walletManager.removeWallet(address);
    loadWallets();
  };

  const handleStartEdit = (wallet: SavedWallet) => {
    setEditingAddress(wallet.address);
    setEditLabel(wallet.label);
  };

  const handleSaveEdit = () => {
    if (typeof window === 'undefined') return;
    if (editingAddress && editLabel.trim()) {
      const walletManager = new WalletManager();
      walletManager.updateLabel(editingAddress, editLabel.trim());
      setEditingAddress(null);
      setEditLabel('');
      loadWallets();
    }
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setEditLabel('');
  };

  const handleSelectWallet = (address: string) => {
    if (typeof window === 'undefined') return;
    const walletManager = new WalletManager();
    walletManager.updateLastViewed(address);
    onSelectWallet(address);
    onClose();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Slide-out panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="glass border-b border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      Saved Wallets
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'} saved
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Wallet list */}
            <div className="p-6 space-y-3 overflow-y-auto h-[calc(100%-88px)]">
              {wallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
                    No saved wallets
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    View a wallet's transactions and save it for quick access later
                  </p>
                </div>
              ) : (
                wallets.map((wallet) => (
                  <motion.div
                    key={wallet.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      glass p-4 rounded-lg border transition-all
                      ${
                        currentAddress === wallet.address
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    {editingAddress === wallet.address ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Wallet label"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => handleSelectWallet(wallet.address)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-50">
                              {wallet.label}
                            </h3>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(wallet);
                                }}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(wallet.address);
                                }}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-2">
                            {truncateAddress(wallet.address)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Added {DateFormatter.getRelativeTime(wallet.addedAt)}
                            </span>
                            {wallet.lastViewed && (
                              <span>
                                Viewed {DateFormatter.getRelativeTime(wallet.lastViewed)}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
