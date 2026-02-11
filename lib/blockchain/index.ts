/**
 * Blockchain abstraction layer
 * 
 * This module provides a blockchain-agnostic interface for interacting with
 * different blockchain networks. The abstraction allows easy swapping of
 * blockchain clients for different chains.
 * 
 * Requirements: 11.1, 11.2, 11.5 - Architecture for multi-blockchain support
 */

export type {
  BlockchainClient,
  Transaction,
  TransactionDetail,
  Amount,
  FetchOptions,
  TransactionType,
  TransactionStatus,
} from './types';

export { OsmosisClient } from './osmosis-client';
