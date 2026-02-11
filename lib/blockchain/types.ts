/**
 * Core types for blockchain abstraction layer
 * 
 * These types provide a blockchain-agnostic interface that can be implemented
 * for different chains (Osmosis, Cosmos Hub, Juno, etc.)
 */

/**
 * Transaction status enum
 */
export type TransactionStatus = 'success' | 'failed' | 'pending';

/**
 * Transaction type enum representing all supported Osmosis transaction types
 * 
 * Requirements: 11.5 - Generic transaction data model
 */
export type TransactionType = 
  | 'swap'                  // Token swap transactions
  | 'transfer'              // Send/receive transactions
  | 'stake'                 // Delegation transactions
  | 'unstake'               // Undelegation transactions
  | 'claim_rewards'         // Reward claim transactions
  | 'provide_liquidity'     // Add liquidity to pool
  | 'remove_liquidity'      // Remove liquidity from pool
  | 'vote'                  // Governance vote
  | 'unknown';              // Unrecognized transaction type

/**
 * Amount interface representing a token amount with denomination
 * 
 * Requirements: 11.5 - Generic transaction data model
 */
export interface Amount {
  /** Decimal string to preserve precision (e.g., "1.234567890123456789") */
  value: string;
  
  /** Token denomination (e.g., "uosmo", "ibc/...") */
  denom: string;
  
  /** Human-readable symbol (e.g., "OSMO", "ATOM") */
  symbol: string;
}

/**
 * Transaction interface representing a normalized blockchain transaction
 * 
 * Requirements: 11.5 - Generic transaction data model
 */
export interface Transaction {
  /** Transaction hash/ID */
  hash: string;
  
  /** Transaction timestamp */
  timestamp: Date;
  
  /** Transaction type */
  type: TransactionType;
  
  /** Transaction status */
  status: TransactionStatus;
  
  /** Array of amounts involved in the transaction (inputs/outputs) */
  amounts: Amount[];
  
  /** Transaction fee */
  fee: Amount;
  
  /** Optional memo/note attached to transaction */
  memo?: string;
}

/**
 * Detailed transaction information including raw data
 */
export interface TransactionDetail extends Transaction {
  /** Block height where transaction was included */
  blockHeight: number;
  
  /** Gas used by the transaction */
  gasUsed: number;
  
  /** Gas wanted (limit) for the transaction */
  gasWanted: number;
  
  /** Raw transaction data from blockchain */
  rawLog?: string;
  
  /** Transaction messages (raw) */
  messages: any[];
}

/**
 * Options for fetching transactions
 * 
 * Requirements: 2.2 - Pagination support
 */
export interface FetchOptions {
  /** Maximum number of transactions to fetch */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
  
  /** Filter transactions after this date */
  startDate?: Date;
  
  /** Filter transactions before this date */
  endDate?: Date;
}

/**
 * Blockchain client interface defining standard methods for blockchain interaction
 * 
 * Requirements: 11.1, 11.2 - Blockchain abstraction layer
 * 
 * This interface allows easy swapping of blockchain clients for different chains.
 * To support a new blockchain, implement this interface with chain-specific logic.
 */
export interface BlockchainClient {
  /**
   * Validate a wallet address format
   * 
   * Requirements: 1.1 - Address validation
   * 
   * @param address - The wallet address to validate
   * @returns true if address is valid for this blockchain
   */
  validateAddress(address: string): boolean;
  
  /**
   * Fetch transaction history for a wallet address
   * 
   * Requirements: 2.1, 2.2 - Transaction fetching with pagination
   * 
   * @param address - The wallet address to fetch transactions for
   * @param options - Optional fetch options (pagination, date filters)
   * @returns Promise resolving to array of transactions
   */
  fetchTransactions(address: string, options?: FetchOptions): Promise<Transaction[]>;
  
  /**
   * Get detailed information for a specific transaction
   * 
   * Requirements: 2.6 - Transaction details extraction
   * 
   * @param txHash - The transaction hash to fetch details for
   * @returns Promise resolving to detailed transaction information
   */
  getTransactionDetails(txHash: string): Promise<TransactionDetail>;
  
  /**
   * Get block explorer URL for a transaction
   * 
   * Requirements: 3.4 - Transaction hash links
   * 
   * @param txHash - The transaction hash
   * @returns URL to view transaction on block explorer
   */
  getBlockExplorerUrl(txHash: string): string;
}
