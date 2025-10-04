# Software Requirements Specification (SRS)

**System:** Algorithm Learning Game Web Application
**Version:** 0.1.0 (MVP)
**Last Updated:** 2025-08-28

---

## 1. Introduction
- **Purpose:** Define functional, data, and quality requirements for the browser-based simulator that visualizes BFS, Dijkstra, and A* algorithms on a configurable grid.
- **Scope:** Client-side application delivered as static assets (`index.html`, CSS, JavaScript modules) runnable without a build step.
- **References:** `PRD.md`, `UX_GUIDE.md`, `LEVEL_AUTHORING.md`.

## 2. Overall Description
- **User Classes:** Learners (players), Teachers (facilitators), Content Authors (level creators).
- **Operating Environment:** Latest Chrome, Edge, and Safari on desktop; Safari and Chrome on iPad/Chromebook. Minimum 1024×600 resolution.
- **Design Constraints:** No external heavyweight libraries, offline-capable (no server dependency), accessible via keyboard and touch.

## 3. Functional Requirements
### 3.1 Grid Editing
- FR-1: Users can toggle tiles between open, wall, start, goal, and weighted cost values (1–9).
- FR-2: Drag gestures on touch devices paint tiles continuously.
- FR-3: Undo/redo history stores the last 20 actions.

### 3.2 Algorithm Simulation
- FR-4: Simulator must run BFS, Dijkstra, and A* using generator-based step functions exposed from `src/algorithms.js`.
- FR-5: Play/pause/step controls interact with generator iterators without blocking UI.
- FR-6: When no valid path exists, system highlights obstructing tiles and surfaces guidance text.

### 3.3 Level Management
- FR-7: Users can import/export level JSON via download/upload dialogs with schema validation (`LEVEL_AUTHORING.md`).
- FR-8: Built-in tutorial levels load from `src/levels.js` and can be reset to defaults.
- FR-9: Level metadata stores recommended algorithm, difficulty, and narrative prompt.

### 3.4 Feedback & Guidance
- FR-10: Tooltip copy explains each algorithm in child-friendly terms (≤ 80 characters each).
- FR-11: Narration panel updates after each algorithm step describing visited nodes and current cost.
- FR-12: Hint banner triggers when learners press "Help" or simulation detects failure conditions.

## 4. Data Requirements
- DR-1: Level JSON structure defined in `LEVEL_AUTHORING.md` with validation prior to import.
- DR-2: Persistent settings (e.g., animation speed, last algorithm) stored in `localStorage` under namespaced keys `alg-game/*`.
- DR-3: No personally identifiable information (PII) stored or transmitted.

## 5. Interface Requirements
- IR-1: UI uses 48px minimum touch targets and 16px base font for readability.
- IR-2: Color palette must maintain WCAG 2.1 AA contrast (≥ 4.5:1 for primary text, ≥ 3:1 for UI icons).
- IR-3: Keyboard controls include tab navigation, space/enter activation, and arrow-key grid movement when focus is on canvas.

## 6. Performance Requirements
- PR-1: Simulator renders at ≥ 60fps average on 30×30 grid with algorithm running at default speed in Chrome on mid-range laptop.
- PR-2: Import/export of 30×30 levels completes within 250ms on target browsers.
- PR-3: Initial page load (uncached) ≤ 2.5s on 3G Fast network conditions (Lighthouse).

## 7. Security & Privacy Requirements
- SPR-1: Application must operate without user accounts; no network requests aside from optional analytics events outlined in `ANALYTICS_METRICS.md`.
- SPR-2: Provide clear disclosure before enabling any telemetry and include opt-in toggle.
- SPR-3: Ensure stored data is namespaced to avoid collisions with other localStorage keys.

## 8. Quality Attributes
- QA-1: Maintainability — Modules should be <200 LOC each and use pure functions where possible.
- QA-2: Testability — Introduce Vitest specs for `grid.js` and `algorithms.js` covering neighbors, BFS, Dijkstra, A*.
- QA-3: Accessibility — Support screen-reader-friendly labels and ARIA live regions for narration updates.
- QA-4: Reliability — Detect and recover from invalid states (e.g., missing start/goal) with user prompts.

## 9. Appendices
- **A. Glossary:** BFS (Breadth-First Search), Dijkstra (shortest path with weights), A* (heuristic search using Manhattan distance).
- **B. Traceability Matrix:** Maintain spreadsheet mapping FR/DR/PR to stories in `SCOPE_PLAN.md`.
