/**
 * Wallet Manager for local storage
 * 
 * Handles saving, loading, and managing wallet addresses in browser local storage.
 * 
 * Requirements: 5.2, 5.3, 5.5, 5.6 - Wallet storage management
 */

/**
 * Saved wallet interface
 */
export interface SavedWallet {
  address: string;
  label: string;
  addedAt: Date;
  lastViewed?: Date;
}

/**
 * WalletManager class
 * 
 * Manages wallet addresses in browser local storage, providing methods
 * to save, retrieve, update, and delete wallet addresses.
 */
export class WalletManager {
  private storageKey = 'osmosis-saved-wallets';

  /**
   * Save a wallet address to local storage
   * 
   * Requirements: 5.2 - Save wallet with label
   * 
   * @param address - Wallet address to save
   * @param label - User-provided label for the wallet
   */
  saveWallet(address: string, label: string): void {
    try {
      const wallets = this.getSavedWallets();
      
      // Check if wallet already exists
      const existingIndex = wallets.findIndex(w => w.address === address);
      
      if (existingIndex >= 0) {
        // Update existing wallet
        wallets[existingIndex].label = label;
        wallets[existingIndex].lastViewed = new Date();
      } else {
        // Add new wallet
        wallets.push({
          address,
          label,
          addedAt: new Date(),
          lastViewed: new Date(),
        });
      }

      this.saveToStorage(wallets);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new Error('Storage quota exceeded. Please remove some saved wallets.');
      }
      throw error;
    }
  }

  /**
   * Get all saved wallets from local storage
   * 
   * Requirements: 5.3 - Retrieve saved wallets
   * 
   * @returns Array of saved wallets
   */
  getSavedWallets(): SavedWallet[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      
      if (!data) {
        return [];
      }

      const wallets = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return wallets.map((w: any) => ({
        ...w,
        addedAt: new Date(w.addedAt),
        lastViewed: w.lastViewed ? new Date(w.lastViewed) : undefined,
      }));
    } catch (error) {
      console.error('Error loading saved wallets:', error);
      return [];
    }
  }

  /**
   * Remove a wallet from local storage
   * 
   * Requirements: 5.5 - Delete wallet
   * 
   * @param address - Wallet address to remove
   */
  removeWallet(address: string): void {
    const wallets = this.getSavedWallets();
    const filtered = wallets.filter(w => w.address !== address);
    this.saveToStorage(filtered);
  }

  /**
   * Update a wallet's label
   * 
   * Requirements: 5.6 - Edit wallet label
   * 
   * @param address - Wallet address
   * @param newLabel - New label for the wallet
   */
  updateLabel(address: string, newLabel: string): void {
    const wallets = this.getSavedWallets();
    const wallet = wallets.find(w => w.address === address);
    
    if (wallet) {
      wallet.label = newLabel;
      this.saveToStorage(wallets);
    }
  }

  /**
   * Update the last viewed timestamp for a wallet
   * 
   * @param address - Wallet address
   */
  updateLastViewed(address: string): void {
    const wallets = this.getSavedWallets();
    const wallet = wallets.find(w => w.address === address);
    
    if (wallet) {
      wallet.lastViewed = new Date();
      this.saveToStorage(wallets);
    }
  }

  /**
   * Check if a wallet is saved
   * 
   * @param address - Wallet address to check
   * @returns true if wallet is saved
   */
  isWalletSaved(address: string): boolean {
    const wallets = this.getSavedWallets();
    return wallets.some(w => w.address === address);
  }

  /**
   * Get a specific wallet by address
   * 
   * @param address - Wallet address
   * @returns Saved wallet or undefined
   */
  getWallet(address: string): SavedWallet | undefined {
    const wallets = this.getSavedWallets();
    return wallets.find(w => w.address === address);
  }

  /**
   * Clear all saved wallets
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Save wallets array to local storage
   * 
   * @param wallets - Array of wallets to save
   */
  private saveToStorage(wallets: SavedWallet[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(wallets));
  }

  /**
   * Check if error is a quota exceeded error
   * 
   * Requirements: 5.6 - Handle storage quota errors
   * 
   * @param error - Error to check
   * @returns true if quota exceeded
   */
  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }
}
