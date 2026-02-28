/**
 * CodePanel.jsx
 * Code editor with Java syntax highlighting and auto-indentation.
 */
import React, { useRef, useEffect, useCallback } from 'react';
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

// ── Muted token colors ──────────────────────────────────────────────────
const COLORS = {
    keyword: '#7c8baa',
    type: '#9f8ec2',
    number: '#c9a06c',
    string: '#7dab8f',
    comment: '#555',
    method: '#8aabcc',
    property: '#b89aaf',
    punct: '#666',
    op: '#555',
    text: '#bbb',
};

const KEYWORDS = new Set([
    'class', 'public', 'private', 'protected', 'static', 'void', 'new',
    'return', 'if', 'else', 'for', 'while', 'boolean', 'true', 'false',
    'import', 'package', 'extends', 'implements', 'throws', 'throw',
]);

const TYPES = new Set(['int', 'String', 'Node', 'null', 'this', 'args']);

function tokenizeLine(line) {
    if (/^\s*\/\//.test(line)) {
        return [{ text: line, color: COLORS.comment, italic: true }];
    }

    const tokens = [];
    let i = 0;

    while (i < line.length) {
        const ch = line[i];

        if (/\s/.test(ch)) {
            let j = i;
            while (j < line.length && /\s/.test(line[j])) j++;
            tokens.push({ text: line.slice(i, j), color: COLORS.text });
            i = j;
            continue;
        }

        if (ch === '/' && line[i + 1] === '/') {
            tokens.push({ text: line.slice(i), color: COLORS.comment, italic: true });
            break;
        }

        if (ch === '"') {
            let j = i + 1;
            while (j < line.length && line[j] !== '"') j++;
            j++;
            tokens.push({ text: line.slice(i, j), color: COLORS.string });
            i = j;
            continue;
        }

        if (/\d/.test(ch) || (ch === '-' && /\d/.test(line[i + 1] || ''))) {
            let j = i;
            if (ch === '-') j++;
            while (j < line.length && /\d/.test(line[j])) j++;
            tokens.push({ text: line.slice(i, j), color: COLORS.number });
            i = j;
            continue;
        }

        if (/[a-zA-Z_$]/.test(ch)) {
            let j = i;
            while (j < line.length && /[\w$]/.test(line[j])) j++;
            const word = line.slice(i, j);

            const prevToken = tokens[tokens.length - 1];
            const isDotAccess = prevToken && prevToken.text === '.';

            let k = j;
            while (k < line.length && line[k] === ' ') k++;
            const isMethodCall = line[k] === '(';

            let color = COLORS.text;
            let bold = false;

            if (isDotAccess) {
                color = COLORS.property;
            } else if (TYPES.has(word)) {
                color = COLORS.type;
                bold = true;
            } else if (KEYWORDS.has(word)) {
                color = COLORS.keyword;
            } else if (isMethodCall) {
                color = COLORS.method;
            }

            tokens.push({ text: word, color, bold });
            i = j;
            continue;
        }

        if (ch === '.') {
            tokens.push({ text: '.', color: COLORS.op });
            i++;
            continue;
        }

        if ('{}()[]'.includes(ch)) {
            tokens.push({ text: ch, color: COLORS.punct });
            i++;
            continue;
        }

        if ('=;+-*/<>!&|'.includes(ch)) {
            tokens.push({ text: ch, color: COLORS.op });
            i++;
            continue;
        }

        tokens.push({ text: ch, color: COLORS.text });
        i++;
    }

    return tokens;
}

function HighlightedLine({ line }) {
    const tokens = tokenizeLine(line);
    return (
        <>
            {tokens.map((tok, i) => (
                <span
                    key={i}
                    style={{
                        color: tok.color,
                        fontWeight: tok.bold ? 600 : undefined,
                        fontStyle: tok.italic ? 'italic' : undefined,
                    }}
                >
                    {tok.text}
                </span>
            ))}
        </>
    );
}

// ── Component ────────────────────────────────────────────────────────────
export default function CodePanel({ code, onCodeChange, activeLineIndex }) {
    const textareaRef = useRef(null);
    const overlayRef = useRef(null);
    const gutterRef = useRef(null);
    const lines = code.split('\n');

    const handleScroll = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        if (overlayRef.current) {
            overlayRef.current.scrollTop = ta.scrollTop;
            overlayRef.current.scrollLeft = ta.scrollLeft;
        }
        if (gutterRef.current) {
            gutterRef.current.scrollTop = ta.scrollTop;
        }
    }, []);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.addEventListener('scroll', handleScroll);
        return () => ta.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleKeyDown = useCallback((e) => {
        const ta = e.target;
        const { selectionStart, selectionEnd, value } = ta;

        if (e.key === 'Tab') {
            e.preventDefault();
            const spaces = '    ';
            const newVal = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd);
            onCodeChange(newVal);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = selectionStart + 4;
            });
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const before = value.substring(0, selectionStart);
            const currentLineStart = before.lastIndexOf('\n') + 1;
            const currentLine = before.substring(currentLineStart);
            const indent = currentLine.match(/^\s*/)[0];
            const trimmed = currentLine.trimEnd();
            const extraIndent = trimmed.endsWith('{') ? '    ' : '';
            const insertion = '\n' + indent + extraIndent;
            const newVal = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
            onCodeChange(newVal);
            requestAnimationFrame(() => {
                const newPos = selectionStart + insertion.length;
                ta.selectionStart = ta.selectionEnd = newPos;
            });
        }
    }, [onCodeChange]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Code
                </h2>
            </div>

            <div
                className="flex-1 flex rounded-lg panel overflow-hidden min-h-0"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: 13, lineHeight: '22px' }}
            >
                {/* Line number gutter */}
                <div
                    ref={gutterRef}
                    className="flex-shrink-0 overflow-hidden select-none bg-[#111] border-r border-[#222]"
                    style={{ width: 38, paddingTop: 4 }}
                    aria-hidden="true"
                >
                    {lines.map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-end pr-2 transition-colors duration-100 ${i === activeLineIndex
                                ? 'text-neutral-300 font-medium'
                                : 'text-neutral-600'
                                }`}
                            style={{ height: 22, fontSize: 11 }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Code area */}
                <div className="relative flex-1 min-w-0 overflow-hidden">
                    {/* Active line highlight */}
                    <AnimatePresence>
                        {activeLineIndex >= 0 && (
                            <motion.div
                                key={activeLineIndex}
                                className="absolute left-0 right-0 pointer-events-none"
                                style={{
                                    top: activeLineIndex * 22 + 4,
                                    height: 22,
                                    background: 'rgba(255,255,255,0.03)',
                                    borderLeft: '2px solid #555',
                                    zIndex: 5,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Syntax-highlighted overlay */}
                    <div
                        ref={overlayRef}
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                        style={{ padding: '4px 8px 4px 12px', zIndex: 1, whiteSpace: 'pre' }}
                        aria-hidden="true"
                    >
                        {lines.map((line, i) => (
                            <div key={i} style={{ height: 22 }}>
                                <HighlightedLine line={line} />
                            </div>
                        ))}
                    </div>

                    {/* Transparent textarea */}
                    <textarea
                        ref={textareaRef}
                        className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none"
                        style={{
                            padding: '4px 8px 4px 12px',
                            lineHeight: '22px',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto',
                            color: 'transparent',
                            caretColor: '#888',
                            zIndex: 10,
                        }}
                        value={code}
                        onChange={e => onCodeChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        placeholder="Write your Java linked list code here..."
                    />
                </div>
            </div>
        </div>
    );
}

export { SAMPLE_CODE };
