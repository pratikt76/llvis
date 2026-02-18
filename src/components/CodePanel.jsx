/**
 * CodePanel.jsx
 * Code editor with Java syntax highlighting and auto-indentation.
 *
 * Uses a tokenizer to split each line into typed tokens, then renders
 * each token as a colored React <span>. A transparent textarea sits on top
 * to capture user input. Both share the same font/size/scroll.
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

// ── Token types and colors ───────────────────────────────────────────────
const COLORS = {
    keyword: '#818cf8', // indigo
    type: '#c084fc', // purple
    number: '#f59e0b', // amber
    string: '#34d399', // emerald
    comment: '#6b7280', // gray
    method: '#60a5fa', // blue
    property: '#f472b6', // pink
    punct: '#94a3b8', // slate
    op: '#64748b', // dim slate
    text: '#e2e8f0', // default
};

const KEYWORDS = new Set([
    'class', 'public', 'private', 'protected', 'static', 'void', 'new',
    'return', 'if', 'else', 'for', 'while', 'boolean', 'true', 'false',
    'import', 'package', 'extends', 'implements', 'throws', 'throw',
]);

const TYPES = new Set(['int', 'String', 'Node', 'null', 'this', 'args']);

/**
 * Tokenize a single line of Java code into an array of { text, color } objects.
 * This avoids HTML corruption by never doing regex-on-HTML.
 */
function tokenizeLine(line) {
    // Full-line comment
    if (/^\s*\/\//.test(line)) {
        return [{ text: line, color: COLORS.comment, italic: true }];
    }

    const tokens = [];
    let i = 0;

    while (i < line.length) {
        const ch = line[i];

        // Whitespace
        if (/\s/.test(ch)) {
            let j = i;
            while (j < line.length && /\s/.test(line[j])) j++;
            tokens.push({ text: line.slice(i, j), color: COLORS.text });
            i = j;
            continue;
        }

        // Inline comment //
        if (ch === '/' && line[i + 1] === '/') {
            tokens.push({ text: line.slice(i), color: COLORS.comment, italic: true });
            break;
        }

        // String literal "..."
        if (ch === '"') {
            let j = i + 1;
            while (j < line.length && line[j] !== '"') j++;
            j++; // include closing quote
            tokens.push({ text: line.slice(i, j), color: COLORS.string });
            i = j;
            continue;
        }

        // Numbers
        if (/\d/.test(ch) || (ch === '-' && /\d/.test(line[i + 1] || ''))) {
            let j = i;
            if (ch === '-') j++;
            while (j < line.length && /\d/.test(line[j])) j++;
            tokens.push({ text: line.slice(i, j), color: COLORS.number });
            i = j;
            continue;
        }

        // Identifiers / keywords
        if (/[a-zA-Z_$]/.test(ch)) {
            let j = i;
            while (j < line.length && /[\w$]/.test(line[j])) j++;
            const word = line.slice(i, j);

            // Check if preceded by a dot → property
            const prevToken = tokens[tokens.length - 1];
            const isDotAccess = prevToken && prevToken.text === '.';

            // Check if followed by ( → method call
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

        // Dot
        if (ch === '.') {
            tokens.push({ text: '.', color: COLORS.op });
            i++;
            continue;
        }

        // Brackets / parens / braces
        if ('{}()[]'.includes(ch)) {
            tokens.push({ text: ch, color: COLORS.punct });
            i++;
            continue;
        }

        // Operators and semicolons
        if ('=;+-*/<>!&|'.includes(ch)) {
            tokens.push({ text: ch, color: COLORS.op });
            i++;
            continue;
        }

        // Anything else
        tokens.push({ text: ch, color: COLORS.text });
        i++;
    }

    return tokens;
}

/** Render a tokenized line as colored React spans */
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

    // Sync scroll between textarea, overlay, and gutter
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

    // Handle Tab key (insert 4 spaces) and Enter key (auto-indent)
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
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                    Java Code
                </h2>
                <span className="text-xs text-slate-500">Live preview</span>
            </div>

            {/* Editor container */}
            <div
                className="flex-1 flex rounded-xl glass overflow-hidden min-h-0"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: 13, lineHeight: '22px' }}
            >

                {/* Line number gutter */}
                <div
                    ref={gutterRef}
                    className="flex-shrink-0 overflow-hidden select-none bg-slate-900/60 border-r border-slate-700/40"
                    style={{ width: 38, paddingTop: 4 }}
                    aria-hidden="true"
                >
                    {lines.map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-end pr-2 transition-colors duration-100 ${i === activeLineIndex
                                    ? 'text-yellow-400 font-bold'
                                    : 'text-slate-600'
                                }`}
                            style={{ height: 22, fontSize: 11 }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Code area: highlighted overlay + transparent textarea stacked */}
                <div className="relative flex-1 min-w-0 overflow-hidden">

                    {/* Active line highlight stripe */}
                    <AnimatePresence>
                        {activeLineIndex >= 0 && (
                            <motion.div
                                key={activeLineIndex}
                                className="absolute left-0 right-0 pointer-events-none"
                                style={{
                                    top: activeLineIndex * 22 + 4,
                                    height: 22,
                                    background: 'rgba(250,204,21,0.06)',
                                    borderLeft: '2px solid rgba(250,204,21,0.4)',
                                    zIndex: 5,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Syntax-highlighted overlay — colored React spans, NOT dangerouslySetInnerHTML */}
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

                    {/* Transparent textarea on top — captures all input */}
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
                            caretColor: '#818cf8',
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
