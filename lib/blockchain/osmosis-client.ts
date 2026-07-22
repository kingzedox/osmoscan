/**
 * Osmosis blockchain client implementation
 * 
 * This client implements the BlockchainClient interface for the Osmosis blockchain
 * using CosmJS for blockchain interaction.
 * 
 * Requirements: 2.1, 2.2, 2.6, 11.2 - Osmosis blockchain integration
 */

import { StargateClient } from '@cosmjs/stargate';
import { decodeTxRaw } from '@cosmjs/proto-signing';
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
  private blockCache: Map<number, Date> = new Map();

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
    const osmosisAddressRegex = /^osmo1[a-z0-9]{38}$/;
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
    options?: { limit?: number; offset?: number; startDate?: Date; endDate?: Date },
    onProgress?: (txs: Transaction[]) => void
  ): Promise<Transaction[]> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    if (!this.validateAddress(address)) {
      throw new Error('Invalid Osmosis address format');
    }

    const allTransactions: Transaction[] = [];
    const limit = options?.limit || 500;
    
    try {
      const cometClient = (this.client as any).forceGetCometClient();
      let page = 1;
      let hasMore = true;
      let sentTotal = 1;
      let receivedTotal = 1;

      while (hasMore && allTransactions.length < limit) {
        const [sentRes, receivedRes] = await Promise.all([
          sentTotal > 0 ? cometClient.txSearch({ query: `message.sender='${address}'`, page, per_page: 50, order_by: "desc" }) : Promise.resolve({ txs: [], totalCount: 0 }),
          receivedTotal > 0 ? cometClient.txSearch({ query: `transfer.recipient='${address}'`, page, per_page: 50, order_by: "desc" }) : Promise.resolve({ txs: [], totalCount: 0 })
        ]);

        sentTotal = sentRes.totalCount;
        receivedTotal = receivedRes.totalCount;

        if (sentRes.txs.length === 0 && receivedRes.txs.length === 0) {
          break;
        }

        const formatTx = (tx: any) => ({
          height: tx.height,
          hash: Buffer.from(tx.hash).toString('hex').toUpperCase(),
          code: tx.result.code,
          tx: tx.tx
        });

        const newTxs = [...sentRes.txs, ...receivedRes.txs].map(formatTx);
        
        // Deduplicate and parse this page
        const txMap = new Map<string, any>();
        for (const tx of newTxs) {
          txMap.set(tx.hash, tx);
        }

        const uniqueNewTxs = Array.from(txMap.values());
        
        // Parse the new transactions
        for (const tx of uniqueNewTxs) {
          try {
            const parsedTx = await this.parseTransaction(tx, address);
            if (options?.startDate && parsedTx.timestamp < options.startDate) continue;
            if (options?.endDate && parsedTx.timestamp > options.endDate) continue;
            
            allTransactions.push(parsedTx);
            allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            if (allTransactions.length > limit) {
              allTransactions.length = limit;
            }

            // Call onProgress for each transaction parsed so the UI ticks up 1 by 1
            if (onProgress) {
              onProgress([...allTransactions]);
            }
          } catch (e) {
            console.error('Error parsing tx:', e);
          }
        }

        page++;
        hasMore = (sentRes.txs.length === 50 || receivedRes.txs.length === 50);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
    
    // Fetch precise block timestamp instead of approximating
    let timestamp = new Date();
    if (!this.blockCache.has(tx.height)) {
      try {
        const block = await this.client!.getBlock(tx.height);
        this.blockCache.set(tx.height, new Date(block.header.time));
      } catch (e) {
        console.error('Failed to get block time for height', tx.height, e);
        this.blockCache.set(tx.height, new Date(1624035600000 + (tx.height * 2400))); // fallback to approximation
      }
    }
    timestamp = this.blockCache.get(tx.height)!;
    const status: TransactionStatus = tx.code === 0 ? 'success' : 'failed';
    
    const decodedTx = decodeTxRaw(tx.tx);

    // Parse transaction type and amounts using TransactionParser
    const { type, amounts } = this.parser.parseMessages(decodedTx.body.messages, address);

    // Parse fee using TransactionParser
    const fee = this.parser.parseFee(decodedTx.authInfo.fee);

    // Extract memo
    const memo = decodedTx.body.memo || undefined;

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

    const decodedTx = decodeTxRaw(tx.tx);

    // Add detailed information
    return {
      ...basicTx,
      blockHeight: tx.height,
      gasUsed: Number(tx.gasUsed),
      gasWanted: Number(tx.gasWanted),
      rawLog: tx.rawLog,
      messages: decodedTx.body.messages as any[],
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
