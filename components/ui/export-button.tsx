'use client';

/**
 * ExportButton component
 * 
 * Button for exporting transactions to CSV in Awaken Tax format.
 * Features loading state and success animation.
 * 
 * Requirements: 4.1, 4.4 - CSV export functionality
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check } from 'lucide-react';
import type { Transaction } from '@/lib/blockchain/types';
import { CSVExporter } from '@/lib/export/csv-exporter';

interface ExportButtonProps {
  transactions: Transaction[];
  walletAddress: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function ExportButton({
  transactions,
  walletAddress,
  disabled = false,
  onSuccess,
  onError,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting || transactions.length === 0) {
      return;
    }

    try {
      setIsExporting(true);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Export to CSV
      const exporter = new CSVExporter();
      const csv = exporter.exportToAwakenTax(transactions);
      exporter.downloadCSV(csv, walletAddress);

      // Show success animation
      setShowSuccess(true);
      onSuccess?.();

      // Reset success state after animation
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  const isEmpty = transactions.length === 0;
  const isDisabled = disabled || isEmpty;

  return (
    <motion.button
      onClick={handleExport}
      disabled={isDisabled}
      className={`
        relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-all duration-200
        ${
          isDisabled
            ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
        }
      `}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
    >
      {/* Loading spinner */}
      {isExporting && (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Success checkmark */}
      {showSuccess && !isExporting && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check className="w-5 h-5" />
        </motion.div>
      )}

      {/* Download icon */}
      {!isExporting && !showSuccess && (
        <Download className="w-5 h-5" />
      )}

      {/* Button text */}
      <span>
        {isExporting
          ? 'Exporting...'
          : showSuccess
          ? 'Exported!'
          : isEmpty
          ? 'No Transactions'
          : 'Export to CSV'}
      </span>

      {/* Transaction count badge */}
      {!isEmpty && !isExporting && !showSuccess && (
        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
          {transactions.length}
        </span>
      )}
    </motion.button>
  );
}
