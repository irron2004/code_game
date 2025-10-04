# Analytics & Metrics Strategy

Purpose: Provide lightweight insights for teachers and product teams while respecting student privacy.

---

## 1. Guiding Principles
- Collect aggregated, non-identifiable usage patterns.
- Opt-in only; no telemetry without teacher consent.
- Provide clear dashboards or CSV exports that teachers can share with administrators.

## 2. Core Metrics
| Metric | Description | Purpose |
| --- | --- | --- |
| Session Count | Number of unique play sessions per device | Track engagement | 
| Algorithm Choice Mix | Distribution of BFS/Dijkstra/A* selections | Understand comprehension |
| Completion Rate | % of sessions reaching goal tile | Measure success |
| Hint Usage | Count of hint activations per level | Gauge difficulty |
| Time to Complete | Duration from play to goal | Identify pacing |

## 3. Instrumentation Plan
- Store events locally and batch send only when analytics is enabled.
- Event payload: `{ sessionId, eventType, value, timestamp, levelId }`.
- Provide teacher-facing toggle in settings with summary of active metrics.
- Offer "Export CSV" button for offline analysis; no cloud uploads in MVP.

## 4. Dashboards (Future)
- Lightweight in-app charts built with vanilla SVG (no heavy libs).
- Teacher dashboard highlights top 3 levels by completion rate and average hint usage.
- Include callouts for students who might need support (derived from repeated failed attempts without success).

## 5. Data Retention
- Store telemetry in localStorage for up to 30 days unless teacher clears it sooner.
- Provide "Clear Analytics" button that wipes all metrics data.

## 6. Validation & QA
- Verify instrumentation events using browser devtools when enabling analytics.
- Add unit tests for event formatting utilities when telemetry module implemented.
