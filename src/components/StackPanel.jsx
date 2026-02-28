/**
 * StackPanel.jsx
 * Displays the Stack frame — variable names and their heap addresses.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StackPanel({ stack }) {
    const entries = Object.entries(stack);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Stack
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
                                <th className="text-left px-4 py-2 text-xs text-neutral-500 font-medium">Variable</th>
                                <th className="text-left px-4 py-2 text-xs text-neutral-500 font-medium">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {entries.map(([varName, addr]) => (
                                    <motion.tr
                                        key={varName}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="border-b border-[#1a1a1a] hover:bg-[#1e1e1e] transition-colors"
                                    >
                                        <td className="px-4 py-2 font-mono text-neutral-300 text-xs">
                                            {varName}
                                        </td>
                                        <td className="px-4 py-2 font-mono text-neutral-400 text-xs">
                                            {addr ? (
                                                <span className="bg-[#222] rounded px-2 py-0.5">
                                                    {addr}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-600">null</span>
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
