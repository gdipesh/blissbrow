/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 right-6 z-50 max-w-md w-full"
        >
          <div className="bg-white/95 backdrop-blur-md border border-dusty/20 rounded-2xl shadow-xl p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {type === 'success' && (
                <CheckCircle2 size={20} className="text-emerald-500" />
              )}
              {type === 'error' && (
                <AlertCircle size={20} className="text-rose-500" />
              )}
              {type === 'info' && (
                <Info size={20} className="text-gold" />
              )}
            </div>
            
            <div className="flex-grow">
              <p className="text-sm font-sans text-charcoal font-medium leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 text-charcoal/40 hover:text-charcoal/80 transition-colors p-0.5 rounded-lg hover:bg-cream"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
