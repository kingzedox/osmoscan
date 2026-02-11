/**
 * Osmosis blockchain client implementation
 * 
 * This client implements the BlockchainClient interface for the Osmosis blockchain
 * using CosmJS for blockchain interaction.
 * 
 * Requirements: 2.1, 2.2, 2.6, 11.2 - Osmosis blockchain integration
 */

import { StargateClient } from '@cosmjs/stargate';
import type {
  BlockchainClient,
  Transaction,
  TransactionDetail,
  FetchOptions,
  Amount,
  TransactionStatus,
} from './types';
import { TransactionParser } from './transaction-parser';

/**
 * Osmosis blockchain client
 * 
 * Provides methods to interact with the Osmosis blockchain including
 * address validation, transaction fetching, and transaction details.
 */
export class OsmosisClient implements BlockchainClient {
  private rpcEndpoint: string;
  private client: StargateClient | null = null;
  private parser: TransactionParser;

  /**
   * Create a new OsmosisClient
   * 
   * @param rpcEndpoint - The RPC endpoint URL for the Osmosis blockchain
   */
  constructor(rpcEndpoint: string = 'https://rpc.osmosis.zone') {
    this.rpcEndpoint = rpcEndpoint;
    this.parser = new TransactionParser();
  }

  /**
   * Initialize the client by connecting to the RPC endpoint
   * 
   * This method must be called before using other methods.
   */
  async initialize(): Promise<void> {
    if (!this.client) {
      this.client = await StargateClient.connect(this.rpcEndpoint);
    }
  }

  /**
   * Validate an Osmosis wallet address
   * 
   * Requirements: 1.1 - Address validation
   * 
   * Osmosis addresses follow the bech32 format and start with "osmo"
   * followed by 39 lowercase alphanumeric characters.
   * 
   * @param address - The wallet address to validate
   * @returns true if the address is valid, false otherwise
   */
  validateAddress(address: string): boolean {
    // Osmosis addresses are bech32 format: osmo + 39 alphanumeric characters
    // Total length: 4 (osmo) + 39 = 43 characters
    const osmosisAddressRegex = /^osmo[a-z0-9]{39}$/;
    return osmosisAddressRegex.test(address);
  }

  /**
   * Fetch transaction history for a wallet address
   * 
   * Requirements: 2.1, 2.2 - Transaction fetching with pagination
   * 
   * This method retrieves all transactions for a given address, handling
   * pagination automatically to fetch the complete transaction history.
   * 
   * @param address - The wallet address to fetch transactions for
   * @param options - Optional fetch options (pagination, date filters)
   * @returns Promise resolving to array of transactions
   */
  async fetchTransactions(
    address: string,
    options?: FetchOptions
  ): Promise<Transaction[]> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    if (!this.validateAddress(address)) {
      throw new Error('Invalid Osmosis address format');
    }

    const allTransactions: Transaction[] = [];
    const limit = options?.limit || 100;
    let offset = options?.offset || 0;
    let hasMore = true;

    // Fetch transactions with pagination
    while (hasMore) {
      try {
        // Use CosmJS to search for transactions
        // Search for both sent and received transactions
        const txs = await this.client.searchTx([
          { key: 'message.sender', value: address },
          { key: 'transfer.recipient', value: address },
        ], {
          page: Math.floor(offset / limit) + 1,
          per_page: limit,
        });

        if (txs.length === 0) {
          hasMore = false;
          break;
        }

        // Parse and normalize transactions
        for (const tx of txs) {
          const parsedTx = await this.parseTransaction(tx, address);
          
          // Apply date filters if provided
          if (options?.startDate && parsedTx.timestamp < options.startDate) {
            continue;
          }
          if (options?.endDate && parsedTx.timestamp > options.endDate) {
            continue;
          }

          allTransactions.push(parsedTx);
        }

        // Check if we should continue pagination
        if (txs.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }

        // If a specific limit was requested and we've reached it, stop
        if (options?.limit && allTransactions.length >= options.limit) {
          hasMore = false;
        }
      } catch (error) {
        // If we encounter an error during pagination, return what we have
        console.error('Error fetching transactions:', error);
        hasMore = false;
      }
    }

    return allTransactions;
  }

  /**
   * Parse a raw transaction from CosmJS into our normalized format
   * 
   * @param tx - Raw transaction from CosmJS
   * @param address - The wallet address (to determine transaction direction)
   * @returns Normalized transaction
   */
  private async parseTransaction(tx: any, address: string): Promise<Transaction> {
    // Extract basic transaction info
    const hash = tx.hash;
    const timestamp = new Date(tx.height * 5000); // Approximate timestamp (5s per block)
    const status: TransactionStatus = tx.code === 0 ? 'success' : 'failed';

    // Parse transaction type and amounts using TransactionParser
    const { type, amounts } = this.parser.parseMessages(tx.tx.body.messages, address);

    // Parse fee using TransactionParser
    const fee = this.parser.parseFee(tx.tx.authInfo.fee);

    // Extract memo
    const memo = tx.tx.body.memo || undefined;

    return {
      hash,
      timestamp,
      type,
      status,
      amounts,
      fee,
      memo,
    };
  }

  /**
   * Get detailed information for a specific transaction
   * 
   * Requirements: 2.6 - Transaction details extraction
   * 
   * @param txHash - The transaction hash to fetch details for
   * @returns Promise resolving to detailed transaction information
   */
  async getTransactionDetails(txHash: string): Promise<TransactionDetail> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const tx = await this.client.getTx(txHash);
    
    if (!tx) {
      throw new Error(`Transaction not found: ${txHash}`);
    }

    // Parse basic transaction info
    const basicTx = await this.parseTransaction(tx, '');

    // Add detailed information
    return {
      ...basicTx,
      blockHeight: tx.height,
      gasUsed: tx.gasUsed,
      gasWanted: tx.gasWanted,
      rawLog: tx.rawLog,
      messages: tx.tx.body.messages,
    };
  }

  /**
   * Get block explorer URL for a transaction
   * 
   * Requirements: 3.4 - Transaction hash links
   * 
   * @param txHash - The transaction hash
   * @returns URL to view transaction on Mintscan block explorer
   */
  getBlockExplorerUrl(txHash: string): string {
    return `https://www.mintscan.io/osmosis/txs/${txHash}`;
  }

  /**
   * Disconnect the client
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }
}
