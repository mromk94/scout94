# Problem-Solving Methodology for Scout94

## Core Principle: INVESTIGATE ROOT CAUSE, NEVER GUESS SOLUTIONS

This document defines the problem-solving approach for Scout94's ecosystem and all AI agents.

---

## The Workflow

### 1. STOP AND ANALYZE FIRST
**DO NOT:**
- Jump to solutions immediately
- Apply band-aids or quick fixes
- Make assumptions without verification

**DO:**
- Read the error/issue completely
- Understand what the symptoms are telling you
- Gather all relevant information first

### 2. ROOT CAUSE INVESTIGATION
**Ask the critical questions:**
- What is the ACTUAL problem, not just the symptom?
- Why is this happening?
- What is the upstream cause?
- Is this a symptom of a deeper issue?

**Tools to use:**
- Read relevant files
- Grep for patterns
- Check actual data/logs
- Trace execution flow
- Verify assumptions with evidence

### 3. HOLISTIC UNDERSTANDING
**Consider the full context:**
- How does this component fit in the larger system?
- What are the upstream dependencies?
- What downstream effects will changes have?
- Are there related issues stemming from the same root cause?
- What was the original intent?

### 4. ANALYZE BEFORE ACTING

**For Duplicates:**
- Analyze BOTH versions completely
- Compare features, parameters, return types
- Understand the intent behind each version
- Never delete without comparison

**For Errors:**
- Understand WHY it's failing, not just THAT it's failing
- Trace the error to its source
- Verify the root cause with evidence

**For Missing Features:**
- Check if intentionally removed
- Check if never implemented
- Understand the history

### 5. IMPLEMENT PROPER SOLUTION

**Requirements:**
- Fix the ROOT CAUSE, not symptoms
- Ensure solution addresses the actual problem
- Verify solution doesn't create new issues
- Test that it works as intended
- Document the reasoning

**Quality checks:**
- Does this fix the root cause?
- Am I treating a symptom?
- Will this create new problems?
- Have I verified it works?

### 6. NEVER DO THESE

❌ Guess at solutions without investigation  
❌ Apply quick fixes without understanding  
❌ Delete code without analyzing both versions  
❌ Take lazy shortcuts  
❌ Fix symptoms while ignoring root causes  
❌ Make assumptions without verification  
❌ Choose "easiest" over "correct"  
❌ Say "for now" or "temporarily"  

---

## Real Example: The Minified Code Issue

### ❌ Wrong Approach (Treating Symptoms):
```
Problem: Code displaying with broken characters
Action 1: Try wordBreak: 'break-word'
Result: Worse - breaks every character
Action 2: Try different wrap settings
Result: Still broken
Action 3: Keep trying CSS fixes...
```

### ✅ RIGHT Approach (Root Cause Investigation):
```
Problem: Code displaying with broken characters
Step 1: Analyze - What's actually being displayed?
Step 2: Investigate - Content shows: import{r as e,j as t}...
Step 3: Root Cause - This is MINIFIED code, not source!
Step 4: Why? - Loading from dist/build folders, not src
Step 5: Proper Solution - Filter minified files at source
Result: ✅ Only source code shown, perfectly readable
```

**The difference:** 
- Wrong approach treated the symptom (display issue)
- Right approach fixed the root cause (loading wrong files)

---

## Application to Scout94 Ecosystem

### All Scout94 Components Must Follow This:

#### 1. Comprehensive Scan
- Traces ROOT CAUSES, not just symptoms
- Groups issues by underlying problems
- Identifies cascading failures
- Provides root cause → solution mapping

#### 2. Duplicate Analyzer
- Understands intent before recommending
- Compares both versions thoroughly
- Never recommends deletion without analysis
- Preserves intentional work

#### 3. Decision Framework
- Prevents lazy shortcuts
- Validates solutions against root causes
- Ensures proper problem-solving
- Catches symptom fixes

#### 4. AI Agents
- Investigate thoroughly before acting
- Ask clarifying questions when needed
- Never guess at solutions
- Provide reasoning for recommendations

---

## Investigation Checklist

Before implementing any solution, verify:

- [ ] Have I identified the root cause, not just symptoms?
- [ ] Have I gathered all relevant information?
- [ ] Have I verified my assumptions with evidence?
- [ ] Have I considered the holistic context?
- [ ] Does my solution fix the actual problem?
- [ ] Am I avoiding a lazy shortcut?
- [ ] Have I analyzed all relevant code/data?
- [ ] Will this solution create new problems?

---

## Key Quotes

> "instead of just guessing solutions, AGAIN, review the cause of the issue and attend to the cause itself!"

> "Nobody writes code for no reason. Every duplicate has intent behind it - understand before destroying."

> "Fix root causes, not symptoms."

---

## Remember

**The goal is not to be fast - it's to be RIGHT.**

Taking time to investigate properly:
- ✅ Saves time in the long run
- ✅ Prevents creating new issues
- ✅ Builds better understanding
- ✅ Results in proper solutions
- ✅ Follows professional engineering practices

**This is how Scout94 operates. This is our standard.**
