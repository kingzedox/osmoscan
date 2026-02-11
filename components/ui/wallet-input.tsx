'use client';

/**
 * WalletInput Component
 * 
 * A validated input field for Osmosis wallet addresses with visual feedback states.
 * Features glassmorphism effects, paste button, and whitespace trimming.
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5 - Wallet address input and validation
 */

import { useState, useEffect } from 'react';
import { Check, X, Loader2, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

interface WalletInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (address: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function WalletInput({
  value,
  onChange,
  onSubmit,
  className,
  placeholder = 'Enter Osmosis wallet address (osmo...)',
  autoFocus = false,
}: WalletInputProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Validate address format
  const validateAddress = (address: string): boolean => {
    const trimmed = address.trim();
    if (!trimmed) {
      setValidationState('idle');
      setErrorMessage('');
      return false;
    }

    // Osmosis address validation: osmo + 39 alphanumeric characters
    const osmosisAddressRegex = /^osmo[a-z0-9]{39}$/;
    const isValid = osmosisAddressRegex.test(trimmed);

    if (isValid) {
      setValidationState('valid');
      setErrorMessage('');
    } else {
      setValidationState('invalid');
      setErrorMessage("Please enter a valid Osmosis wallet address (starting with 'osmo')");
    }

    return isValid;
  };

  // Handle input change with whitespace trimming
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Debounce validation
    setValidationState('validating');
    setTimeout(() => {
      validateAddress(newValue);
    }, 300);
  };

  // Handle paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      onChange(trimmed);
      validateAddress(trimmed);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (validateAddress(trimmed) && onSubmit) {
      onSubmit(trimmed);
    }
  };

  // Get icon based on validation state
  const getIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case 'valid':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative">
        {/* Input field with glassmorphism */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full px-6 py-4 pr-24 rounded-2xl font-mono text-sm',
            'bg-background/50 backdrop-blur-xl',
            'border-2 transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'placeholder:text-muted-foreground/50',
            validationState === 'valid' && 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20',
            validationState === 'invalid' && 'border-destructive/50 focus:border-destructive focus:ring-destructive/20',
            (validationState === 'idle' || validationState === 'validating') && 'border-border focus:border-primary focus:ring-primary/20'
          )}
        />

        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Validation icon */}
          {getIcon()}

          {/* Paste button */}
          <button
            type="button"
            onClick={handlePaste}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {validationState === 'invalid' && errorMessage && (
        <p className="mt-2 text-sm text-destructive animate-fade-in">
          {errorMessage}
        </p>
      )}

      {/* Hidden submit button for Enter key */}
      <button type="submit" className="hidden" />
    </form>
  );
}
