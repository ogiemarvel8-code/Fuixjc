/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  label?: string;
}

export type CalcActionType =
  | 'digit'
  | 'operator'
  | 'decimal'
  | 'equals'
  | 'clear'
  | 'allClear'
  | 'backspace'
  | 'negate'
  | 'percent'
  | 'parenthesis'
  | 'power'
  | 'sqrt';

export interface KeypadButtonConfig {
  label: string;
  display?: string;
  action: CalcActionType;
  value?: string;
  variant?: 'number' | 'operator' | 'action' | 'equals' | 'secondary';
  keyboardKey?: string | string[];
  gridSpan?: number;
  ariaLabel?: string;
}
