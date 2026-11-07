/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MemoryBarProps {
  memoryValue: number;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryStore: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const MemoryBar: React.FC<MemoryBarProps> = ({
  memoryValue,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const hasMemory = memoryValue !== 0;

  return (
    <div className="flex items-center justify-between gap-1 w-full px-1 py-1">
      <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
        <button
          onClick={onMemoryClear}
          disabled={!hasMemory}
          className="flex-1 py-1 px-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Memory Clear (MC)"
        >
          MC
        </button>
        <button
          onClick={onMemoryRecall}
          disabled={!hasMemory}
          className="flex-1 py-1 px-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Memory Recall (MR)"
        >
          MR
        </button>
        <button
          onClick={onMemoryAdd}
          className="flex-1 py-1 px-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Memory Add (M+)"
        >
          M+
        </button>
        <button
          onClick={onMemorySubtract}
          className="flex-1 py-1 px-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Memory Subtract (M-)"
        >
          M−
        </button>
        <button
          onClick={onMemoryStore}
          className="flex-1 py-1 px-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Memory Store (MS)"
        >
          MS
        </button>
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

      {/* Advanced Math Functions Toggle (Roots, Powers) */}
      <button
        onClick={onToggleAdvanced}
        className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
          showAdvanced
            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Toggle powers & roots"
      >
        {showAdvanced ? '2nd: On' : 'fx'}
      </button>
    </div>
  );
};
