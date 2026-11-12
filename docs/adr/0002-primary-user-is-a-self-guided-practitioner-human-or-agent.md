# 2. The primary user is a self-guided practitioner, human or agent

Date: 2026-11-12

## Status

Accepted (2026-11-12). Recorded in STRATEGY.md, section Users.

## Context

The Thinking Processes are usually taught and run with a skilled facilitator. Facilitators are scarce, so people who try the method alone skip or abandon steps in the chain of questions. AI agents now also build and check plans, and an agent can draft a tree and then review its own draft.

The plugin can serve several groups: experts, learners, facilitators, and agents. The choice of a primary user decides the defaults: how much the plugin explains, who gives permission for a repair, and how a session is measured.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Facilitator | The plugin helps a facilitator run a session for a group | Rejected: it keeps the scarce expert as the constraint that the strategy wants to remove |
| B. Learner | The plugin teaches the method step by step | Rejected: it makes the plugin a course, which STRATEGY.md excludes |
| C. Self-guided human practitioner only | A person who knows the basics, with no facilitator | Rejected: it leaves out agents that build and check trees |
| D. Self-guided practitioner, human or agent | C, plus an AI agent that builds and checks a tree on a real problem | Chosen |

## Decision

1. **The primary user is a self-guided practitioner, human or agent.** The practitioner knows the basics, has no facilitator, and builds and checks a tree on a real problem of their own.
2. **Every skill works with no human in the session.** An agent can run the chain of questions and the CLR review from start to end.
3. **Findings are the same for every reader.** Experts, learners, and an agent that checks its own draft get the same findings. Depth is given on request.
4. **Permission follows the author.** A repair is applied only after the author reviews it and gives permission. When the author is an agent, the agent's own approval rule applies.

## Consequences

- **Skills cannot depend on a human answer to continue.** A question to the author must have a default, or the skill must record it as open and continue.
- **Metrics count agent sessions.** "Chain completion" and "Findings acted on" in STRATEGY.md include agent sessions, so the plugin must record them in a form an agent can produce.
- **Agent-only test runs are valid evidence.** The evaluation set can run with no human, which makes the review testable in CI.
- **Learner support stays as depth on request.** A request for a teaching mode is resisted unless it uses the same findings.
- **Reversal is expensive.** Changing the primary user changes skill defaults, metrics, and the evaluation set at the same time.
