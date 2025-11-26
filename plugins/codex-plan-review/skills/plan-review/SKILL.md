---
name: plan-review
description: Provides plan review functionality using OpenAI Codex CLI. Reviews plan files or plan strings and suggests improvements. Auto-invoke when user mentions: plan review, codex review, review my plan, improve plan, codex plan.
---

# Codex Plan Review Skill

## Overview

This skill uses the OpenAI Codex CLI to review implementation plans and suggest improvements.

## Workflow (Skill → Subagent → codex exec)

```
1. [Skill] Receive plan review request from user
       ↓
2. [Subagent] Launch codex-plan-reviewer
       ↓
3. [Bash] Execute codex exec to review the plan
       ↓
4. Return review results and revised plan
```

## Invoking the Subagent

When plan review is needed, **use the Task tool to launch the `codex-plan-reviewer` subagent**.

```
Invoke the Task tool as follows:
- subagent_type: "codex-plan-review:codex-plan-reviewer"
- prompt: "Please review the following plan: {plan content or file path}"
- description: "Review plan with codex"
```

## Example Requests

- "Review this plan with codex" → Launch codex-plan-reviewer
- "Can you review plan.md?" → Launch codex-plan-reviewer
- "What improvements can be made to this plan?" → Launch codex-plan-reviewer

## Input Formats

1. **File path**: Pass the path to a plan file
2. **Plan string**: Pass the plan content directly
