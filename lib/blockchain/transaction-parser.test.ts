/**
 * Unit tests for TransactionParser
 * 
 * Tests parsing of different Osmosis message types and amount formatting.
 */

import { TransactionParser } from './transaction-parser';

describe('TransactionParser', () => {
  let parser: TransactionParser;

  beforeEach(() => {
    parser = new TransactionParser();
  });

  describe('parseMessages', () => {
    it('should return unknown type for empty messages', () => {
      const result = parser.parseMessages([], 'osmo1test');
      expect(result.type).toBe('unknown');
      expect(result.amounts).toEqual([]);
    });

    it('should return unknown type for null messages', () => {
      const result = parser.parseMessages(null as any, 'osmo1test');
      expect(result.type).toBe('unknown');
      expect(result.amounts).toEqual([]);
    });

    it('should parse MsgSwapExactAmountIn', () => {
      const messages = [
        {
          '@type': '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
          tokenIn: {
            denom: 'uosmo',
            amount: '1000000',
          },
          tokenOutMinAmount: '500000',
          routes: [
            {
              tokenOutDenom: 'uatom',
            },
          ],
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('swap');
      expect(result.amounts).toHaveLength(2);
      expect(result.amounts[0].denom).toBe('uosmo');
      expect(result.amounts[0].symbol).toBe('OSMO');
      expect(result.amounts[1].denom).toBe('uatom');
      expect(result.amounts[1].symbol).toBe('ATOM');
    });

    it('should parse MsgSwapExactAmountOut', () => {
      const messages = [
        {
          '@type': '/osmosis.gamm.v1beta1.MsgSwapExactAmountOut',
          tokenInMaxAmount: '2000000',
          tokenOut: {
            denom: 'uion',
            amount: '1000000',
          },
          routes: [
            {
              tokenInDenom: 'uosmo',
            },
          ],
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('swap');
      expect(result.amounts).toHaveLength(2);
    });

    it('should parse MsgSend', () => {
      const messages = [
        {
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          amount: [
            {
              denom: 'uosmo',
              amount: '5000000',
            },
          ],
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('transfer');
      expect(result.amounts).toHaveLength(1);
      expect(result.amounts[0].value).toBe('5');
    });

    it('should parse MsgDelegate', () => {
      const messages = [
        {
          '@type': '/cosmos.staking.v1beta1.MsgDelegate',
          amount: {
            denom: 'uosmo',
            amount: '10000000',
          },
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('stake');
      expect(result.amounts).toHaveLength(1);
      expect(result.amounts[0].value).toBe('10');
    });

    it('should parse MsgUndelegate', () => {
      const messages = [
        {
          '@type': '/cosmos.staking.v1beta1.MsgUndelegate',
          amount: {
            denom: 'uosmo',
            amount: '7500000',
          },
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('unstake');
      expect(result.amounts).toHaveLength(1);
      expect(result.amounts[0].value).toBe('7.5');
    });

    it('should parse MsgWithdrawDelegatorReward', () => {
      const messages = [
        {
          '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          delegatorAddress: 'osmo1test',
          validatorAddress: 'osmovaloper1test',
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('claim_rewards');
      expect(result.amounts).toEqual([]);
    });

    it('should parse MsgJoinPool', () => {
      const messages = [
        {
          '@type': '/osmosis.gamm.v1beta1.MsgJoinPool',
          tokensIn: [
            {
              denom: 'uosmo',
              amount: '1000000',
            },
            {
              denom: 'uatom',
              amount: '500000',
            },
          ],
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('provide_liquidity');
      expect(result.amounts).toHaveLength(2);
    });

    it('should parse MsgExitPool', () => {
      const messages = [
        {
          '@type': '/osmosis.gamm.v1beta1.MsgExitPool',
          tokensOut: [
            {
              denom: 'uosmo',
              amount: '800000',
            },
          ],
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('remove_liquidity');
      expect(result.amounts).toHaveLength(1);
    });

    it('should parse MsgVote', () => {
      const messages = [
        {
          '@type': '/cosmos.gov.v1beta1.MsgVote',
          proposalId: '1',
          voter: 'osmo1test',
          option: 'VOTE_OPTION_YES',
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('vote');
      expect(result.amounts).toEqual([]);
    });

    it('should handle unknown message types', () => {
      const messages = [
        {
          '@type': '/unknown.module.MsgUnknown',
        },
      ];

      const result = parser.parseMessages(messages, 'osmo1test');
      expect(result.type).toBe('unknown');
      expect(result.amounts).toEqual([]);
    });
  });

  describe('parseAmount', () => {
    it('should parse valid amount', () => {
      const amount = {
        denom: 'uosmo',
        amount: '1000000',
      };

      const result = parser.parseAmount(amount);
      expect(result.value).toBe('1');
      expect(result.denom).toBe('uosmo');
      expect(result.symbol).toBe('OSMO');
    });

    it('should handle null amount', () => {
      const result = parser.parseAmount(null);
      expect(result.value).toBe('0');
      expect(result.denom).toBe('unknown');
      expect(result.symbol).toBe('UNKNOWN');
    });

    it('should handle amount with missing fields', () => {
      const result = parser.parseAmount({});
      expect(result.value).toBe('0');
      expect(result.denom).toBe('unknown');
      expect(result.symbol).toBe('UNKNOWN');
    });
  });

  describe('parseFee', () => {
    it('should parse valid fee', () => {
      const fee = {
        amount: [
          {
            denom: 'uosmo',
            amount: '5000',
          },
        ],
      };

      const result = parser.parseFee(fee);
      expect(result.value).toBe('0.005');
      expect(result.denom).toBe('uosmo');
      expect(result.symbol).toBe('OSMO');
    });

    it('should handle empty fee', () => {
      const result = parser.parseFee({});
      expect(result.value).toBe('0');
      expect(result.denom).toBe('uosmo');
      expect(result.symbol).toBe('OSMO');
    });

    it('should handle null fee', () => {
      const result = parser.parseFee(null);
      expect(result.value).toBe('0');
      expect(result.denom).toBe('uosmo');
      expect(result.symbol).toBe('OSMO');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with 6 decimals', () => {
      const result = parser.formatAmount('1000000', 'uosmo');
      expect(result).toBe('1');
    });

    it('should format amount with fractional part', () => {
      const result = parser.formatAmount('1234567', 'uosmo');
      expect(result).toBe('1.234567');
    });

    it('should remove trailing zeros', () => {
      const result = parser.formatAmount('1500000', 'uosmo');
      expect(result).toBe('1.5');
    });

    it('should handle zero amount', () => {
      const result = parser.formatAmount('0', 'uosmo');
      expect(result).toBe('0');
    });

    it('should handle very small amounts', () => {
      const result = parser.formatAmount('1', 'uosmo');
      expect(result).toBe('0.000001');
    });

    it('should handle large amounts', () => {
      const result = parser.formatAmount('1000000000000', 'uosmo');
      expect(result).toBe('1000000');
    });

    it('should preserve full precision', () => {
      const result = parser.formatAmount('123456789', 'uosmo');
      expect(result).toBe('123.456789');
    });
  });

  describe('denomToSymbol', () => {
    it('should convert known denominations', () => {
      expect(parser.denomToSymbol('uosmo')).toBe('OSMO');
      expect(parser.denomToSymbol('uion')).toBe('ION');
      expect(parser.denomToSymbol('uatom')).toBe('ATOM');
    });

    it('should handle IBC tokens', () => {
      const result = parser.denomToSymbol('ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2');
      expect(result).toMatch(/^IBC\//);
    });

    it('should remove u prefix for unknown tokens', () => {
      const result = parser.denomToSymbol('utest');
      expect(result).toBe('TEST');
    });

    it('should uppercase unknown tokens', () => {
      const result = parser.denomToSymbol('test');
      expect(result).toBe('TEST');
    });
  });
});
