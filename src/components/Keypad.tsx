/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delete } from 'lucide-react';
import { CalcActionType } from '../types/calculator';

interface KeypadProps {
  onAction: (action: CalcActionType, value?: string) => void;
  showAdvanced: boolean;
  activeKeyId: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  onAction,
  showAdvanced,
  activeKeyId,
}) => {
  // Styles based on button variant
  const getButtonClass = (
    variant: 'number' | 'operator' | 'action' | 'equals' | 'advanced',
    keyId: string
  ) => {
    const isPressed = activeKeyId === keyId;
    const base =
      'relative h-13 sm:h-14 rounded-2xl font-semibold text-lg flex items-center justify-center transition-all duration-100 select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-2xs';

    if (variant === 'equals') {
      return `${base} bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-bold hover:brightness-105 active:brightness-95 shadow-md shadow-amber-500/25 ${
        isPressed ? 'scale-95 brightness-90 ring-2 ring-amber-400' : ''
      }`;
    }

    if (variant === 'operator') {
      return `${base} bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 ${
        isPressed ? 'scale-95 bg-amber-200 dark:bg-amber-800' : ''
      }`;
    }

    if (variant === 'action') {
      return `${base} bg-slate-100 dark:bg-slate-800/90 text-rose-600 dark:text-rose-400 border border-slate-200/80 dark:border-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 ${
        isPressed ? 'scale-95 bg-rose-100 dark:bg-rose-900' : ''
      }`;
    }

    if (variant === 'advanced') {
      return `${base} bg-slate-100/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-sm sm:text-base font-mono ${
        isPressed ? 'scale-95 bg-slate-200 dark:bg-slate-700' : ''
      }`;
    }

    // Standard number key
    return `${base} bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750 ${
      isPressed ? 'scale-95 bg-slate-100 dark:bg-slate-700' : ''
    }`;
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Optional Advanced Math Functions Row */}
      {showAdvanced && (
        <div className="grid grid-cols-5 gap-2 animate-fadeIn">
          <button
            onClick={() => onAction('sqrt')}
            className={getButtonClass('advanced', 'sqrt')}
            title="Square Root (√)"
          >
            √x
          </button>
          <button
            onClick={() => onAction('power', '2')}
            className={getButtonClass('advanced', 'sq')}
            title="Square (x²)"
          >
            x²
          </button>
          <button
            onClick={() => onAction('operator', '^')}
            className={getButtonClass('advanced', '^')}
            title="Power (xʸ)"
          >
            xʸ
          </button>
          <button
            onClick={() => onAction('power', 'reciprocal')}
            className={getButtonClass('advanced', 'inv')}
            title="Reciprocal (1/x)"
          >
            1/x
          </button>
          <button
            onClick={() => onAction('backspace')}
            className={getButtonClass('advanced', 'backspace')}
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Keypad Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          onClick={() => onAction('allClear')}
          className={getButtonClass('action', 'Escape')}
          title="All Clear (Escape)"
        >
          AC
        </button>
        <button
          onClick={() => onAction('parenthesis')}
          className={getButtonClass('advanced', '()')}
          title="Parentheses ( )"
        >
          ( )
        </button>
        <button
          onClick={() => onAction('percent')}
          className={getButtonClass('operator', '%')}
          title="Percentage (%)"
        >
          %
        </button>
        <button
          onClick={() => onAction('operator', '÷')}
          className={getButtonClass('operator', '/')}
          title="Divide (÷)"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onAction('digit', '7')}
          className={getButtonClass('number', '7')}
        >
          7
        </button>
        <button
          onClick={() => onAction('digit', '8')}
          className={getButtonClass('number', '8')}
        >
          8
        </button>
        <button
          onClick={() => onAction('digit', '9')}
          className={getButtonClass('number', '9')}
        >
          9
        </button>
        <button
          onClick={() => onAction('operator', '×')}
          className={getButtonClass('operator', '*')}
          title="Multiply (×)"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => onAction('digit', '4')}
          className={getButtonClass('number', '4')}
        >
          4
        </button>
        <button
          onClick={() => onAction('digit', '5')}
          className={getButtonClass('number', '5')}
        >
          5
        </button>
        <button
          onClick={() => onAction('digit', '6')}
          className={getButtonClass('number', '6')}
        >
          6
        </button>
        <button
          onClick={() => onAction('operator', '−')}
          className={getButtonClass('operator', '-')}
          title="Subtract (−)"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => onAction('digit', '1')}
          className={getButtonClass('number', '1')}
        >
          1
        </button>
        <button
          onClick={() => onAction('digit', '2')}
          className={getButtonClass('number', '2')}
        >
          2
        </button>
        <button
          onClick={() => onAction('digit', '3')}
          className={getButtonClass('number', '3')}
        >
          3
        </button>
        <button
          onClick={() => onAction('operator', '+')}
          className={getButtonClass('operator', '+')}
          title="Add (+)"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => onAction('negate')}
          className={getButtonClass('number', '±')}
          title="Toggle Positive / Negative (±)"
        >
          ±
        </button>
        <button
          onClick={() => onAction('digit', '0')}
          className={getButtonClass('number', '0')}
        >
          0
        </button>
        <button
          onClick={() => onAction('decimal')}
          className={getButtonClass('number', '.')}
          title="Decimal point (.)"
        >
          .
        </button>
        <button
          onClick={() => onAction('equals')}
          className={getButtonClass('equals', 'Enter')}
          title="Calculate result (Enter or =)"
        >
          =
        </button>
      </div>
    </div>
  );
};
