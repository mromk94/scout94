# Scout94 Accountability Protocol

## Core Principle: Root Cause First, Always

This protocol ensures every Scout94 agent follows the same rigorous problem-solving methodology demonstrated by the user.

---

## Mandatory Pre-Solution Checklist

Before proposing ANY solution, ALL agents MUST complete:

### ✅ 1. Root Cause Analysis
**Required:**
- Identify WHY the problem exists, not just WHAT is broken
- Trace back to the source
- Document the actual cause vs. the symptoms

**Example:**
- ❌ SYMPTOM: "Line numbers look wrong"
- ✅ ROOT CAUSE: "Forcing display: grid on SyntaxHighlighter breaks its internal rendering"

---

### ✅ 2. Investigation Evidence
**Required:**
- List files that were read
- Show data that was checked
- Document assumptions that were verified

**Cannot propose solutions without showing:**
```javascript
investigationSteps: [
  'Read file: /path/to/component.jsx',
  'Checked library documentation for proper usage',
  'Verified current implementation vs. library requirements',
  'Identified conflict: custom layout vs. library layout'
]
```

---

### ✅ 3. Holistic Context
**Required:**
- How does this component fit in the larger system?
- What upstream dependencies exist?
- What downstream effects will changes have?
- Are there related issues from the same root cause?

---

### ✅ 4. Symptom vs. Cause Validation
**Ask:**
- Am I fixing the ROOT CAUSE or treating a SYMPTOM?
- Example: Changing CSS is treating a symptom if the real issue is wrong data

**Red Flags:**
- "Let's adjust the styling" when the issue is logic
- "Let's add a workaround" instead of fixing the source
- "Let's force this to work" instead of using it properly

---

### ✅ 5. Library Respect Check
**Ask:**
- Am I fighting the library or using it properly?
- Does this library have native capabilities I should use?
- Am I forcing my own implementation when library provides it?

**Examples of Fighting the Library:**
- ❌ Forcing `display: grid` on SyntaxHighlighter
- ❌ Overriding internal rendering
- ✅ Using `lineNumberContainerStyle` (library's native prop)
- ✅ Using `wrapLines` prop instead of custom wrapping

---

## Validation Gates

Every solution MUST pass these gates before execution:

```javascript
const validationGates = {
  rootCauseIdentified: true,     // Did we find the actual cause?
  investigationComplete: true,   // Do we have evidence?
  contextConsidered: true,       // Did we think holistically?
  symptomVsCause: 'cause',       // Are we fixing cause, not symptom?
  libraryRespected: true,        // Are we using library properly?
  solutionValidated: true        // Will this actually work?
};
```

If ANY gate fails, **STOP** and investigate further.

---

## Real Example: Line Numbering Issue

### ❌ Band-Aid Approach (What NOT to Do):
1. See line numbers look wrong
2. Try `display: grid` → doesn't work
3. Try different padding → doesn't work
4. Try custom wrapper → doesn't work
5. Keep trying different CSS...

**Problem:** Treating symptoms, not investigating root cause

---

### ✅ Root Cause Approach (What TO Do):

**Step 1: STOP and Investigate**
```
Question: What is actually broken?
Answer: Line numbers showing incorrectly with wrapped text

Question: WHY is this happening?
Investigation: 
- Read SyntaxHighlighter documentation
- Check current implementation
- Identify: Forcing display: grid breaks library's internal layout
- Identify: wrapLines was set to false
```

**Step 2: Root Cause Identified**
```
ROOT CAUSE: 
1. Forcing custom layout (display: grid) on library component
2. Fighting library instead of using its native capabilities
3. wrapLines={false} disabled wrapping
```

**Step 3: Proper Solution**
```
FIX THE ROOT CAUSE:
1. Remove display: grid (stop fighting the library)
2. Use lineNumberContainerStyle (library's native prop)
3. Set wrapLines={true} (enable wrapping properly)
4. Let library handle its own rendering
```

**Step 4: Validation**
```
✅ Root cause addressed: Using library properly
✅ Investigation complete: Verified library documentation
✅ Context considered: Works with responsive layout
✅ Not a symptom fix: Fixed actual problem
✅ Library respected: Using native capabilities
```

---

## Agent Implementation

All Scout94 agents MUST implement:

```javascript
class Scout94Agent {
  async proposeeSolution(issue) {
    // STEP 1: STOP - Investigate first
    const investigation = await this.investigate(issue);
    
    // STEP 2: Identify root cause
    const rootCause = await this.findRootCause(investigation);
    
    // STEP 3: Validate not treating symptom
    if (this.isSymptomFix(rootCause)) {
      return this.investigateDeeper(issue);
    }
    
    // STEP 4: Propose solution
    const solution = await this.createSolution(rootCause);
    
    // STEP 5: Validate solution
    const validation = this.validateSolution(solution);
    
    if (!validation.passed) {
      throw new Error(`Solution failed accountability check: ${validation.issues.join(', ')}`);
    }
    
    return solution;
  }
}
```

---

## Accountability Report Format

Every solution MUST include:

```markdown
## Root Cause Analysis
- What: [Description of the problem]
- Why: [Root cause explanation]
- Evidence: [Investigation steps taken]

## Investigation Steps
1. Read files: [list]
2. Checked: [what was verified]
3. Identified: [root cause]

## Solution
- Addresses: [root cause, not symptom]
- Method: [how it fixes the actual problem]
- Validation: [why this is the right fix]

## Holistic Impact
- Upstream: [effects]
- Downstream: [effects]
- Related: [any related issues from same cause]
```

---

## Forbidden Shortcuts

**NEVER:**
- ❌ Guess at solutions without investigation
- ❌ Apply quick fixes without understanding
- ❌ Treat symptoms while ignoring root causes
- ❌ Fight libraries instead of using them properly
- ❌ Force custom implementations when library provides it
- ❌ Say "for now" or "temporary"
- ❌ Delete features to avoid fixing the real problem

---

## Success Metrics

A solution is successful when:
1. ✅ Root cause identified and documented
2. ✅ Investigation evidence provided
3. ✅ Holistic context considered
4. ✅ Fixes the CAUSE, not the SYMPTOM
5. ✅ Respects library capabilities
6. ✅ Validated to work as intended
7. ✅ No new issues created

---

## Key Quote

> "The goal is not to be fast - it's to be RIGHT."
> 
> Taking time to investigate properly:
> - Saves time in the long run
> - Prevents creating new issues
> - Builds better understanding
> - Results in proper solutions
> - Follows professional engineering practices

---

**This is Scout94's standard. This is our accountability.**

Last Updated: October 16, 2025
