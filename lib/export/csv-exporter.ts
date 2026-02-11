/**
 * CSV Exporter for Awaken Tax format
 * 
 * Generates CSV files formatted according to Awaken Tax specifications
 * for perpetuals/futures tax reporting.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5, 13.2 - CSV export functionality
 */

import type { Transaction, TransactionType } from '../blockchain/types';
import { DateFormatter } from '../utils/date-formatter';

/**
 * Awaken Tax CSV row format
 * 
 * Based on: https://help.awaken.tax/en/articles/10453931-formatting-perpetuals-futures-csvs
 */
export interface AwakenTaxRow {
  Date: string;                // ISO 8601 format
  Type: string;                // Buy, Sell, Trade, Income, etc.
  'Buy Amount': string;        // Amount received
  'Buy Currency': string;      // Currency received
  'Sell Amount': string;       // Amount sent
  'Sell Currency': string;     // Currency sent
  'Fee Amount': string;        // Transaction fee amount
  'Fee Currency': string;      // Fee currency
  Exchange: string;            // Exchange name (Osmosis)
  'Transaction ID': string;    // Transaction hash
}

/**
 * CSVExporter class
 * 
 * Handles conversion of blockchain transactions to Awaken Tax CSV format
 * and provides download functionality.
 */
export class CSVExporter {
  /**
   * Export transactions to Awaken Tax CSV format
   * 
   * Requirements: 4.1, 4.2 - CSV generation with proper format
   * 
   * @param transactions - Array of transactions to export
   * @returns CSV string
   */
  exportToAwakenTax(transactions: Transaction[]): string {
    const rows = transactions.map(tx => this.mapToAwakenTax(tx));
    return this.generateCSV(rows);
  }

  /**
   * Map a transaction to Awaken Tax format
   * 
   * Requirements: 4.3, 13.2 - Transaction type mapping and data preservation
   * 
   * @param tx - Transaction to map
   * @returns Awaken Tax row
   */
  private mapToAwakenTax(tx: Transaction): AwakenTaxRow {
    // Initialize row with common fields
    const row: AwakenTaxRow = {
      Date: DateFormatter.formatForCSV(tx.timestamp),
      Type: this.mapTransactionType(tx.type),
      'Buy Amount': '',
      'Buy Currency': '',
      'Sell Amount': '',
      'Sell Currency': '',
      'Fee Amount': tx.fee.value,
      'Fee Currency': tx.fee.symbol,
      Exchange: 'Osmosis',
      'Transaction ID': tx.hash,
    };

    // Map amounts based on transaction type
    switch (tx.type) {
      case 'swap':
        return this.mapSwap(tx, row);
      
      case 'transfer':
        return this.mapTransfer(tx, row);
      
      case 'stake':
        return this.mapStake(tx, row);
      
      case 'unstake':
        return this.mapUnstake(tx, row);
      
      case 'claim_rewards':
        return this.mapClaimRewards(tx, row);
      
      case 'provide_liquidity':
        return this.mapProvideLiquidity(tx, row);
      
      case 'remove_liquidity':
        return this.mapRemoveLiquidity(tx, row);
      
      default:
        return row;
    }
  }

  /**
   * Map transaction type to Awaken Tax type
   * 
   * Requirements: 4.3 - Transaction type mapping
   * 
   * @param type - Blockchain transaction type
   * @returns Awaken Tax transaction type
   */
  private mapTransactionType(type: TransactionType): string {
    const typeMap: Record<TransactionType, string> = {
      'swap': 'Trade',
      'transfer': 'Transfer',  // Will be refined to Buy/Sell based on direction
      'stake': 'Stake',
      'unstake': 'Unstake',
      'claim_rewards': 'Income',
      'provide_liquidity': 'Trade',
      'remove_liquidity': 'Trade',
      'vote': 'Other',
      'unknown': 'Other',
    };

    return typeMap[type] || 'Other';
  }

