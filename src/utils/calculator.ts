/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes standard and visual symbols to clean mathematical representations
 */
export function normalizeExpression(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/,/g, '');
}

/**
 * Pre-processes percentage operations in expressions according to standard calculator rules:
 * - A + B% => A + (A * (B / 100))
 * - A - B% => A - (A * (B / 100))
 * - A * B% => A * (B / 100)
 * - A / B% => A / (B / 100)
 * - Isolated B% => (B / 100)
 */
function handlePercentages(expr: string): string {
  if (!expr.includes('%')) return expr;

  // Regex pattern for: [base number] [operator +|-] [percent number]%
  // e.g. 100 + 15% -> 100 + (100 * 15 / 100)
  const addSubPattern = /(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)%/g;
  let processed = expr.replace(addSubPattern, (_, base, op, pct) => {
    return `${base} ${op} (${base} * ${pct} / 100)`;
  });

  // Regex pattern for: [base number] [operator *|/] [percent number]%
  // e.g. 200 * 15% -> 200 * (15 / 100)
  const mulDivPattern = /(-?\d+(?:\.\d+)?)\s*([*/])\s*(\d+(?:\.\d+)?)%/g;
  processed = processed.replace(mulDivPattern, (_, base, op, pct) => {
    return `${base} ${op} (${pct} / 100)`;
  });

  // Isolated percentages e.g. 50% -> (50 / 100)
  const isolatedPattern = /(\d+(?:\.\d+)?)%/g;
  processed = processed.replace(isolatedPattern, '($1 / 100)');

  return processed;
}

/**
 * Handle square root conversions:
 * √(X) or √X -> Math.sqrt(X)
 */
function handleSquareRoots(expr: string): string {
  if (!expr.includes('√')) return expr;

  // √(number or expression)
  const sqrtParenPattern = /√\(([^)]+)\)/g;
  let processed = expr.replace(sqrtParenPattern, (_, inner) => `Math.sqrt(${inner})`);

  // √number (e.g. √9 -> Math.sqrt(9))
  const sqrtNumPattern = /√(\d+(?:\.\d+)?)/g;
  processed = processed.replace(sqrtNumPattern, (_, num) => `Math.sqrt(${num})`);

  return processed;
}

/**
 * Handle power conversions:
 * X ^ Y -> Math.pow(X, Y)
 */
function handlePowers(expr: string): string {
  if (!expr.includes('^')) return expr;

  // Convert A ^ B to Math.pow(A, B)
  // Simple token parser for ^
  const powerPattern = /(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g;
  let processed = expr;
  while (processed.includes('^')) {
    const next = processed.replace(powerPattern, (_, base, exp) => `Math.pow(${base}, ${exp})`);
    if (next === processed) break;
    processed = next;
  }
  return processed;
}

/**
 * Sanitizes and safely evaluates a mathematical expression
 */
export function evaluateExpression(rawExpr: string): { result: number; formatted: string; error?: string } {
  if (!rawExpr || !rawExpr.trim()) {
    return { result: 0, formatted: '0' };
  }

  const normalized = normalizeExpression(rawExpr.trim());

  // Check for division by zero before evaluation
  if (/\/0(?![.\d])|\/\s*0(?![.\d])/.test(normalized)) {
    return { result: NaN, formatted: 'Error', error: 'Cannot divide by zero' };
  }

  // Auto-close unmatched open parentheses
  let balancedExpr = normalized;
  const openCount = (balancedExpr.match(/\(/g) || []).length;
  const closeCount = (balancedExpr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    balancedExpr += ')'.repeat(openCount - closeCount);
  }

  // Preprocess special operations
  let prep = handlePercentages(balancedExpr);
  prep = handleSquareRoots(prep);
  prep = handlePowers(prep);

  // Security whitelist check: allow only digits, basic math symbols, Math.sqrt, Math.pow, whitespace
  const safeRegex = /^[\d\s+\-*/().%^]|Math\.(sqrt|pow)/;
  const stripped = prep.replace(/Math\.(sqrt|pow)/g, '');
  if (!/^[\d\s+\-*/().,^]*$/.test(stripped)) {
    return { result: NaN, formatted: 'Error', error: 'Invalid expression' };
  }

  try {
    // Safe evaluation using Function with Math in scope and restricted execution
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function('Math', `"use strict"; return (${prep});`);
    const val = fn(Math);

    if (typeof val !== 'number' || isNaN(val)) {
      return { result: NaN, formatted: 'Error', error: 'Calculation error' };
    }

    if (!isFinite(val)) {
      return { result: NaN, formatted: 'Overflow', error: 'Value exceeds limit' };
    }

    const cleanedVal = cleanFloatingPoint(val);
    const formatted = formatNumber(cleanedVal);

    return { result: cleanedVal, formatted };
  } catch {
    return { result: NaN, formatted: 'Error', error: 'Syntax error' };
  }
}

/**
 * Cleans precision errors like 0.1 + 0.2 = 0.30000000000000004
 */
export function cleanFloatingPoint(num: number): number {
  if (Number.isInteger(num)) return num;
  // Use precision 12 to eliminate IEEE-754 precision noise without losing real values
  const precisionStr = num.toPrecision(12);
  return parseFloat(precisionStr);
}

/**
 * Formats a numeric value nicely with grouping commas while respecting decimal lengths
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Overflow';

  // For very large or very small numbers, use scientific notation
  if (Math.abs(num) >= 1e14 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return num.toExponential(6).replace(/\+/, '');
  }

  const parts = num.toString().split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Formats the active expression string for display with beautiful mathematical glyphs
 */
export function formatDisplayExpression(expr: string): string {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/(?<![+\-*/^(\s])-(?=\d|[a-zA-Z(√])/g, ' − ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Safely computes a live preview subtotal for the current expression
 */
export function computeLivePreview(expr: string): string | null {
  if (!expr || !expr.trim()) return null;

  // Trim trailing operators for preview
  let cleaned = expr.trim();
  while (/[+\-*/^%√(]$/.test(cleaned)) {
    cleaned = cleaned.slice(0, -1).trim();
  }

  // If after trimming operators there's nothing or only a single number, no need for preview
  if (!cleaned || !/[+\-*/^%√]/.test(cleaned)) {
    return null;
  }

  const evalRes = evaluateExpression(cleaned);
  if (evalRes.error || isNaN(evalRes.result)) {
    return null;
  }

  return evalRes.formatted;
}
