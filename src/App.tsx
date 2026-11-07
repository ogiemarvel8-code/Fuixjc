/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { MemoryBar } from './components/MemoryBar';
import { Keypad } from './components/Keypad';
import { HistoryPanel } from './components/HistoryPanel';
import { QuickToolsModal } from './components/QuickToolsModal';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';
import { HistoryItem, CalcActionType } from './types/calculator';
import {
  evaluateExpression,
  computeLivePreview,
  formatNumber,
  cleanFloatingPoint,
} from './utils/calculator';
import { playSound } from './utils/audio';
import {
  loadHistory,
  saveHistory,
  loadMemory,
  saveMemory,
  loadTheme,
  saveTheme,
  loadSoundSetting,
  saveSoundSetting,
} from './utils/storage';

export default function App() {
  // App state
  const [expression, setExpression] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [isResultEvaluated, setIsResultEvaluated] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [memory, setMemory] = useState<number>(loadMemory);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);

  // Modals state
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist history and memory
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      saveSoundSetting(next);
      return next;
    });
  };

  // Live preview computation
  const fullExprForPreview = expression
    ? `${expression} ${currentInput && currentInput !== '0' ? currentInput : ''}`
    : currentInput;
  const livePreview = isResultEvaluated ? null : computeLivePreview(fullExprForPreview);

  // Central calculator action dispatcher
  const handleAction = useCallback(
    (action: CalcActionType, value?: string) => {
      if (action === 'digit' && value !== undefined) {
        playSound('digit', soundEnabled);

        if (isResultEvaluated) {
          // If previous operation was evaluated, start a brand new calculation
          setExpression('');
          setCurrentInput(value);
          setIsResultEvaluated(false);
          return;
        }

        setCurrentInput((prev) => {
          if (prev === '0' || prev === 'Error') {
            return value;
          }
          // Max input length guard to avoid display overflow
          if (prev.length >= 16) return prev;
          return prev + value;
        });
      } else if (action === 'decimal') {
        playSound('digit', soundEnabled);

        if (isResultEvaluated) {
          setExpression('');
          setCurrentInput('0.');
          setIsResultEvaluated(false);
          return;
        }

        setCurrentInput((prev) => {
          if (!prev || prev === '0' || prev === 'Error') {
            return '0.';
          }
          if (prev.includes('.')) {
            return prev;
          }
          return prev + '.';
        });
      } else if (action === 'operator' && value !== undefined) {
        playSound('operator', soundEnabled);

        const opSymbol = value;

        if (isResultEvaluated) {
          // Continue calculating from the previous result
          setExpression(`${currentInput} ${opSymbol}`);
          setCurrentInput('');
          setIsResultEvaluated(false);
          return;
        }

        if (currentInput && currentInput !== 'Error') {
          setExpression((prev) => (prev ? `${prev} ${currentInput} ${opSymbol}` : `${currentInput} ${opSymbol}`));
          setCurrentInput('');
        } else if (expression) {
          // If no current input, replace the trailing operator if user changes mind
          setExpression((prev) => {
            const trimmed = prev.trim();
            const lastWord = trimmed.split(' ').pop();
            if (['+', '-', '−', '*', '×', '/', '÷', '^'].includes(lastWord || '')) {
              const withoutLastOp = trimmed.substring(0, trimmed.lastIndexOf(lastWord!)).trim();
              return `${withoutLastOp} ${opSymbol}`;
            }
            return `${prev} ${opSymbol}`;
          });
        }
      } else if (action === 'equals') {
        // Construct full expression
        const fullExpr = expression
          ? `${expression} ${currentInput ? currentInput : ''}`.trim()
          : currentInput.trim();

        if (!fullExpr || fullExpr === 'Error') return;

        const evalRes = evaluateExpression(fullExpr);

        if (evalRes.error || isNaN(evalRes.result)) {
          playSound('error', soundEnabled);
          setCurrentInput(evalRes.formatted || 'Error');
          setIsResultEvaluated(true);
        } else {
          playSound('equals', soundEnabled);
          const resultStr = evalRes.formatted;

          // Add to History
          const newHistoryItem: HistoryItem = {
            id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            expression: fullExpr,
            result: resultStr,
            timestamp: Date.now(),
          };
          setHistory((prev) => [newHistoryItem, ...prev]);

          // Update Calculator state
          setExpression(fullExpr);
          setCurrentInput(resultStr);
          setIsResultEvaluated(true);
        }
      } else if (action === 'allClear') {
        playSound('clear', soundEnabled);
        setExpression('');
        setCurrentInput('0');
        setIsResultEvaluated(false);
      } else if (action === 'clear') {
        playSound('clear', soundEnabled);
        if (currentInput && currentInput !== '0') {
          setCurrentInput('0');
        } else {
          setExpression('');
          setCurrentInput('0');
        }
        setIsResultEvaluated(false);
      } else if (action === 'backspace') {
        playSound('clear', soundEnabled);
        if (isResultEvaluated) {
          setExpression('');
          setCurrentInput('0');
          setIsResultEvaluated(false);
          return;
        }

        if (currentInput.length > 1) {
          setCurrentInput((prev) => prev.slice(0, -1));
        } else if (currentInput.length === 1) {
          setCurrentInput('0');
        } else if (expression) {
          // If currentInput is empty, backspace from the trailing expression
          setExpression((prev) => {
            const parts = prev.trim().split(' ');
            parts.pop();
            return parts.join(' ');
          });
        }
      } else if (action === 'negate') {
        playSound('digit', soundEnabled);
        if (!currentInput || currentInput === '0' || currentInput === 'Error') return;

        setCurrentInput((prev) => {
          if (prev.startsWith('-')) {
            return prev.slice(1);
          }
          return `-${prev}`;
        });
      } else if (action === 'percent') {
        playSound('operator', soundEnabled);
        if (!currentInput || currentInput === 'Error') return;
        setCurrentInput((prev) => `${prev}%`);
      } else if (action === 'parenthesis') {
        playSound('operator', soundEnabled);
        // Smart parentheses logic
        const targetStr = `${expression} ${currentInput}`;
        const openCount = (targetStr.match(/\(/g) || []).length;
        const closeCount = (targetStr.match(/\)/g) || []).length;

        // If there are unclosed parentheses and currentInput exists, close it
        if (openCount > closeCount && currentInput && currentInput !== '0') {
          if (expression) {
            setExpression((prev) => `${prev} ${currentInput})`);
          } else {
            setCurrentInput((prev) => `${prev})`);
          }
          setCurrentInput('');
        } else {
          // Otherwise open a new parenthesis
          if (currentInput && currentInput !== '0') {
            setExpression((prev) => (prev ? `${prev} ${currentInput} * (` : `${currentInput} * (`));
            setCurrentInput('');
          } else {
            setExpression((prev) => (prev ? `${prev} (` : '('));
          }
        }
      } else if (action === 'sqrt') {
        playSound('operator', soundEnabled);
        const val = parseFloat(currentInput);
        if (!isNaN(val) && val >= 0) {
          const res = cleanFloatingPoint(Math.sqrt(val));
          const formatted = formatNumber(res);
          // Save to history
          const item: HistoryItem = {
            id: `calc-${Date.now()}`,
            expression: `√(${val})`,
            result: formatted,
            timestamp: Date.now(),
          };
          setHistory((prev) => [item, ...prev]);
          setExpression(`√(${val})`);
          setCurrentInput(formatted);
          setIsResultEvaluated(true);
        } else {
          playSound('error', soundEnabled);
          setCurrentInput('Error');
        }
      } else if (action === 'power') {
        playSound('operator', soundEnabled);
        const val = parseFloat(currentInput);
        if (isNaN(val)) return;

        if (value === '2') {
          const res = cleanFloatingPoint(val * val);
          const formatted = formatNumber(res);
          const item: HistoryItem = {
            id: `calc-${Date.now()}`,
            expression: `(${val})²`,
            result: formatted,
            timestamp: Date.now(),
          };
          setHistory((prev) => [item, ...prev]);
          setExpression(`(${val})²`);
          setCurrentInput(formatted);
          setIsResultEvaluated(true);
        } else if (value === 'reciprocal') {
          if (val === 0) {
            playSound('error', soundEnabled);
            setCurrentInput('Cannot divide by zero');
            setIsResultEvaluated(true);
            return;
          }
          const res = cleanFloatingPoint(1 / val);
          const formatted = formatNumber(res);
          const item: HistoryItem = {
            id: `calc-${Date.now()}`,
            expression: `1 / (${val})`,
            result: formatted,
            timestamp: Date.now(),
          };
          setHistory((prev) => [item, ...prev]);
          setExpression(`1 / (${val})`);
          setCurrentInput(formatted);
          setIsResultEvaluated(true);
        }
      }
    },
    [currentInput, expression, isResultEvaluated, soundEnabled]
  );

  // Global physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key;

      // Pulse visual keypress
      setActiveKeyId(key);
      setTimeout(() => setActiveKeyId(null), 150);

      if (/^[0-9]$/.test(key)) {
        handleAction('digit', key);
      } else if (key === '.') {
        handleAction('decimal');
      } else if (key === '+') {
        e.preventDefault();
        handleAction('operator', '+');
      } else if (key === '-') {
        e.preventDefault();
        handleAction('operator', '−');
      } else if (key === '*') {
        e.preventDefault();
        handleAction('operator', '×');
      } else if (key === '/') {
        e.preventDefault();
        handleAction('operator', '÷');
      } else if (key === '^') {
        e.preventDefault();
        handleAction('operator', '^');
      } else if (key === '%') {
        e.preventDefault();
        handleAction('percent');
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleAction('parenthesis');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleAction('equals');
      } else if (key === 'Escape') {
        e.preventDefault();
        handleAction('allClear');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleAction('backspace');
      } else if (key.toLowerCase() === 'm') {
        // Quick shortcut: m for Memory Add
        e.preventDefault();
        const val = parseFloat(currentInput) || 0;
        setMemory((prev) => prev + val);
        playSound('operator', soundEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, handleAction, soundEnabled]);

  // Memory operations
  const handleMemoryClear = () => {
    playSound('clear', soundEnabled);
    setMemory(0);
  };

  const handleMemoryRecall = () => {
    playSound('digit', soundEnabled);
    setCurrentInput(memory.toString());
    setIsResultEvaluated(false);
  };

  const handleMemoryAdd = () => {
    playSound('operator', soundEnabled);
    const val = parseFloat(currentInput) || 0;
    setMemory((prev) => cleanFloatingPoint(prev + val));
  };

  const handleMemorySubtract = () => {
    playSound('operator', soundEnabled);
    const val = parseFloat(currentInput) || 0;
    setMemory((prev) => cleanFloatingPoint(prev - val));
  };

  const handleMemoryStore = () => {
    playSound('operator', soundEnabled);
    const val = parseFloat(currentInput) || 0;
    setMemory(val);
  };

  // History operations
  const handleSelectHistoryExpression = (expr: string) => {
    playSound('digit', soundEnabled);
    setExpression('');
    setCurrentInput(expr);
    setIsResultEvaluated(false);
    setActiveTab('calculator');
  };

  const handleSelectHistoryResult = (resultVal: string) => {
    playSound('digit', soundEnabled);
    setCurrentInput(resultVal);
    setIsResultEvaluated(false);
    setActiveTab('calculator');
  };

  const handleDeleteHistoryItem = (id: string) => {
    playSound('clear', soundEnabled);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    playSound('clear', soundEnabled);
    setHistory([]);
  };

  const handleUpdateHistoryLabel = (id: string, label: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  const handleInsertQuickValue = (val: string) => {
    setCurrentInput(val);
    setIsResultEvaluated(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        openKeyboardGuide={() => setIsKeyboardGuideOpen(true)}
        openQuickTools={() => setIsQuickToolsOpen(true)}
        historyCount={history.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Responsive Dual-Pane: Left is Calculator, Right is History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto w-full">
          {/* Left Column: Calculator Unit (Cols 1-7 on lg) */}
          <section
            className={`w-full max-w-md mx-auto lg:max-w-none lg:col-span-7 flex flex-col gap-3 ${
              activeTab === 'history' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Display Component */}
            <Display
              expression={expression}
              currentInput={currentInput}
              livePreview={livePreview}
              memoryValue={memory}
              onClearMemory={handleMemoryClear}
              onRecallMemory={handleMemoryRecall}
              onBackspace={() => handleAction('backspace')}
              isResultEvaluated={isResultEvaluated}
            />

            {/* Memory Toolbar & fx toggle */}
            <div className="px-1">
              <MemoryBar
                memoryValue={memory}
                onMemoryClear={handleMemoryClear}
                onMemoryRecall={handleMemoryRecall}
                onMemoryAdd={handleMemoryAdd}
                onMemorySubtract={handleMemorySubtract}
                onMemoryStore={handleMemoryStore}
                showAdvanced={showAdvanced}
                onToggleAdvanced={() => setShowAdvanced((prev) => !prev)}
              />
            </div>

            {/* Tactile Keypad */}
            <div className="p-3 sm:p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
              <Keypad
                onAction={handleAction}
                showAdvanced={showAdvanced}
                activeKeyId={activeKeyId}
              />
            </div>

            {/* Quick Helper Banner */}
            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Keyboard active: Type numbers, Enter to solve, Esc to clear
              </span>
              <button
                onClick={() => setIsKeyboardGuideOpen(true)}
                className="hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
              >
                All keys
              </button>
            </div>
          </section>

          {/* Right Column: Calculation History (Cols 8-12 on lg) */}
          <section
            className={`w-full max-w-md mx-auto lg:max-w-none lg:col-span-5 h-[540px] sm:h-[580px] lg:h-[610px] ${
              activeTab === 'calculator' ? 'hidden lg:flex flex-col' : 'flex flex-col'
            }`}
          >
            <HistoryPanel
              history={history}
              onSelectExpression={handleSelectHistoryExpression}
              onSelectResult={handleSelectHistoryResult}
              onDeleteItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onUpdateLabel={handleUpdateHistoryLabel}
            />
          </section>
        </div>
      </main>

      {/* Quick Tools Modal */}
      <QuickToolsModal
        isOpen={isQuickToolsOpen}
        onClose={() => setIsQuickToolsOpen(false)}
        onInsertValue={handleInsertQuickValue}
      />

      {/* Keyboard Guide Modal */}
      <KeyboardGuideModal
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
      />
    </div>
  );
}
