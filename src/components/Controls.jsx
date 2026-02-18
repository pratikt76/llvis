/**
 * Controls.jsx
 * Playback controls: Run, Step, Pause, Reset + step counter + speed slider.
 */
import React from 'react';
import { motion } from 'framer-motion';

const BTN_BASE =
    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed';

export default function Controls({
    isPlaying,
    currentStep,
    totalSteps,
    speed,
    onRun,
    onStep,
    onPause,
    onReset,
    onSpeedChange,
    hasSteps,
}) {
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
    const isDone = currentStep >= totalSteps - 1 && totalSteps > 0;

    return (
        <div className="glass rounded-xl px-5 py-4 flex flex-col gap-3">
            {/* Button row */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Run / Pause */}
                {isPlaying ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onPause}
                        className={`${BTN_BASE} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30`}
                    >
                        <span>⏸</span> Pause
                    </motion.button>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onRun}
                        disabled={!hasSteps || isDone}
                        className={`${BTN_BASE} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30`}
                    >
                        <span>▶</span> {isDone ? 'Done' : 'Run'}
                    </motion.button>
                )}

                {/* Step */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onStep}
                    disabled={!hasSteps || isPlaying || isDone}
                    className={`${BTN_BASE} bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30`}
                >
                    <span>⏭</span> Step
                </motion.button>

                {/* Reset */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className={`${BTN_BASE} bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:bg-slate-700/60`}
                >
                    <span>🔄</span> Reset
                </motion.button>

                {/* Step counter */}
                <div className="ml-auto text-xs text-slate-400 font-mono">
                    {totalSteps > 0
                        ? `Step ${Math.max(0, currentStep + 1)} / ${totalSteps}`
                        : 'No steps'}
                </div>
            </div>

            {/* Progress bar */}
            {totalSteps > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}

            {/* Speed slider */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>🐢</span>
                <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={2200 - speed} // invert so right = faster
                    onChange={e => onSpeedChange(2200 - Number(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1"
                />
                <span>⚡</span>
                <span className="w-16 text-right text-slate-400">
                    {speed < 500 ? 'Fast' : speed < 1200 ? 'Normal' : 'Slow'}
                </span>
            </div>
        </div>
    );
}
