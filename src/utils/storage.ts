/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryItem } from '../types/calculator';

const HISTORY_KEY = 'numflow_calc_history_v1';
const MEMORY_KEY = 'numflow_calc_memory_v1';
const THEME_KEY = 'numflow_calc_theme_v1';
const SOUND_KEY = 'numflow_calc_sound_v1';

const INITIAL_SAMPLES: HistoryItem[] = [
  {
    id: 'sample-1',
    expression: '1,450 + 380 - 125',
    result: '1,705',
    timestamp: Date.now() - 1000 * 60 * 18,
    label: 'Monthly Utilities',
  },
  {
    id: 'sample-2',
    expression: '2,800 × 0.85',
    result: '2,380',
    timestamp: Date.now() - 1000 * 60 * 65,
    label: '15% Off Discount',
  },
  {
    id: 'sample-3',
    expression: '450 ÷ 4',
    result: '112.5',
    timestamp: Date.now() - 1000 * 60 * 140,
    label: 'Dinner Split (4 ways)',
  },
];

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLES;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return INITIAL_SAMPLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLES;
  } catch {
    return INITIAL_SAMPLES;
  }
}

export function saveHistory(history: HistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100))); // Cap at 100 items
  } catch {
    // Ignore storage quota errors
  }
}

export function loadMemory(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? parseFloat(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveMemory(val: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_KEY, val.toString());
  } catch {
    // Ignore storage quota
  }
}

export function loadTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function loadSoundSetting(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw !== null ? raw === 'true' : true;
  } catch {
    return true;
  }
}

export function saveSoundSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_KEY, enabled.toString());
  } catch {
    // Ignore
  }
}

/**
 * Exports history array as downloadable CSV
 */
export function exportHistoryAsCSV(items: HistoryItem[]): void {
  const header = 'Timestamp,Date,Label,Expression,Result\n';
  const rows = items
    .map((item) => {
      const date = new Date(item.timestamp).toISOString();
      const label = item.label ? `"${item.label.replace(/"/g, '""')}"` : '""';
      const expr = `"${item.expression.replace(/"/g, '""')}"`;
      const res = `"${item.result.replace(/"/g, '""')}"`;
      return `${item.timestamp},"${date}",${label},${expr},${res}`;
    })
    .join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `numflow_calculations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
