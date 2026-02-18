/**
 * CodePanel.jsx
 * Displays the Java code with line-by-line highlighting.
 * The editor is ALWAYS editable — users can write their own code at any time.
 * Active line is shown via a highlighted line number in the gutter.
 */
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_CODE = `// Node class definition
class Node {
    int data;
    Node next;
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

// Main class
class Main {
    public static void main(String[] args) {

        // Create nodes
        Node first = new Node(10);
        Node sec = new Node(20);
        Node thir = new Node(30);

        // Link nodes
        first.next = sec;
        sec.next = thir;

        // Head and tail pointers
        Node head = first;
        Node tail = thir;

    }
}`;

export default function CodePanel({ code, onCodeChange, activeLineIndex }) {
    const lines = code.split('\n');
    const textareaRef = useRef(null);
    const gutterRef = useRef(null);

    // Sync gutter scroll with textarea scroll
    useEffect(() => {
        const ta = textareaRef.current;
        const gutter = gutterRef.current;
        if (!ta || !gutter) return;
        const onScroll = () => { gutter.scrollTop = ta.scrollTop; };
        ta.addEventListener('scroll', onScroll);
        return () => ta.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                    Java Code
                </h2>
                <span className="text-xs text-slate-500">Always editable</span>
            </div>

            {/* Editor: gutter + textarea side by side */}
            <div className="flex-1 flex rounded-xl glass overflow-hidden font-mono text-sm leading-7 min-h-0">

                {/* Line number gutter */}
                <div
                    ref={gutterRef}
                    className="flex-shrink-0 overflow-hidden select-none bg-slate-900/60 border-r border-slate-800/60"
                    style={{ width: 44 }}
                    aria-hidden="true"
                >
                    {lines.map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-end pr-3 transition-colors duration-150 ${i === activeLineIndex
                                    ? 'bg-yellow-400/15 text-yellow-400 font-bold'
                                    : 'text-slate-600'
                                }`}
                            style={{ height: 28 }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Active line highlight overlay (sits behind textarea via pointer-events-none) */}
                <div className="relative flex-1 min-w-0">
                    {/* Highlight stripe */}
                    <AnimatePresence>
                        {activeLineIndex >= 0 && (
                            <motion.div
                                key={activeLineIndex}
                                className="absolute left-0 right-0 bg-yellow-400/10 border-l-2 border-yellow-400/60 pointer-events-none z-10"
                                style={{ top: activeLineIndex * 28, height: 28 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            />
                        )}
                    </AnimatePresence>

                    {/* The actual editable textarea — always writable */}
                    <textarea
                        ref={textareaRef}
                        className="absolute inset-0 w-full h-full bg-transparent text-slate-200 p-0 pl-4
                                   resize-none outline-none caret-indigo-400 z-20
                                   placeholder-slate-600"
                        style={{ lineHeight: '28px', paddingTop: 0, paddingBottom: 0 }}
                        value={code}
                        onChange={e => onCodeChange(e.target.value)}
                        spellCheck={false}
                        placeholder="Write your Java linked list code here..."
                    />
                </div>
            </div>
        </div>
    );
}

export { SAMPLE_CODE };
