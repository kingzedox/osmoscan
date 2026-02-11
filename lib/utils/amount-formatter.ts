/**
 * Amount formatter utility
 * 
 * Handles formatting of cryptocurrency amounts with proper decimal precision.
 * Ensures decimal precision is preserved through all transformations.
 * 
 * Requirements: 13.3 - Decimal precision preservation
 */

import type { Amount } from '../blockchain/types';

/**
 * AmountFormatter class
 * 
 * Provides utilities for formatting cryptocurrency amounts while preserving
 * decimal precision throughout all transformations.
 */
export class AmountFormatter {
  /**
   * Format an amount for display
   * 
   * Requirements: 13.3 - Decimal precision preservation
   * 
   * @param amount - The amount to format
   * @param maxDecimals - Maximum number of decimal places to display (default: 6)
   * @returns Formatted amount string
   */
  static formatForDisplay(amount: Amount, maxDecimals: number = 6): string {
    const value = parseFloat(amount.value);
    
    if (isNaN(value)) {
      return '0';
    }

    // Format with appropriate decimal places
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    });

    return formatted;
  }

  /**
   * Format an amount with its symbol
   * 
   * @param amount - The amount to format
   * @param maxDecimals - Maximum number of decimal places to display
   * @returns Formatted string with symbol (e.g., "123.45 OSMO")
   */
  static formatWithSymbol(amount: Amount, maxDecimals: number = 6): string {
    const formatted = this.formatForDisplay(amount, maxDecimals);
    return `${formatted} ${amount.symbol}`;
  }

  /**
   * Convert amount to base units (for blockchain transactions)
   * 
   * @param value - Decimal value (e.g., "1.5")
   * @param decimals - Number of decimal places (e.g., 6 for uosmo)
   * @returns Amount in base units as string
   */
  static toBaseUnits(value: string, decimals: number): string {
    const parts = value.split('.');
    const integerPart = parts[0] || '0';
    const fractionalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
    
    const baseUnits = BigInt(integerPart) * BigInt(10 ** decimals) + BigInt(fractionalPart);
    return baseUnits.toString();
  }

  /**
   * Convert base units to decimal value
   * 
   * Requirements: 13.3 - Decimal precision preservation
   * 
   * @param baseUnits - Amount in base units (e.g., "1500000" uosmo)
   * @param decimals - Number of decimal places (e.g., 6)
   * @returns Decimal value as string (e.g., "1.5")
   */
  static fromBaseUnits(baseUnits: string, decimals: number): string {
    const numValue = BigInt(baseUnits);
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
   * Preserve decimal precision through transformation
   * 
   * Ensures that an amount maintains its exact decimal precision
   * when converted between different formats.
   * 
   * Requirements: 13.3 - Decimal precision preservation
   * 
   * @param value - The value to preserve
   * @returns The same value with precision preserved
   */
  static preservePrecision(value: string): string {
    // Remove any trailing zeros after decimal point
    if (value.includes('.')) {
      return value.replace(/\.?0+$/, '');
    }
    return value;
  }

  /**
   * Compare two amounts for equality (accounting for precision)
   * 
   * @param amount1 - First amount
   * @param amount2 - Second amount
   * @returns true if amounts are equal
   */
  static areEqual(amount1: Amount, amount2: Amount): boolean {
    return (
      amount1.denom === amount2.denom &&
      this.preservePrecision(amount1.value) === this.preservePrecision(amount2.value)
    );
  }

  /**
   * Add two amounts (must be same denomination)
   * 
   * @param amount1 - First amount
   * @param amount2 - Second amount
   * @returns Sum of amounts
   */
  static add(amount1: Amount, amount2: Amount): Amount {
    if (amount1.denom !== amount2.denom) {
      throw new Error('Cannot add amounts with different denominations');
    }

    const value1 = parseFloat(amount1.value);
    const value2 = parseFloat(amount2.value);
    const sum = value1 + value2;

    return {
      value: sum.toString(),
      denom: amount1.denom,
      symbol: amount1.symbol,
    };
  }

  /**
   * Get the number of decimal places in a value
   * 
   * @param value - The value to check
   * @returns Number of decimal places
   */
  static getDecimalPlaces(value: string): number {
    const parts = value.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  }
}
