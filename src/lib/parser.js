/**
 * parser.js
 * Parses simplified Java linked list code into an ordered array of steps.
 *
 * Supported syntax:
 *   Node varName = new Node(value);
 *   varName.next = otherVar;
 *   varName.next = null;
 *   varName = otherVar;
 */

// Step types
export const STEP_TYPES = {
    CREATE_NODE: 'CREATE_NODE',   // Node x = new Node(val)
    SET_NEXT: 'SET_NEXT',         // x.next = y
    SET_NULL: 'SET_NULL',         // x.next = null
    ASSIGN_VAR: 'ASSIGN_VAR',     // x = y  (reference copy)
    COMMENT: 'COMMENT',           // blank / comment line (skip)
};

/**
 * Parse Java code string into an array of step objects.
 * @param {string} code
 * @returns {{ steps: Array, errors: Array }}
 */
export function parseCode(code) {
    const lines = code.split('\n');
    const steps = [];
    const errors = [];

    // Regex patterns for lines to SKIP (Java boilerplate, not linked list logic)
    const SKIP_PATTERNS = [
        /^\s*(\/\/.*)?$/,                                 // blank or comment
        /^\s*\{?\s*\}?\s*$/,                              // lone braces {} or { or }
        /^\s*class\s+\w+/,                                // class Node { ... class Main {
        /^\s*(public|private|protected)\s+(static\s+)?/,  // public static void main(...)
        /^\s*(int|String|Node|void|boolean)\s+\w+\s*;/,  // field declarations: int data; Node next;
        /^\s*\w+\s*\(\s*(int|String|Node)\s+\w+\s*\)/,   // constructor signature: Node(int data)
        /^\s*this\.\w+\s*=/,                              // this.data = data; this.next = null;
        /^\s*return\b/,                                   // return statements
        /^\s*\}\s*$/,                                     // closing brace
        /^\s*\{\s*$/,                                     // opening brace
        /^\s*import\s+/,                                  // import statements
        /^\s*package\s+/,                                 // package declarations
    ];

    lines.forEach((line, index) => {
        const lineNum = index; // 0-indexed

        // Skip boilerplate / blank / comment lines
        if (SKIP_PATTERNS.some(re => re.test(line))) {
            return;
        }

        // Regex patterns for linked list operations
        const RE_CREATE = /^\s*Node\s+(\w+)\s*=\s*new\s+Node\s*\(\s*(-?\d+)\s*\)\s*;?\s*$/;
        const RE_SET_NULL = /^\s*(\w+)\.next\s*=\s*null\s*;?\s*$/;
        const RE_SET_NEXT = /^\s*(\w+)\.next\s*=\s*(\w+)\s*;?\s*$/;
        const RE_ASSIGN = /^\s*Node\s+(\w+)\s*=\s*(\w+)\s*;?\s*$/;
        const RE_REASSIGN = /^\s*(\w+)\s*=\s*(\w+)\s*;?\s*$/;

        let match;

        // Node x = new Node(val);
        if ((match = RE_CREATE.exec(line))) {
            steps.push({
                type: STEP_TYPES.CREATE_NODE,
                lineIndex: lineNum,
                varName: match[1],
                value: parseInt(match[2], 10),
                description: `Create Node(${match[2]}) → assign to \`${match[1]}\``,
            });
            return;
        }

        // x.next = null;
        if ((match = RE_SET_NULL.exec(line))) {
            steps.push({
                type: STEP_TYPES.SET_NULL,
                lineIndex: lineNum,
                varName: match[1],
                description: `Set \`${match[1]}.next\` = null`,
            });
            return;
        }

        // x.next = y;
        if ((match = RE_SET_NEXT.exec(line))) {
            steps.push({
                type: STEP_TYPES.SET_NEXT,
                lineIndex: lineNum,
                varName: match[1],
                targetVar: match[2],
                description: `Link \`${match[1]}.next\` → \`${match[2]}\``,
            });
            return;
        }

        // Node x = y;  (declare + assign reference)
        if ((match = RE_ASSIGN.exec(line))) {
            steps.push({
                type: STEP_TYPES.ASSIGN_VAR,
                lineIndex: lineNum,
                varName: match[1],
                sourceVar: match[2],
                description: `Declare \`${match[1]}\` → points to same node as \`${match[2]}\``,
            });
            return;
        }

        // x = y;  (reassign existing variable)
        if ((match = RE_REASSIGN.exec(line))) {
            steps.push({
                type: STEP_TYPES.ASSIGN_VAR,
                lineIndex: lineNum,
                varName: match[1],
                sourceVar: match[2],
                description: `Reassign \`${match[1]}\` → points to same node as \`${match[2]}\``,
            });
            return;
        }

        // Unrecognized line
        errors.push({ lineIndex: lineNum, message: `Unrecognized syntax: "${line.trim()}"` });
    });

    return { steps, errors };
}
