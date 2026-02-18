/**
 * HeapPanel.jsx
 * Displays Heap memory — Node objects with address, data, and next pointer.
 * Purple-themed.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeapPanel({ heap, lastModified }) {
    const entries = Object.entries(heap);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest">
                    Heap Memory
                </h2>
            </div>

            <div className="flex-1 glass rounded-xl overflow-auto">
                {entries.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <p className="text-slate-600 text-xs text-center">Heap is empty</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Address</th>
                                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">data</th>
                                <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">next</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {entries.map(([addr, node]) => {
                                    const isActive = addr === lastModified;
                                    return (
                                        <motion.tr
                                            key={addr}
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                backgroundColor: isActive
                                                    ? 'rgba(168, 85, 247, 0.12)'
                                                    : 'transparent',
                                            }}
                                            exit={{ opacity: 0, x: 16 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className={`border-b border-slate-800/50 transition-colors ${isActive ? 'ring-1 ring-inset ring-purple-500/30' : 'hover:bg-purple-950/10'
                                                }`}
                                        >
                                            <td className="px-4 py-2.5 font-mono">
                                                <span className="bg-purple-950/50 border border-purple-800/40 rounded px-2 py-0.5 text-xs text-purple-300">
                                                    {addr}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-white font-semibold">
                                                {node.data}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono">
                                                {node.next ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-purple-400">→</span>
                                                        <span className="bg-purple-950/50 border border-purple-800/40 rounded px-2 py-0.5 text-xs text-purple-300">
                                                            {node.next}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">null</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
