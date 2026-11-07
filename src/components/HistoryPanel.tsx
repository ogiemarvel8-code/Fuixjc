/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Tag,
  CornerDownLeft,
  ArrowUpRight,
  X,
  FileText,
} from 'lucide-react';
import { HistoryItem } from '../types/calculator';
import { formatDisplayExpression } from '../utils/calculator';
import { exportHistoryAsCSV } from '../utils/storage';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectExpression: (expression: string) => void;
  onSelectResult: (result: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onUpdateLabel: (id: string, label: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectExpression,
  onSelectResult,
  onDeleteItem,
  onClearHistory,
  onUpdateLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Format relative timestamp
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter history based on search query
  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchExpr = item.expression.toLowerCase().includes(query);
    const matchRes = item.result.toLowerCase().includes(query);
    const matchLabel = item.label ? item.label.toLowerCase().includes(query) : false;
    return matchExpr || matchRes || matchLabel;
  });

  const handleCopyItem = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback
    }
  };

  const handleCopyAll = async () => {
    if (history.length === 0) return;
    try {
      const summary = history
        .map(
          (h) =>
            `${new Date(h.timestamp).toLocaleTimeString()} - ${h.label ? `[${h.label}] ` : ''}${h.expression} = ${h.result}`
        )
        .join('\n');
      await navigator.clipboard.writeText(summary);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback
    }
  };

  const startEditLabel = (item: HistoryItem) => {
    setEditingLabelId(item.id);
    setEditingLabelText(item.label || '');
  };

  const saveLabel = (id: string) => {
    onUpdateLabel(id, editingLabelText.trim());
    setEditingLabelId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Calculation History
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {history.length}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <>
                <button
                  onClick={() => exportHistoryAsCSV(history)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Export History to CSV file"
                  aria-label="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyAll}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={copiedAll ? 'All copied!' : 'Copy all history as text'}
                  aria-label="Copy all calculations"
                >
                  {copiedAll ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Clear all calculations"
                  aria-label="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clear Confirmation Prompt */}
        {confirmClearOpen && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between gap-2 text-xs">
            <span className="text-rose-800 dark:text-rose-300 font-medium">
              Clear all {history.length} items?
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onClearHistory();
                  setConfirmClearOpen(false);
                }}
                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search input if 2 or more history items */}
        {history.length >= 2 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search numbers or notes..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* History Items Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
              <History className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No calculations found' : 'No calculations yet'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
              {searchQuery
                ? 'Try searching with a different number or label.'
                : 'Perform any arithmetic in the calculator to record it here.'}
            </p>

            {!searchQuery && (
              <div className="mt-4 flex flex-col gap-1.5 w-full max-w-[240px]">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Examples
                </span>
                <button
                  onClick={() => onSelectExpression('1200 * 0.15')}
                  className="text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-left text-slate-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 border border-slate-200/60 dark:border-slate-700/50 transition-colors"
                >
                  1,200 × 15% (Tip)
                </button>
                <button
                  onClick={() => onSelectExpression('(450 + 85) / 2')}
                  className="text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-left text-slate-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 border border-slate-200/60 dark:border-slate-700/50 transition-colors"
                >
                  (450 + 85) ÷ 2 (Split)
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 transition-all shadow-2xs"
            >
              {/* Top metadata line: Label & Timestamp */}
              <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                {editingLabelId === item.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingLabelText}
                      onChange={(e) => setEditingLabelText(e.target.value)}
                      placeholder="Add note (e.g. groceries)..."
                      className="flex-1 px-2 py-0.5 text-xs rounded bg-white dark:bg-slate-900 border border-amber-500 text-slate-900 dark:text-white focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveLabel(item.id);
                        if (e.key === 'Escape') setEditingLabelId(null);
                      }}
                    />
                    <button
                      onClick={() => saveLabel(item.id)}
                      className="px-2 py-0.5 text-[11px] bg-amber-500 text-slate-950 font-bold rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLabelId(null)}
                      className="px-1 py-0.5 text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {item.label ? (
                      <button
                        onClick={() => startEditLabel(item)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium truncate max-w-[160px] hover:bg-amber-500/20 transition-colors"
                        title="Click to edit label"
                      >
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditLabel(item)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-opacity"
                        title="Add note/label"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>Note</span>
                      </button>
                    )}
                  </div>
                )}

                <span className="shrink-0 font-medium">{formatTime(item.timestamp)}</span>
              </div>

              {/* Expression */}
              <div
                onClick={() => onSelectExpression(item.expression)}
                className="font-mono text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate"
                title="Click to load this expression back into calculator"
              >
                {formatDisplayExpression(item.expression)}
              </div>

              {/* Result */}
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-slate-400 text-xs font-mono font-medium">=</span>
                <div
                  onClick={() => onSelectResult(item.result)}
                  className="font-mono text-lg sm:text-xl font-bold tabular-nums text-slate-900 dark:text-white cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-all"
                  title="Click to insert this result into calculator"
                >
                  {item.result}
                </div>
              </div>

              {/* Action buttons on hover/touch */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectExpression(item.expression)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="Load expression"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Reuse</span>
                  </button>

                  <span className="text-slate-300 dark:text-slate-700">·</span>

                  <button
                    onClick={() => onSelectResult(item.result)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="Insert result as input"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Use Ans</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyItem(item)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
                    title="Copy calculation"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
