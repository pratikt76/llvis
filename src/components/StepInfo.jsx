/**
 * StepInfo.jsx
 * Shows a human-readable description of the current execution step.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepInfo({ step, stepIndex, totalSteps, errors }) {
    return (
        <div className="panel rounded-lg px-4 py-3 min-h-[48px] flex items-center">
            <AnimatePresence mode="wait">
                {errors?.length > 0 ? (
                    <motion.div
                        key="errors"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-red-400/80"
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
                        className="text-xs text-neutral-300"
                    >
                        <span className="text-neutral-500 font-mono mr-2">
                            [{stepIndex + 1}/{totalSteps}]
                        </span>
                        {step.description}
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-neutral-500"
                    >
                        Press <span className="font-mono">▶ Run</span> or{' '}
                        <span className="font-mono">⏭ Step</span> to begin
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
