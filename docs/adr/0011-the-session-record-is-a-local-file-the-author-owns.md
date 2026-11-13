# 11. The session record is a local file the author owns

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from QUALITY.md, section Session record contract.

## Context

M3 (findings acted on), M4 (chain completion), and M5 (findings before first action) need data from real sessions. The plugin has no runtime or server that could collect it. Sessions can hold private problems, so collecting them without the author's choice would conflict with the neutrality boundary and with the author's trust.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Central telemetry | The plugin sends session data to a service | Rejected: no runtime exists, and sessions can hold private content |
| B. Local record, shared by choice | Each session writes a local file; the author keeps it and can choose to share it | Chosen |

## Decision

1. **The session record is a local file the author keeps and can choose to share.**
2. **Each finding in the record has** a stable finding ID, its CLR category and entity ID, and a final disposition set by the author: accepted, repaired, rebutted with a reason, answered without change, or left open.
3. **For a repair, the record notes whether the author gave permission before it was applied.** This is the evidence for boundary B2.
4. **Each session records the chain steps reached** and the links the source does not answer (from T2).
5. **An agent author writes the same record,** so agent sessions count in M3 and M4 (ADR 0002).

## Consequences

- M3, M4, and M5 depend on authors who choose to share records. Field data will be sparse at first.
- The record format is a contract. A change to it needs care, because older records must still be readable.
- The record is the only check on B2 today; QUALITY.md lists that gap.

## Source

- [QUALITY.md, Session record contract](../../QUALITY.md#session-record-contract)
