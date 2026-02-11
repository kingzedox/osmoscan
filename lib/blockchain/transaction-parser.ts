/**
 * Transaction parser for Osmosis blockchain transactions
 * 
 * This class handles parsing of different Osmosis message types and extracting
 * relevant transaction data including amounts, tokens, fees, and metadata.
 * 
 * Requirements: 2.6, 13.5 - Transaction parsing and type classification
 */

import type { Amount, TransactionType } from './types';

/**
 * Result of parsing transaction messages
 */
export interface ParsedTransaction {
  /** Transaction type */
  type: TransactionType;
  
  /** Array of amounts involved in the transaction */
  amounts: Amount[];
}

/**
 * TransactionParser class
 * 
 * Parses raw Osmosis transaction messages and extracts structured data.
 * Supports all major Osmosis transaction types including swaps, transfers,
 * staking, rewards, and liquidity operations.
 */
export class TransactionParser {
  /**
   * Parse transaction messages to determine type and amounts
   * 
   * Requirements: 2.6, 13.5 - Transaction details extraction and type classification
   * 
   * @param messages - Array of transaction messages from blockchain
   * @param address - The wallet address (used to determine transaction direction)
   * @returns Parsed transaction with type and amounts
   */
  parseMessages(messages: any[], address: string): ParsedTransaction {
    if (!messages || messages.length === 0) {
      return { type: 'unknown', amounts: [] };
    }

    // Get the first message to determine transaction type
    const firstMsg = messages[0];
    const msgType = firstMsg['@type'] || firstMsg.typeUrl || '';

    // Parse based on message type
    if (msgType.includes('MsgSwapExactAmountIn')) {
      return this.parseMsgSwapExactAmountIn(firstMsg);
    } else if (msgType.includes('MsgSwapExactAmountOut')) {
      return this.parseMsgSwapExactAmountOut(firstMsg);
    } else if (msgType.includes('MsgSend')) {
      return this.parseMsgSend(firstMsg, address);
    } else if (msgType.includes('MsgDelegate')) {
      return this.parseMsgDelegate(firstMsg);
    } else if (msgType.includes('MsgUndelegate')) {
      return this.parseMsgUndelegate(firstMsg);
    } else if (msgType.includes('MsgWithdrawDelegatorReward')) {
      return this.parseMsgWithdrawDelegatorReward(firstMsg);
    } else if (msgType.includes('MsgJoinPool') || msgType.includes('JoinPool')) {
      return this.parseMsgJoinPool(firstMsg);
    } else if (msgType.includes('MsgExitPool') || msgType.includes('ExitPool')) {
      return this.parseMsgExitPool(firstMsg);
    } else if (msgType.includes('MsgVote')) {
      return this.parseMsgVote(firstMsg);
    }

    return { type: 'unknown', amounts: [] };
  }

  /**
   * Parse MsgSwapExactAmountIn message
   * 
   * This message type specifies the exact input amount for a swap.
   * 
   * @param msg - The swap message
   * @returns Parsed transaction
   */
  private parseMsgSwapExactAmountIn(msg: any): ParsedTransaction {
    const amounts: Amount[] = [];

    // Parse input token
    if (msg.tokenIn) {
      amounts.push(this.parseAmount(msg.tokenIn));
    }

    // Parse output token (minimum expected)
    if (msg.tokenOutMinAmount && msg.routes && msg.routes.length > 0) {
      const lastRoute = msg.routes[msg.routes.length - 1];
      amounts.push({
        value: this.formatAmount(msg.tokenOutMinAmount, lastRoute.tokenOutDenom),
        denom: lastRoute.tokenOutDenom || 'unknown',
        symbol: this.denomToSymbol(lastRoute.tokenOutDenom || 'unknown'),
      });
    }

    return { type: 'swap', amounts };
  }

  /**
   * Parse MsgSwapExactAmountOut message
   * 
   * This message type specifies the exact output amount for a swap.
   * 
   * @param msg - The swap message
   * @returns Parsed transaction
   */
  private parseMsgSwapExactAmountOut(msg: any): ParsedTransaction {
    const amounts: Amount[] = [];

    // Parse input token (maximum willing to pay)
    if (msg.tokenInMaxAmount && msg.routes && msg.routes.length > 0) {
      const firstRoute = msg.routes[0];
      amounts.push({
        value: this.formatAmount(msg.tokenInMaxAmount, firstRoute.tokenInDenom),
        denom: firstRoute.tokenInDenom || 'unknown',
        symbol: this.denomToSymbol(firstRoute.tokenInDenom || 'unknown'),
      });
    }

    // Parse output token
    if (msg.tokenOut) {
      amounts.push(this.parseAmount(msg.tokenOut));
    }

    return { type: 'swap', amounts };
  }

  /**
   * Parse MsgSend message (transfer)
   * 
   * @param msg - The send message
   * @param address - The wallet address to determine direction
   * @returns Parsed transaction
   */
  private parseMsgSend(msg: any, address: string): ParsedTransaction {
    const amounts = this.parseAmounts(msg.amount || []);
    return { type: 'transfer', amounts };
  }

  /**
   * Parse MsgDelegate message (staking)
   * 
   * @param msg - The delegate message
   * @returns Parsed transaction
   */
  private parseMsgDelegate(msg: any): ParsedTransaction {
    const amounts = msg.amount ? [this.parseAmount(msg.amount)] : [];
    return { type: 'stake', amounts };
  }

