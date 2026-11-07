/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Users, Percent, ArrowRight } from 'lucide-react';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertValue: (val: string) => void;
}

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  onInsertValue,
}) => {
  const [activeTab, setActiveTab] = useState<'tip' | 'discount'>('tip');

  // Tip Calculator state
  const [billAmount, setBillAmount] = useState<string>('120');
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [splitCount, setSplitCount] = useState<number>(2);

  // Discount Calculator state
  const [origPrice, setOrigPrice] = useState<string>('80');
  const [discPercent, setDiscPercent] = useState<number>(25);

  if (!isOpen) return null;

  // Tip calculations
  const parsedBill = parseFloat(billAmount) || 0;
  const activeTipRate = customTip ? parseFloat(customTip) || 0 : tipPercent;
  const tipVal = (parsedBill * activeTipRate) / 100;
  const totalWithTip = parsedBill + tipVal;
  const perPerson = splitCount > 0 ? totalWithTip / splitCount : totalWithTip;

  // Discount calculations
  const parsedPrice = parseFloat(origPrice) || 0;
  const savings = (parsedPrice * discPercent) / 100;
  const finalPrice = parsedPrice - savings;

  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Quick Calculation Helpers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-1">
          <button
            onClick={() => setActiveTab('tip')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'tip'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tip & Bill Split</span>
          </button>
          <button
            onClick={() => setActiveTab('discount')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'discount'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discount & Sale</span>
          </button>
        </div>

        {/* Tab 1: Tip & Split */}
        {activeTab === 'tip' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Bill Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Tip Percentage</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {activeTipRate}% (${tipVal.toFixed(2)})
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tipPresets.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setTipPercent(pct);
                      setCustomTip('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      tipPercent === pct && !customTip
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Split Between</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {splitCount} {splitCount === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSplitCount(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      splitCount === num
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Result Summary Card */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Total with Tip:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${totalWithTip.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-amber-500/20">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Each Person Pays:
                </span>
                <span className="font-mono text-xl font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                  ${perPerson.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onInsertValue(perPerson.toFixed(2));
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Send ${perPerson.toFixed(2)} to Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 2: Discount */}
        {activeTab === 'discount' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Original Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Discount Percentage</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {discPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[10, 15, 20, 25, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscPercent(pct)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      discPercent === pct
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Summary Card */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">You Save:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  -${savings.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-amber-500/20">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Discounted Price:
                </span>
                <span className="font-mono text-xl font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onInsertValue(finalPrice.toFixed(2));
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Send ${finalPrice.toFixed(2)} to Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