  /**
   * Map swap transaction
   * 
   * Swap: Trade type with input as Sell and output as Buy
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapSwap(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length >= 2) {
      // First amount is typically the input (sell)
      row['Sell Amount'] = tx.amounts[0].value;
      row['Sell Currency'] = tx.amounts[0].symbol;
      
      // Second amount is the output (buy)
      row['Buy Amount'] = tx.amounts[1].value;
      row['Buy Currency'] = tx.amounts[1].symbol;
    } else if (tx.amounts.length === 1) {
      // If only one amount, assume it's the sell amount
      row['Sell Amount'] = tx.amounts[0].value;
      row['Sell Currency'] = tx.amounts[0].symbol;
    }

    return row;
  }

  /**
   * Map transfer transaction
   * 
   * Transfer can be either Buy (received) or Sell (sent)
   * For now, we'll mark it as Transfer and let the user categorize
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapTransfer(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      // Assume transfer out (sell) by default
      row['Sell Amount'] = tx.amounts[0].value;
      row['Sell Currency'] = tx.amounts[0].symbol;
    }

    return row;
  }

  /**
   * Map stake transaction
   * 
   * Stake: Staked token goes to Sell
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapStake(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      row['Sell Amount'] = tx.amounts[0].value;
      row['Sell Currency'] = tx.amounts[0].symbol;
    }

    return row;
  }

  /**
   * Map unstake transaction
   * 
   * Unstake: Unstaked token goes to Buy
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapUnstake(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      row['Buy Amount'] = tx.amounts[0].value;
      row['Buy Currency'] = tx.amounts[0].symbol;
    }

    return row;
  }

  /**
   * Map claim rewards transaction
   * 
   * Claim rewards: Income type with reward as Buy
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapClaimRewards(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      row['Buy Amount'] = tx.amounts[0].value;
      row['Buy Currency'] = tx.amounts[0].symbol;
    }

    return row;
  }

  /**
   * Map provide liquidity transaction
   * 
   * Provide liquidity: Trade with input tokens as Sell and LP token as Buy
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapProvideLiquidity(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      // Input tokens (sell)
      const sellAmounts = tx.amounts.map(a => a.value).join('+');
      const sellCurrencies = tx.amounts.map(a => a.symbol).join('+');
      
      row['Sell Amount'] = sellAmounts;
      row['Sell Currency'] = sellCurrencies;
      
      // LP token would be in Buy, but we don't have that info in the transaction
      // User will need to add this manually
    }

    return row;
  }

  /**
   * Map remove liquidity transaction
   * 
   * Remove liquidity: Trade with LP token as Sell and output tokens as Buy
   * 
   * @param tx - Transaction
   * @param row - Awaken Tax row
   * @returns Updated row
   */
  private mapRemoveLiquidity(tx: Transaction, row: AwakenTaxRow): AwakenTaxRow {
    if (tx.amounts.length > 0) {
      // Output tokens (buy)
      const buyAmounts = tx.amounts.map(a => a.value).join('+');
      const buyCurrencies = tx.amounts.map(a => a.symbol).join('+');
      
      row['Buy Amount'] = buyAmounts;
      row['Buy Currency'] = buyCurrencies;
      
      // LP token would be in Sell, but we don't have that info in the transaction
      // User will need to add this manually
    }

    return row;
  }

  /**
   * Generate CSV string from Awaken Tax rows
   * 
   * Requirements: 4.5 - CSV generation with proper escaping
   * 
   * @param rows - Array of Awaken Tax rows
   * @returns CSV string
   */
  private generateCSV(rows: AwakenTaxRow[]): string {
    // Define column headers
    const headers: (keyof AwakenTaxRow)[] = [
      'Date',
      'Type',
      'Buy Amount',
      'Buy Currency',
      'Sell Amount',
      'Sell Currency',
      'Fee Amount',
      'Fee Currency',
      'Exchange',
      'Transaction ID',
    ];

    // Generate header row
    const headerRow = headers.map(h => this.escapeCSVField(h)).join(',');

    // Generate data rows
    const dataRows = rows.map(row => {
      return headers.map(header => {
        const value = row[header] || '';
        return this.escapeCSVField(value);
      }).join(',');
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Escape a CSV field
   * 
   * Requirements: 4.5 - Proper CSV escaping
   * 
   * Handles special characters (commas, quotes, newlines) by wrapping
   * the field in quotes and escaping internal quotes.
   * 
   * @param field - Field value to escape
   * @returns Escaped field value
   */
  private escapeCSVField(field: string): string {
    // Convert to string if not already
    const value = String(field);

    // Check if field needs escaping (contains comma, quote, or newline)
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Escape quotes by doubling them
      const escaped = value.replace(/"/g, '""');
      // Wrap in quotes
      return `"${escaped}"`;
    }

    return value;
  }

  /**
   * Download CSV file
   * 
   * Requirements: 4.4 - Browser download with proper filename
   * 
   * @param csv - CSV string
   * @param walletAddress - Wallet address for filename
   */
  downloadCSV(csv: string, walletAddress: string): void {
    // Generate filename
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `osmosis-transactions-${walletAddress}-${date}.csv`;

    // Create blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename for CSV export
   * 
   * Requirements: 4.4 - Filename format
   * 
   * @param walletAddress - Wallet address
   * @param date - Optional date (defaults to current date)
   * @returns Filename string
   */
  generateFilename(walletAddress: string, date?: Date): string {
    const dateStr = date 
      ? date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    return `osmosis-transactions-${walletAddress}-${dateStr}.csv`;
  }
}
