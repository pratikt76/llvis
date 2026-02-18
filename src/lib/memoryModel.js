/**
 * memoryModel.js
 * Pure functional memory state manager for the linked list visualizer.
 *
 * State shape:
 * {
 *   stack: { [varName]: address | null },
 *   heap:  { [address]: { data: number, next: address | null, id: string } },
 *   addressMap: { [varName]: address },   // maps var → address it was created with
 *   nextAddr: number,                      // counter for address generation
 * }
 */

import { STEP_TYPES } from './parser';

/** Generate a hex-style fake memory address */
function makeAddress(counter) {
    return `0x${(0x100 + counter).toString(16).toUpperCase()}`;
}

/** Initial empty state */
export function initialState() {
    return {
        stack: {},
        heap: {},
        addressMap: {},
        nextAddr: 0,
        lastModified: null, // address of last modified heap node (for highlight)
    };
}

/**
 * Apply a single step to the current state.
 * Returns a NEW state object (immutable update).
 * @param {object} state
 * @param {object} step
 * @returns {object} newState
 */
export function applyStep(state, step) {
    // Deep-clone state to keep immutability
    const s = {
        stack: { ...state.stack },
        heap: Object.fromEntries(
            Object.entries(state.heap).map(([addr, node]) => [addr, { ...node }])
        ),
        addressMap: { ...state.addressMap },
        nextAddr: state.nextAddr,
        lastModified: null,
    };

    switch (step.type) {
        case STEP_TYPES.CREATE_NODE: {
            const addr = makeAddress(s.nextAddr++);
            s.heap[addr] = { data: step.value, next: null, id: addr };
            s.stack[step.varName] = addr;
            s.addressMap[step.varName] = addr;
            s.lastModified = addr;
            break;
        }

        case STEP_TYPES.SET_NEXT: {
            const fromAddr = s.stack[step.varName];
            const toAddr = s.stack[step.targetVar];
            if (fromAddr && s.heap[fromAddr]) {
                s.heap[fromAddr] = { ...s.heap[fromAddr], next: toAddr ?? null };
                s.lastModified = fromAddr;
            }
            break;
        }

        case STEP_TYPES.SET_NULL: {
            const addr = s.stack[step.varName];
            if (addr && s.heap[addr]) {
                s.heap[addr] = { ...s.heap[addr], next: null };
                s.lastModified = addr;
            }
            break;
        }

        case STEP_TYPES.ASSIGN_VAR: {
            const srcAddr = s.stack[step.sourceVar];
            s.stack[step.varName] = srcAddr ?? null;
            // Don't create a new heap entry — just point to the same one
            s.lastModified = srcAddr ?? null;
            break;
        }

        default:
            break;
    }

    return s;
}

/**
 * Replay all steps from 0..stepIndex to produce the state at that point.
 * @param {Array} steps
 * @param {number} stepIndex  (-1 = initial state)
 * @returns {object} state
 */
export function replaySteps(steps, stepIndex) {
    let state = initialState();
    for (let i = 0; i <= stepIndex && i < steps.length; i++) {
        state = applyStep(state, steps[i]);
    }
    return state;
}

/**
 * Build an ordered linked list chain starting from a given address.
 * Returns an array of addresses in order, stopping at null or on cycle detection.
 * @param {object} heap
 * @param {string} startAddr
 * @returns {string[]}
 */
export function buildChain(heap, startAddr) {
    const visited = new Set();
    const chain = [];
    let cur = startAddr;
    while (cur && heap[cur] && !visited.has(cur)) {
        visited.add(cur);
        chain.push(cur);
        cur = heap[cur].next;
    }
    if (cur && visited.has(cur)) {
        // Cycle detected — mark it
        chain.push(`CYCLE:${cur}`);
    }
    return chain;
}

/**
 * Find the "head" variable — the stack variable whose address is not
 * pointed to by any other stack variable's heap node's next pointer.
 * Falls back to the first stack variable if none found.
 * @param {object} state
 * @returns {string|null} address of head node
 */
export function findHeadAddress(state) {
    const { stack, heap } = state;
    const allAddresses = Object.values(stack).filter(Boolean);
    if (allAddresses.length === 0) return null;

    // Collect all "next" addresses in the heap
    const nextAddresses = new Set(
        Object.values(heap).map(n => n.next).filter(Boolean)
    );

    // Head = an address in stack that is NOT pointed to by any next
    const heads = allAddresses.filter(addr => !nextAddresses.has(addr));

    // Deduplicate (multiple stack vars can point to same address)
    const uniqueHeads = [...new Set(heads)];
    return uniqueHeads[0] ?? allAddresses[0];
}

/**
 * Get all stack variable names that point to a given address.
 * Used to render head/tail/first/sec labels on node cards.
 * @param {object} stack  — { varName: address }
 * @param {string} address
 * @returns {string[]}    — e.g. ['head', 'first']
 */
export function getVarsAtAddress(stack, address) {
    return Object.entries(stack)
        .filter(([, addr]) => addr === address)
        .map(([name]) => name);
}

