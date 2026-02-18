/**
 * App.jsx
 * Main orchestrator for the Linked List Visualizer.
 *
 * State:
 *   code         — the Java code string in the editor
 *   steps        — parsed step array
 *   errors       — parse errors
 *   currentStep  — index of the last applied step (-1 = initial)
 *   isPlaying    — auto-play mode
 *   speed        — ms between steps during auto-play
 *
 * Memory state is derived by replaying steps[0..currentStep] on every render.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

import CodePanel, { SAMPLE_CODE } from './components/CodePanel';
import LinkedListView from './components/LinkedListView';
import StackPanel from './components/StackPanel';
import HeapPanel from './components/HeapPanel';
import Controls from './components/Controls';
import StepInfo from './components/StepInfo';
import Resizer from './components/Resizer';

import { parseCode } from './lib/parser';
import { replaySteps, initialState } from './lib/memoryModel';

export default function App() {
  // ── Code & parse state ────────────────────────────────────────────────────
  const [code, setCode] = useState(SAMPLE_CODE);
  const [steps, setSteps] = useState([]);
  const [errors, setErrors] = useState([]);

  // ── Playback state ────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(-1); // -1 = before first step
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // ms between steps

  const timerRef = useRef(null);

  // ── Derived memory state ──────────────────────────────────────────────────
  const memState =
    currentStep >= 0
      ? replaySteps(steps, currentStep)
      : initialState();

  const activeStep = steps[currentStep] ?? null;
  const activeLineIndex = activeStep?.lineIndex ?? -1;

  // ── Parse code and show full result live ────────────────────────────────
  const parseAndShow = useCallback((newCode) => {
    const { steps: parsed, errors: errs } = parseCode(newCode);
    setSteps(parsed);
    setErrors(errs);
    // Auto-apply ALL steps so visualization shows immediately
    setCurrentStep(parsed.length > 0 ? parsed.length - 1 : -1);
    setIsPlaying(false);
  }, []);

  // Parse on mount with sample code
  useEffect(() => {
    parseAndShow(SAMPLE_CODE);
  }, []); // eslint-disable-line

  // ── Auto-play timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsPlaying(false);
          clearInterval(timerRef.current);
          return prev;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, steps.length]);

  // ── Control handlers ──────────────────────────────────────────────────────
  const handleRun = () => {
    if (steps.length === 0) return;
    // Reset to beginning and auto-play from step 0
    setCurrentStep(-1);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    parseAndShow(newCode);
  };

  // ── Resizable panel sizes ──────────────────────────────────────────────
  const [leftPct, setLeftPct] = useState(50);       // % width for left column
  const [vizPct, setVizPct] = useState(55);          // % height for visualizer (vs memory)
  const [stackPct, setStackPct] = useState(50);      // % width for stack (vs heap)

  const mainRef = useRef(null);
  const rightRef = useRef(null);
  const memRef = useRef(null);

  const handleLeftResize = useCallback((clientX) => {
    const main = mainRef.current;
    if (!main) return;
    const rect = main.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.max(25, Math.min(75, pct)));
  }, []);

  const handleVizResize = useCallback((clientY) => {
    const right = rightRef.current;
    if (!right) return;
    const rect = right.getBoundingClientRect();
    const pct = ((clientY - rect.top) / rect.height) * 100;
    setVizPct(Math.max(20, Math.min(80, pct)));
  }, []);

  const handleStackResize = useCallback((clientX) => {
    const mem = memRef.current;
    if (!mem) return;
    const rect = mem.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setStackPct(Math.max(20, Math.min(80, pct)));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600
                          flex items-center justify-center text-white font-bold text-sm shadow-lg
                          shadow-indigo-500/30">
            LL
          </div>
          <div>
            <h1 className="font-bold text-base gradient-text leading-tight">
              Linked List Visualizer
            </h1>
            <p className="text-xs text-slate-500">Java Memory &amp; Pointer Animator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive
        </div>
      </header>

      {/* ── Main layout ── */}
      <main ref={mainRef} className="flex-1 flex flex-row p-3 gap-0 overflow-hidden min-h-0">

        {/* ═══ LEFT COLUMN: Code + Controls + StepInfo ═══ */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden" style={{ width: `${leftPct}%` }}>
          {/* Code panel */}
          <div className="flex-1 min-h-0">
            <CodePanel
              code={code}
              onCodeChange={handleCodeChange}
              activeLineIndex={activeLineIndex}
            />
          </div>

          {/* Controls */}
          <Controls
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={steps.length}
            speed={speed}
            onRun={handleRun}
            onStep={handleStep}
            onPause={handlePause}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            hasSteps={steps.length > 0}
          />

          {/* Step info */}
          <StepInfo
            step={activeStep}
            stepIndex={currentStep}
            totalSteps={steps.length}
            errors={errors}
          />
        </div>

        {/* ─── Horizontal resizer: Code ↔ Visualizer ─── */}
        <Resizer direction="horizontal" onResize={handleLeftResize} />

        {/* ═══ RIGHT COLUMN: Linked List + Memory ═══ */}
        <div ref={rightRef} className="flex-1 flex flex-col gap-0 min-w-0 min-h-0 overflow-hidden">

          {/* Linked list visualization */}
          <div className="min-h-0 overflow-hidden" style={{ height: `${vizPct}%` }}>
            <LinkedListView state={memState} />
          </div>

          {/* ─── Vertical resizer: Visualizer ↔ Memory ─── */}
          <Resizer direction="vertical" onResize={handleVizResize} />

          {/* Stack + Heap side by side */}
          <div ref={memRef} className="flex-1 flex flex-row gap-0 min-h-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden" style={{ width: `${stackPct}%` }}>
              <StackPanel stack={memState.stack} />
            </div>

            {/* ─── Horizontal resizer: Stack ↔ Heap ─── */}
            <Resizer direction="horizontal" onResize={handleStackResize} />

            <div className="flex-1 min-w-0 overflow-hidden">
              <HeapPanel heap={memState.heap} lastModified={memState.lastModified} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 px-4 py-1 text-center text-xs text-slate-600 flex-shrink-0">
        Linked List Visualizer · Stack{' '}
        <span className="text-blue-500">■</span> Heap{' '}
        <span className="text-purple-500">■</span> Active{' '}
        <span className="text-yellow-500">■</span>
      </footer>
    </div>
  );
}
