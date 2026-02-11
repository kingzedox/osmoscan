'use client';

/**
 * Transaction Table Component
 * 
 * Displays transactions in a sortable, responsive table format.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 12.2
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import type { Transaction } from '@/lib/blockchain/types';
import { DateFormatter } from '@/lib/utils/date-formatter';
import { AmountFormatter } from '@/lib/utils/amount-formatter';

export interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick?: (hash: string) => void;
}

type SortField = 'timestamp' | 'type' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

export function TransactionTable({
  transactions,
  onTransactionClick,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'amount':
          const aAmount = a.amounts[0]?.value || '0';
          const bAmount = b.amounts[0]?.value || '0';
          comparison = parseFloat(aAmount) - parseFloat(bAmount);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [transactions, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTransactionClick = (hash: string) => {
    if (onTransactionClick) {
      onTransactionClick(hash);
    } else {
      // Default: open in block explorer
      window.open(`https://www.mintscan.io/osmosis/txs/${hash}`, '_blank');
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-lg border border-border/50 p-12 text-center">
        <p className="text-muted-foreground">
          No transactions found for this wallet address.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-lg border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 backdrop-blur-xl">
              <tr>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Type
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <span className="font-semibold text-sm">Transaction Hash</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((tx, index) => (
                <motion.tr
                  key={tx.hash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  className="border-t border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleTransactionClick(tx.hash)}
                >
                  <td className="p-4">
                    <div className="text-sm">
                      {DateFormatter.formatForDisplay(tx.timestamp)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {DateFormatter.getRelativeTime(tx.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    {tx.amounts.length > 0 ? (
                      <div className="space-y-1">
                        {tx.amounts.slice(0, 2).map((amount, i) => (
                          <div key={i} className="text-sm font-mono">
                            {AmountFormatter.formatWithSymbol(amount, 6)}
                          </div>
                        ))}
                        {tx.amounts.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{tx.amounts.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'success'
                          ? 'bg-green-500/10 text-green-500'
                          : tx.status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sortedTransactions.map((tx, index) => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
            className="glass rounded-lg border border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleTransactionClick(tx.hash)}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {tx.type.replace('_', ' ')}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tx.status === 'success'
                    ? 'bg-green-500/10 text-green-500'
                    : tx.status === 'failed'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}
              >
                {tx.status}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Date</div>
                <div className="text-sm">
                  {DateFormatter.formatForDisplay(tx.timestamp)}
                </div>
              </div>

              {tx.amounts.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Amount</div>
                  <div className="space-y-1">
                    {tx.amounts.slice(0, 2).map((amount, i) => (
                      <div key={i} className="text-sm font-mono">
                        {AmountFormatter.formatWithSymbol(amount, 6)}
                      </div>
                    ))}
                    {tx.amounts.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{tx.amounts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground">
                    {tx.hash.slice(0, 12)}...{tx.hash.slice(-8)}
                  </code>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
