/**
 * Controls.jsx
 * Playback controls: Run, Step, Pause, Reset + step counter + speed slider.
 */
import React from 'react';
import { motion } from 'framer-motion';

const BTN =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed border border-[#333] bg-[#1a1a1a] hover:bg-[#252525] text-neutral-300';

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
        <div className="panel rounded-lg px-4 py-3 flex flex-col gap-2">
            {/* Button row */}
            <div className="flex items-center gap-2 flex-wrap">
                {isPlaying ? (
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onPause}
                        className={BTN}
                    >
                        ⏸ Pause
                    </motion.button>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onRun}
                        disabled={!hasSteps || isDone}
                        className={BTN}
                    >
                        ▶ {isDone ? 'Done' : 'Run'}
                    </motion.button>
                )}

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onStep}
                    disabled={!hasSteps || isPlaying || isDone}
                    className={BTN}
                >
                    ⏭ Step
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onReset}
                    className={BTN}
                >
                    Reset
                </motion.button>

                <div className="ml-auto text-xs text-neutral-500 font-mono">
                    {totalSteps > 0
                        ? `${Math.max(0, currentStep + 1)} / ${totalSteps}`
                        : '—'}
                </div>
            </div>

            {/* Progress bar */}
            {totalSteps > 0 && (
                <div className="w-full bg-[#1a1a1a] rounded-full h-1 overflow-hidden">
                    <motion.div
                        className="h-full bg-[#444] rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}

            {/* Speed slider */}
            <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span>Slow</span>
                <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={2200 - speed}
                    onChange={e => onSpeedChange(2200 - Number(e.target.value))}
                    className="flex-1 accent-neutral-500 h-0.5"
                />
                <span>Fast</span>
            </div>
        </div>
    );
}
