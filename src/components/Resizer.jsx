/**
 * Resizer.jsx
 * A draggable divider handle for resizing adjacent panels.
 * Supports both horizontal (left-right) and vertical (top-bottom) splits.
 */
import React, { useCallback, useRef, useEffect } from 'react';

export default function Resizer({ direction = 'horizontal', onResize }) {
    const isHorizontal = direction === 'horizontal';
    const dragging = useRef(false);

    const onMouseDown = useCallback((e) => {
        e.preventDefault();
        dragging.current = true;
        document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    }, [isHorizontal]);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            onResize(isHorizontal ? e.clientX : e.clientY);
        };
        const onMouseUp = () => {
            if (!dragging.current) return;
            dragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onResize, isHorizontal]);

    return (
        <div
            onMouseDown={onMouseDown}
            className={`flex-shrink-0 group relative z-30 ${isHorizontal
                    ? 'w-2 cursor-col-resize hover:bg-indigo-500/30 active:bg-indigo-500/50'
                    : 'h-2 cursor-row-resize hover:bg-indigo-500/30 active:bg-indigo-500/50'
                } transition-colors rounded-full`}
        >
            {/* Visual indicator line */}
            <div
                className={`absolute rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors ${isHorizontal
                        ? 'w-0.5 h-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        : 'h-0.5 w-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                    }`}
            />
        </div>
    );
}
