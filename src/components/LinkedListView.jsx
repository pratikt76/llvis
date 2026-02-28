/**
 * LinkedListView.jsx
 * Renders the linked list as animated node cards with SVG arrows.
 */
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildChain, findHeadAddress, getVarsAtAddress } from '../lib/memoryModel';

function VarBadge({ name }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-1 border border-[#333] rounded-full px-2 py-0.5 text-xs font-mono text-neutral-400 bg-[#1a1a1a]"
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
            {/* Variable pointer badges */}
            <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                <AnimatePresence>
                    {varLabels.map(name => (
                        <VarBadge key={name} name={name} />
                    ))}
                </AnimatePresence>
            </div>

            {varLabels.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 text-sm leading-none"
                >
                    ↓
                </motion.div>
            )}

            {/* Node card */}
            <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.05 }}
                className={`relative flex-shrink-0 rounded-lg border overflow-hidden
          ${isActive ? 'border-neutral-500' : 'border-[#333]'}`}
                style={{ minWidth: 110 }}
            >
                {/* Cycle badge */}
                {isCycle && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-neutral-600 text-white text-xs px-2 py-0.5 rounded-full z-10">
                        CYCLE ↩
                    </div>
                )}

                {/* Data section */}
                <div className="bg-[#1a1a1a] px-5 py-3 text-center">
                    <div className="text-xs text-neutral-500 mb-1 font-mono">{realAddr}</div>
                    <div className="text-xl font-semibold text-neutral-100">{node?.data ?? '?'}</div>
                    <div className="text-xs text-neutral-600 mt-1">data</div>
                </div>

                {/* Next pointer section */}
                <div className="bg-[#151515] px-5 py-2 text-center border-t border-[#222]">
                    <div className="text-xs text-neutral-600">next</div>
                    <div className="text-xs font-mono text-neutral-400 mt-0.5">
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

    const headAddr = findHeadAddress(state);
    const chain = headAddr ? buildChain(heap, headAddr) : [];

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
            <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Linked List
            </h2>

            <div
                ref={containerRef}
                className="flex-1 panel rounded-lg p-5 relative overflow-auto"
            >
                {isEmpty ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-600 text-sm">
                            No nodes yet
                        </p>
                    </div>
                ) : (
                    <>
                        {/* SVG arrows */}
                        <svg
                            className="absolute inset-0 pointer-events-none"
                            style={{ width: '100%', height: '100%', overflow: 'visible' }}
                        >
                            <defs>
                                <marker
                                    id="arrowhead"
                                    markerWidth="7"
                                    markerHeight="5"
                                    refX="7"
                                    refY="2.5"
                                    orient="auto"
                                >
                                    <polygon points="0 0, 7 2.5, 0 5" fill="#555" />
                                </marker>
                                <marker
                                    id="arrowhead-active"
                                    markerWidth="7"
                                    markerHeight="5"
                                    refX="7"
                                    refY="2.5"
                                    orient="auto"
                                >
                                    <polygon points="0 0, 7 2.5, 0 5" fill="#888" />
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
                                        stroke={isActiveLine ? '#888' : '#444'}
                                        strokeWidth={1.5}
                                        markerEnd={isActiveLine ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Node cards */}
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
                                    className="text-neutral-600 font-mono text-sm flex items-center gap-2 mb-1 self-center"
                                    style={{ marginTop: 'auto' }}
                                >
                                    <span className="text-neutral-500">→</span>
                                    <span className="border border-[#333] border-dashed rounded px-3 py-1 text-neutral-500 text-xs">
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
