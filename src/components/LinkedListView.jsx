/**
 * LinkedListView.jsx
 * Renders the linked list as animated node cards with SVG arrows.
 * Shows variable pointer badges (head, tail, first, etc.) above each node.
 */
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildChain, findHeadAddress, getVarsAtAddress } from '../lib/memoryModel';

// Color scheme for well-known variable names
const VAR_BADGE_COLORS = {
    head: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    tail: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};
const DEFAULT_BADGE = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

function VarBadge({ name }) {
    const cls = VAR_BADGE_COLORS[name] ?? DEFAULT_BADGE;
    return (
        <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-mono font-semibold ${cls}`}
        >
            {name}
        </motion.span>
    );
}

function NodeCard({ address, node, isActive, index, varLabels }) {
    const isCycle = address.startsWith('CYCLE:');
    const realAddr = isCycle ? address.replace('CYCLE:', '') : address;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Variable pointer badges above the node */}
            <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                <AnimatePresence>
                    {varLabels.map(name => (
                        <VarBadge key={name} name={name} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Downward arrow from badge to node */}
            {varLabels.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-500 text-sm leading-none"
                >
                    ↓
                </motion.div>
            )}

            {/* Node card */}
            <motion.div
                layout
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.05 }}
                className={`relative flex-shrink-0 rounded-xl border-2 overflow-hidden
          ${isActive
                        ? 'border-yellow-400 node-card-active'
                        : 'border-indigo-500/60 node-card'
                    }`}
                style={{ minWidth: 120 }}
            >
                {/* Cycle badge */}
                {isCycle && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                        CYCLE ↩
                    </div>
                )}

                {/* Data section */}
                <div className="bg-indigo-950/80 px-5 py-3 text-center">
                    <div className="text-xs text-indigo-400 mb-1 font-mono">{realAddr}</div>
                    <div className="text-2xl font-bold text-white">{node?.data ?? '?'}</div>
                    <div className="text-xs text-slate-400 mt-1">data</div>
                </div>

                {/* Next pointer section */}
                <div className="bg-slate-900/80 px-5 py-2 text-center border-t border-indigo-800/40">
                    <div className="text-xs text-slate-500">next</div>
                    <div className="text-xs font-mono text-indigo-300 mt-0.5">
                        {node?.next ?? 'null'}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function LinkedListView({ state }) {
    const { heap, stack, lastModified } = state;
    const containerRef = useRef(null);
    const [nodeRects, setNodeRects] = useState({});

    // Find head and build chain
    const headAddr = findHeadAddress(state);
    const chain = headAddr ? buildChain(heap, headAddr) : [];

    // Measure node positions for arrow drawing
    useEffect(() => {
        if (!containerRef.current) return;
        const cards = containerRef.current.querySelectorAll('[data-addr]');
        const rects = {};
        cards.forEach(card => {
            const addr = card.getAttribute('data-addr');
            const rect = card.getBoundingClientRect();
            const parentRect = containerRef.current.getBoundingClientRect();
            rects[addr] = {
                left: rect.left - parentRect.left,
                top: rect.top - parentRect.top,
                width: rect.width,
                height: rect.height,
            };
        });
        setNodeRects(rects);
    });

    const isEmpty = chain.length === 0;

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Linked List
            </h2>

            <div
                ref={containerRef}
                className="flex-1 glass rounded-xl p-6 relative overflow-auto"
            >
                {isEmpty ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-600 text-sm">
                            No nodes yet — run the code to visualize
                        </p>
                    </div>
                ) : (
                    <>
                        {/* SVG arrows layer — drawn between node card centers */}
                        <svg
                            className="absolute inset-0 pointer-events-none"
                            style={{ width: '100%', height: '100%', overflow: 'visible' }}
                        >
                            <defs>
                                <marker
                                    id="arrowhead"
                                    markerWidth="8"
                                    markerHeight="6"
                                    refX="8"
                                    refY="3"
                                    orient="auto"
                                >
                                    <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
                                </marker>
                                <marker
                                    id="arrowhead-active"
                                    markerWidth="8"
                                    markerHeight="6"
                                    refX="8"
                                    refY="3"
                                    orient="auto"
                                >
                                    <polygon points="0 0, 8 3, 0 6" fill="#facc15" />
                                </marker>
                            </defs>

                            {chain.map((addr, i) => {
                                if (i >= chain.length - 1) return null;
                                const nextAddr = chain[i + 1];
                                if (nextAddr?.startsWith('CYCLE:')) return null;

                                const from = nodeRects[addr];
                                const to = nodeRects[nextAddr];
                                if (!from || !to) return null;

                                const x1 = from.left + from.width;
                                const y1 = from.top + from.height / 2;
                                const x2 = to.left;
                                const y2 = to.top + to.height / 2;
                                const isActiveLine = addr === lastModified || nextAddr === lastModified;

                                return (
                                    <motion.line
                                        key={`${addr}->${nextAddr}`}
                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke={isActiveLine ? '#facc15' : '#6366f1'}
                                        strokeWidth={isActiveLine ? 2.5 : 2}
                                        markerEnd={isActiveLine ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Node cards row — each wrapped in a column with badges above */}
                        <div className="flex items-end gap-10 relative z-10 flex-wrap pt-2">
                            <AnimatePresence>
                                {chain.map((addr, i) => {
                                    const isCycle = addr.startsWith('CYCLE:');
                                    const realAddr = isCycle ? addr.replace('CYCLE:', '') : addr;
                                    const varLabels = getVarsAtAddress(stack, realAddr);
                                    return (
                                        <div key={addr} data-addr={realAddr}>
                                            <NodeCard
                                                address={addr}
                                                node={heap[realAddr]}
                                                isActive={realAddr === lastModified}
                                                index={i}
                                                varLabels={varLabels}
                                            />
                                        </div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* null terminator */}
                            {chain.length > 0 && !chain[chain.length - 1]?.startsWith('CYCLE:') && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-slate-500 font-mono text-sm flex items-center gap-2 mb-1 self-center"
                                    style={{ marginTop: 'auto' }}
                                >
                                    <span className="text-indigo-500">→</span>
                                    <span className="border border-slate-700 rounded px-3 py-1 text-slate-400">
                                        null
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
