/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Delete } from 'lucide-react';
import { formatDisplayExpression } from '../utils/calculator';

interface DisplayProps {
  expression: string;
  currentInput: string;
  livePreview: string | null;
  memoryValue: number;
  onClearMemory: () => void;
  onRecallMemory: () => void;
  onBackspace: () => void;
  isResultEvaluated: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  currentInput,
  livePreview,
  memoryValue,
  onClearMemory,
  onRecallMemory,
  onBackspace,
  isResultEvaluated,
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = currentInput || '0';

  // Dynamic text size scaling based on length
  const getTextSizeClass = (val: string) => {
    const len = val.length;
    if (len <= 8) return 'text-4xl sm:text-5xl';
    if (len <= 12) return 'text-3xl sm:text-4xl';
    if (len <= 16) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl';
  };

  const handleCopy = async () => {
    try {
      const textToCopy = isResultEvaluated ? currentInput : livePreview || currentInput;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
      {/* Top row: Memory badge & Active Expression breadcrumb */}
      <div className="flex items-center justify-between min-h-[24px] gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 shrink-0">
          {memoryValue !== 0 && (
            <button
              onClick={onRecallMemory}
              title="Click to recall memory value into calculator. Right click to clear."
              onContextMenu={(e) => {
                e.preventDefault();
                onClearMemory();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-semibold hover:bg-amber-500/25 transition-colors"
            >
              <span>M</span>
              <span className="opacity-70">= {memoryValue}</span>
            </button>
          )}
        </div>

        {/* Expression trace */}
        <div
          className="font-mono text-xs sm:text-sm tracking-tight text-right overflow-x-auto whitespace-nowrap text-slate-500 dark:text-slate-400 max-w-[280px] sm:max-w-[340px] scrollbar-none"
          title={expression}
        >
          {expression ? formatDisplayExpression(expression) : '\u00A0'}
        </div>
      </div>

      {/* Main Display: Current Input / Evaluated Result */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex-1 overflow-x-auto scrollbar-none text-right">
          <div
            className={`font-mono font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums select-all ${getTextSizeClass(
              displayValue
            )}`}
          >
            {displayValue}
          </div>
        </div>
      </div>

      {/* Bottom Sub-row: Live Preview & Quick Actions */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {/* Live subtotal calculation preview */}
        <div className="flex items-center gap-1.5 min-h-[20px]">
          {!isResultEvaluated && livePreview && livePreview !== displayValue && (
            <div className="flex items-center gap-1 font-mono text-xs text-amber-600 dark:text-amber-400/90 font-medium animate-fadeIn">
              <span className="opacity-60">=</span>
              <span>{livePreview}</span>
            </div>
          )}
        </div>

        {/* Quick Display Actions: Copy & Backspace */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBackspace}
            disabled={!currentInput || currentInput === '0'}
            aria-label="Delete last character"
            title="Backspace (Delete last character)"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            aria-label="Copy result"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
