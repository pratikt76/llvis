/**
 * HeapPanel.jsx
 * Displays Heap memory — Node objects with address, data, and next pointer.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeapPanel({ heap, lastModified }) {
    const entries = Object.entries(heap);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Heap
            </h2>

            <div className="flex-1 panel rounded-lg overflow-auto">
                {entries.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <p className="text-neutral-600 text-xs">Empty</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#222]">
                                <th className="text-left px-4 py-2 text-xs text-neutral-500 font-medium">Address</th>
                                <th className="text-left px-4 py-2 text-xs text-neutral-500 font-medium">data</th>
                                <th className="text-left px-4 py-2 text-xs text-neutral-500 font-medium">next</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {entries.map(([addr, node]) => {
                                    const isActive = addr === lastModified;
                                    return (
                                        <motion.tr
                                            key={addr}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                backgroundColor: isActive
                                                    ? 'rgba(255, 255, 255, 0.03)'
                                                    : 'transparent',
                                            }}
                                            exit={{ opacity: 0, x: 12 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className={`border-b border-[#1a1a1a] transition-colors ${isActive ? '' : 'hover:bg-[#1e1e1e]'
                                                }`}
                                        >
                                            <td className="px-4 py-2 font-mono text-xs">
                                                <span className="bg-[#222] rounded px-2 py-0.5 text-neutral-400">
                                                    {addr}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 font-mono text-neutral-200 text-xs font-medium">
                                                {node.data}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs">
                                                {node.next ? (
                                                    <span className="bg-[#222] rounded px-2 py-0.5 text-neutral-400">
                                                        {node.next}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-600">null</span>
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
