/**
 * StepInfo.jsx
 * Shows a human-readable description of the current execution step.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepInfo({ step, stepIndex, totalSteps, errors }) {
    return (
        <div className="glass rounded-xl px-5 py-3 min-h-[56px] flex items-center gap-3">
            {/* Icon */}
            <div className="text-lg flex-shrink-0">
                {errors?.length > 0 ? '⚠️' : step ? '💡' : '📋'}
            </div>

            <AnimatePresence mode="wait">
                {errors?.length > 0 ? (
                    <motion.div
                        key="errors"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm text-red-400"
                    >
                        {errors.map((e, i) => (
                            <div key={i}>Line {e.lineIndex + 1}: {e.message}</div>
                        ))}
                    </motion.div>
                ) : step ? (
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-slate-200"
                    >
                        <span className="text-indigo-400 font-mono text-xs mr-2">
                            [{stepIndex + 1}/{totalSteps}]
                        </span>
                        {step.description}
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-slate-500"
                    >
                        Press <span className="text-emerald-400 font-mono">▶ Run</span> or{' '}
                        <span className="text-indigo-400 font-mono">⏭ Step</span> to begin execution
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