  /**
   * Parse MsgUndelegate message (unstaking)
   * 
   * @param msg - The undelegate message
   * @returns Parsed transaction
   */
  private parseMsgUndelegate(msg: any): ParsedTransaction {
    const amounts = msg.amount ? [this.parseAmount(msg.amount)] : [];
    return { type: 'unstake', amounts };
  }

  /**
   * Parse MsgWithdrawDelegatorReward message (claim rewards)
   * 
   * Note: Reward amounts are typically found in transaction events,
   * not in the message itself.
   * 
   * @param msg - The withdraw reward message
   * @returns Parsed transaction
   */
  private parseMsgWithdrawDelegatorReward(msg: any): ParsedTransaction {
    // Rewards amounts are in the transaction events, not in the message
    // The actual reward amounts would need to be extracted from tx.events
    return { type: 'claim_rewards', amounts: [] };
  }

  /**
   * Parse MsgJoinPool message (provide liquidity)
   * 
   * @param msg - The join pool message
   * @returns Parsed transaction
   */
  private parseMsgJoinPool(msg: any): ParsedTransaction {
    const amounts = this.parseAmounts(msg.tokensIn || []);
    return { type: 'provide_liquidity', amounts };
  }

  /**
   * Parse MsgExitPool message (remove liquidity)
   * 
   * @param msg - The exit pool message
   * @returns Parsed transaction
   */
  private parseMsgExitPool(msg: any): ParsedTransaction {
    const amounts = this.parseAmounts(msg.tokensOut || []);
    return { type: 'remove_liquidity', amounts };
  }

  /**
   * Parse MsgVote message (governance vote)
   * 
   * @param msg - The vote message
   * @returns Parsed transaction
   */
  private parseMsgVote(msg: any): ParsedTransaction {
    // Vote transactions don't involve token amounts
    return { type: 'vote', amounts: [] };
  }

  /**
   * Parse an array of amounts
   * 
   * @param amounts - Array of amount objects from blockchain
   * @returns Array of normalized Amount objects
   */
  private parseAmounts(amounts: any[]): Amount[] {
    if (!Array.isArray(amounts)) {
      return [];
    }
    return amounts.map(amt => this.parseAmount(amt));
  }

  /**
   * Parse a single amount
   * 
   * @param amount - Amount object with denom and amount
   * @returns Normalized Amount object
   */
  parseAmount(amount: any): Amount {
    if (!amount) {
      return { value: '0', denom: 'unknown', symbol: 'UNKNOWN' };
    }

    const denom = amount.denom || 'unknown';
    const value = amount.amount || '0';

    return {
      value: this.formatAmount(value, denom),
      denom,
      symbol: this.denomToSymbol(denom),
    };
  }

  /**
   * Parse transaction fee
   * 
   * @param fee - Fee object from transaction
   * @returns Normalized Amount object for fee
   */
  parseFee(fee: any): Amount {
    if (!fee || !fee.amount || fee.amount.length === 0) {
      return { value: '0', denom: 'uosmo', symbol: 'OSMO' };
    }

    return this.parseAmount(fee.amount[0]);
  }

  /**
   * Format an amount value with proper decimal precision
   * 
   * Requirements: 13.3 - Decimal precision preservation
   * 
   * Converts base units (e.g., uosmo) to decimal representation (e.g., OSMO)
   * while preserving full precision.
   * 
   * @param value - Raw amount value (in base units)
   * @param denom - Token denomination
   * @returns Formatted amount as decimal string
   */
  formatAmount(value: string, denom: string): string {
    // Most Cosmos tokens use 6 decimal places (micro units)
    const decimals = this.getDecimals(denom);
    const numValue = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    
    const integerPart = numValue / divisor;
    const fractionalPart = numValue % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return integerPart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    // Remove trailing zeros
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    return `${integerPart}.${trimmedFractional}`;
  }

  /**
   * Get the number of decimal places for a token denomination
   * 
   * @param denom - Token denomination
   * @returns Number of decimal places
   */
  private getDecimals(denom: string): number {
    // Most Cosmos SDK tokens use 6 decimals (micro units)
    // IBC tokens also typically use 6 decimals
    if (denom.startsWith('ibc/')) {
      return 6;
    }
    
    // Known denominations
    const knownDecimals: Record<string, number> = {
      'uosmo': 6,
      'uion': 6,
      'uatom': 6,
    };
    
    return knownDecimals[denom] || 6;
  }

  /**
   * Convert a denomination to a human-readable symbol
   * 
   * @param denom - Token denomination
   * @returns Human-readable symbol
   */
  denomToSymbol(denom: string): string {
    // Known denominations
    const knownSymbols: Record<string, string> = {
      'uosmo': 'OSMO',
      'uion': 'ION',
      'uatom': 'ATOM',
    };

    if (knownSymbols[denom]) {
      return knownSymbols[denom];
    }

    // For IBC tokens, use a shortened version of the hash
    if (denom.startsWith('ibc/')) {
      return `IBC/${denom.slice(4, 10).toUpperCase()}`;
    }

    // For unknown tokens, try to extract a symbol from the denom
    // Remove 'u' prefix if present (micro units)
    if (denom.startsWith('u')) {
      return denom.slice(1).toUpperCase();
    }

    return denom.toUpperCase();
  }
}
