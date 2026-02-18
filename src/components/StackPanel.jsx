/**
 * StackPanel.jsx
 * Displays the Stack frame — variable names and their heap addresses.
 * Blue-themed.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StackPanel({ stack }) {
    const entries = Object.entries(stack);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-widest">
                    Stack Frame
                </h2>
            </div>

            <div className="flex-1 glass rounded-xl overflow-auto">
                {entries.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <p className="text-slate-600 text-xs text-center">Stack is empty</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Variable</th>
                                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {entries.map(([varName, addr]) => (
                                    <motion.tr
                                        key={varName}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="border-b border-slate-800/50 hover:bg-blue-950/20 transition-colors"
                                    >
                                        <td className="px-4 py-2.5 font-mono text-blue-300 font-medium">
                                            {varName}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-slate-300">
                                            {addr ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="text-blue-400">→</span>
                                                    <span className="bg-blue-950/50 border border-blue-800/40 rounded px-2 py-0.5 text-xs">
                                                        {addr}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">null</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
