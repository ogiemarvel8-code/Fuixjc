/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sun, Moon, Keyboard, Wrench, RotateCcw } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  openKeyboardGuide: () => void;
  openQuickTools: () => void;
  historyCount: number;
  activeTab: 'calculator' | 'history';
  setActiveTab: (tab: 'calculator' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  openKeyboardGuide,
  openQuickTools,
  historyCount,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-sm">
            ±
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              NumFlow
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
              Precision Calculator
            </span>
          </div>
        </div>

        {/* Mobile / Tablet Segmented Switcher */}
        <div className="flex lg:hidden items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Calc
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 2: Action Tools (Quick Tools & Keyboard Shortcuts) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={openQuickTools}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tip & Split Bill Tools"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Quick Tools</span>
          </button>
          <button
            onClick={openKeyboardGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Zone 3: Controls (Sound & Theme toggles) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute Key Sounds' : 'Unmute Key Sounds'}
            title={soundEnabled ? 'Key Sound: On' : 'Key Sound: Muted'}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
