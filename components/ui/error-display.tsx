'use client';

/**
 * ErrorDisplay component
 * 
 * Displays error messages with retry functionality for retryable errors.
 * 
 * Requirements: 9.1, 9.2, 9.3 - Error handling and user feedback
 */

import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorDisplayProps {
  /** Error message to display */
  message: string;
  
  /** Whether the error is retryable */
  retryable?: boolean;
  
  /** Callback for retry action */
  onRetry?: () => void;
  
  /** Callback for dismiss action */
  onDismiss?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * ErrorDisplay component
 * 
 * Shows error messages with appropriate styling and actions.
 */
export function ErrorDisplay({
  message,
  retryable = false,
  onRetry,
  onDismiss,
  className = '',
}: ErrorDisplayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`glass rounded-lg border border-red-500/20 bg-red-500/10 p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>

          {/* Error Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-500">Error</p>
            <p className="mt-1 text-sm text-red-400">{message}</p>

            {/* Actions */}
            {(retryable || onDismiss) && (
              <div className="mt-3 flex gap-2">
                {retryable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/20"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
