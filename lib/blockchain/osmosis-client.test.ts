/**
 * Unit tests for OsmosisClient
 * 
 * Tests cover:
 * - Address validation (Requirement 1.1)
 * - Block explorer URL generation (Requirement 3.4)
 * - Transaction fetching with mocked CosmJS client (Requirement 2.1, 2.2)
 */

import { OsmosisClient } from './osmosis-client';
import { StargateClient } from '@cosmjs/stargate';

// Mock CosmJS StargateClient
jest.mock('@cosmjs/stargate', () => ({
  StargateClient: {
    connect: jest.fn(),
  },
}));

describe('OsmosisClient', () => {
  let client: OsmosisClient;

  beforeEach(() => {
    client = new OsmosisClient('https://rpc.osmosis.zone');
    jest.clearAllMocks();
  });

  describe('validateAddress', () => {
    it('should validate correct Osmosis addresses', () => {
      // Valid Osmosis addresses (43 characters: osmo + 39 alphanumeric)
      const validAddresses = [
        'osmo1abcdefghijklmnopqrstuvwxyz0123456789',
        'osmo1234567890abcdefghijklmnopqrstuvwxyz',
        'osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0000',
      ];

      validAddresses.forEach(address => {
        expect(client.validateAddress(address)).toBe(true);
      });
    });

    it('should reject addresses with incorrect prefix', () => {
      const invalidAddresses = [
        'cosmos1abcdefghijklmnopqrstuvwxyz0123456789', // Wrong prefix
        'atom1abcdefghijklmnopqrstuvwxyz0123456789',   // Wrong prefix
        'juno1abcdefghijklmnopqrstuvwxyz0123456789',   // Wrong prefix
      ];

      invalidAddresses.forEach(address => {
        expect(client.validateAddress(address)).toBe(false);
      });
    });

    it('should reject addresses with incorrect length', () => {
      const invalidAddresses = [
        'osmo1abc',                                      // Too short
        'osmo1abcdefghijklmnopqrstuvwxyz01234567890',  // Too long (44 chars)
        'osmo1abcdefghijklmnopqrstuvwxyz012345678',    // Too short (42 chars)
      ];

      invalidAddresses.forEach(address => {
        expect(client.validateAddress(address)).toBe(false);
      });
    });

    it('should reject addresses with uppercase characters', () => {
      const invalidAddresses = [
        'OSMO1abcdefghijklmnopqrstuvwxyz0123456789',   // Uppercase prefix
        'osmo1ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',   // Uppercase body
        'Osmo1abcdefghijklmnopqrstuvwxyz0123456789',   // Mixed case
      ];

      invalidAddresses.forEach(address => {
        expect(client.validateAddress(address)).toBe(false);
      });
    });

    it('should reject addresses with special characters', () => {
      const invalidAddresses = [
        'osmo1abcdefghijklmnopqrstuvwxyz012345678!',   // Special char
        'osmo1abcdefghijklmnopqrstuvwxyz012345678@',   // Special char
        'osmo1abcdefghijklmnopqrstuvwxyz012345678-',   // Hyphen
        'osmo1abcdefghijklmnopqrstuvwxyz012345678_',   // Underscore
      ];

      invalidAddresses.forEach(address => {
        expect(client.validateAddress(address)).toBe(false);
      });
    });

    it('should reject empty or null addresses', () => {
      expect(client.validateAddress('')).toBe(false);
      expect(client.validateAddress(' ')).toBe(false);
    });
  });

  describe('getBlockExplorerUrl', () => {
    it('should generate correct Mintscan URL for transaction hash', () => {
      const txHash = 'ABC123DEF456';
      const expectedUrl = `https://www.mintscan.io/osmosis/txs/${txHash}`;
      
      expect(client.getBlockExplorerUrl(txHash)).toBe(expectedUrl);
    });

    it('should handle different transaction hash formats', () => {
      const testCases = [
        {
          hash: '1234567890ABCDEF',
          expected: 'https://www.mintscan.io/osmosis/txs/1234567890ABCDEF',
        },
        {
          hash: 'abcdef1234567890',
          expected: 'https://www.mintscan.io/osmosis/txs/abcdef1234567890',
        },
        {
          hash: 'FEDCBA0987654321',
          expected: 'https://www.mintscan.io/osmosis/txs/FEDCBA0987654321',
        },
      ];

      testCases.forEach(({ hash, expected }) => {
        expect(client.getBlockExplorerUrl(hash)).toBe(expected);
      });
    });
  });

  describe('initialize', () => {
    it('should connect to RPC endpoint', async () => {
      const mockClient = {
        disconnect: jest.fn(),
        getTx: jest.fn(),
        searchTx: jest.fn(),
      };

      (StargateClient.connect as jest.Mock).mockResolvedValue(mockClient);

      await client.initialize();

      expect(StargateClient.connect).toHaveBeenCalledWith('https://rpc.osmosis.zone');
    });

    it('should not reconnect if already initialized', async () => {
      const mockClient = {
        disconnect: jest.fn(),
        getTx: jest.fn(),
        searchTx: jest.fn(),
      };

      (StargateClient.connect as jest.Mock).mockResolvedValue(mockClient);

      await client.initialize();
      await client.initialize();

      // Should only connect once
      expect(StargateClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchTransactions', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        disconnect: jest.fn(),
        getTx: jest.fn(),
        searchTx: jest.fn(),
      };

      (StargateClient.connect as jest.Mock).mockResolvedValue(mockClient);
    });

    it('should throw error if client not initialized', async () => {
      await expect(
        client.fetchTransactions('osmo1abcdefghijklmnopqrstuvwxyz0123456789')
      ).rejects.toThrow('Client not initialized');
    });

    it('should throw error for invalid address', async () => {
      await client.initialize();

      await expect(
        client.fetchTransactions('invalid-address')
      ).rejects.toThrow('Invalid Osmosis address format');
    });

    it('should fetch transactions successfully', async () => {
      await client.initialize();

      const mockTx = {
        hash: 'ABC123',
        height: 1000,
        code: 0,
        tx: {
          body: {
            messages: [{
              '@type': '/cosmos.bank.v1beta1.MsgSend',
              amount: [{ denom: 'uosmo', amount: '1000000' }],
            }],
            memo: 'Test transaction',
          },
          authInfo: {
            fee: {
              amount: [{ denom: 'uosmo', amount: '5000' }],
            },
          },
        },
      };

      mockClient.searchTx.mockResolvedValue([mockTx]);

      const transactions = await client.fetchTransactions(
        'osmo1abcdefghijklmnopqrstuvwxyz0123456789'
      );

      expect(transactions).toHaveLength(1);
      expect(transactions[0].hash).toBe('ABC123');
      expect(transactions[0].type).toBe('transfer');
      expect(transactions[0].status).toBe('success');
    });

    it('should handle pagination correctly', async () => {
      await client.initialize();

      const mockTx1 = {
        hash: 'TX1',
        height: 1000,
        code: 0,
        tx: {
          body: {
            messages: [{
              '@type': '/cosmos.bank.v1beta1.MsgSend',
              amount: [{ denom: 'uosmo', amount: '1000000' }],
            }],
            memo: '',
          },
          authInfo: {
            fee: {
              amount: [{ denom: 'uosmo', amount: '5000' }],
            },
          },
        },
      };

      const mockTx2 = {
        ...mockTx1,
        hash: 'TX2',
        height: 1001,
      };

      // First call returns full page, second call returns empty (no more pages)
      mockClient.searchTx
        .mockResolvedValueOnce([mockTx1, mockTx2])
        .mockResolvedValueOnce([]);

      const transactions = await client.fetchTransactions(
        'osmo1abcdefghijklmnopqrstuvwxyz0123456789',
        { limit: 100 }
      );

      expect(transactions.length).toBeGreaterThanOrEqual(2);
      expect(mockClient.searchTx).toHaveBeenCalledTimes(2);
    });

    it('should handle failed transactions', async () => {
      await client.initialize();

      const mockTx = {
        hash: 'FAILED_TX',
        height: 1000,
        code: 5, // Non-zero code indicates failure
        tx: {
          body: {
            messages: [{
              '@type': '/cosmos.bank.v1beta1.MsgSend',
              amount: [{ denom: 'uosmo', amount: '1000000' }],
            }],
            memo: '',
          },
          authInfo: {
            fee: {
              amount: [{ denom: 'uosmo', amount: '5000' }],
            },
          },
        },
      };

      mockClient.searchTx.mockResolvedValue([mockTx]);

      const transactions = await client.fetchTransactions(
        'osmo1abcdefghijklmnopqrstuvwxyz0123456789'
      );

      expect(transactions[0].status).toBe('failed');
    });

    it('should parse different transaction types correctly', async () => {
      await client.initialize();

      const testCases = [
        {
          msgType: '/cosmos.bank.v1beta1.MsgSend',
          expectedType: 'transfer',
        },
        {
          msgType: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
          expectedType: 'swap',
        },
        {
          msgType: '/cosmos.staking.v1beta1.MsgDelegate',
          expectedType: 'stake',
        },
        {
          msgType: '/cosmos.staking.v1beta1.MsgUndelegate',
          expectedType: 'unstake',
        },
        {
          msgType: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          expectedType: 'claim_rewards',
        },
        {
          msgType: '/cosmos.gov.v1beta1.MsgVote',
          expectedType: 'vote',
        },
      ];

      for (const { msgType, expectedType } of testCases) {
        const mockTx = {
          hash: `TX_${expectedType}`,
          height: 1000,
          code: 0,
          tx: {
            body: {
              messages: [{
                '@type': msgType,
                amount: msgType.includes('Vote') ? undefined : [{ denom: 'uosmo', amount: '1000000' }],
              }],
              memo: '',
            },
            authInfo: {
              fee: {
                amount: [{ denom: 'uosmo', amount: '5000' }],
              },
            },
          },
        };

        mockClient.searchTx.mockResolvedValue([mockTx]);

        const transactions = await client.fetchTransactions(
          'osmo1abcdefghijklmnopqrstuvwxyz0123456789'
        );

        expect(transactions[0].type).toBe(expectedType);
      }
    });
  });

  describe('getTransactionDetails', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        disconnect: jest.fn(),
        getTx: jest.fn(),
        searchTx: jest.fn(),
      };

      (StargateClient.connect as jest.Mock).mockResolvedValue(mockClient);
    });

    it('should throw error if client not initialized', async () => {
      await expect(
        client.getTransactionDetails('ABC123')
      ).rejects.toThrow('Client not initialized');
    });

    it('should fetch transaction details successfully', async () => {
      await client.initialize();

      const mockTx = {
        hash: 'ABC123',
        height: 1000,
        code: 0,
        gasUsed: 100000,
        gasWanted: 150000,
        rawLog: 'Transaction successful',
        tx: {
          body: {
            messages: [{
              '@type': '/cosmos.bank.v1beta1.MsgSend',
              amount: [{ denom: 'uosmo', amount: '1000000' }],
            }],
            memo: 'Test transaction',
          },
          authInfo: {
            fee: {
              amount: [{ denom: 'uosmo', amount: '5000' }],
            },
          },
        },
      };

      mockClient.getTx.mockResolvedValue(mockTx);

      const details = await client.getTransactionDetails('ABC123');

      expect(details.hash).toBe('ABC123');
      expect(details.blockHeight).toBe(1000);
      expect(details.gasUsed).toBe(100000);
      expect(details.gasWanted).toBe(150000);
      expect(details.rawLog).toBe('Transaction successful');
      expect(details.messages).toHaveLength(1);
    });

    it('should throw error if transaction not found', async () => {
      await client.initialize();

      mockClient.getTx.mockResolvedValue(null);

      await expect(
        client.getTransactionDetails('NONEXISTENT')
      ).rejects.toThrow('Transaction not found: NONEXISTENT');
    });
  });

  describe('disconnect', () => {
    it('should disconnect the client', async () => {
      const mockClient = {
        disconnect: jest.fn(),
        getTx: jest.fn(),
        searchTx: jest.fn(),
      };

      (StargateClient.connect as jest.Mock).mockResolvedValue(mockClient);

      await client.initialize();
      await client.disconnect();

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect when not initialized', async () => {
      // Should not throw error
      await expect(client.disconnect()).resolves.not.toThrow();
    });
  });
});
