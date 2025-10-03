# QA & Test Plan

**Objective:** Ensure the Algorithm Learning Game operates reliably across supported browsers/devices while delivering age-appropriate feedback.

---

## 1. Test Environments
- Chrome (latest) on Windows 11, macOS, and ChromeOS.
- Safari on iPadOS 17.
- Edge (latest) on Windows 11 touch laptop.
- Optional: Firefox ESR for accessibility smoke checks.

## 2. Test Types
1. **Unit Tests (Vitest):**
   - `grid.neighbors` adjacency rules (orthogonal + optional diagonals).
   - BFS, Dijkstra, and A* shortest path assertions against golden fixtures.
2. **Integration Tests:**
   - Algorithm playback controls (play, pause, step) maintain consistent state.
   - Level import/export cycle preserves metadata and weighted costs.
3. **Manual Exploratory:**
   - Touch interactions on iPad (drawing walls, pinch zoom if added).
   - Accessibility features (keyboard navigation, screen reader cues).
4. **Performance Benchmarks:**
   - Measure FPS with 30×30 grid using Chrome DevTools Performance panel.
   - Record import/export timings via browser performance markers.

## 3. Regression Suite
| Area | Scenario | Frequency |
| --- | --- | --- |
| Grid Editing | Paint walls, set start/goal, undo/redo | Each release |
| Simulation | Run BFS/Dijkstra/A* on sample levels | Each release |
| Hints | Trigger no-path state and verify highlight | Each release |
| Import/Export | Round-trip JSON for tutorial level | Each release |
| Responsiveness | Resize window (mobile, tablet, desktop) | Weekly |

## 4. Acceptance Criteria Checklist
- [ ] All automated tests passing (`npm test`).
- [ ] Manual smoke checklist signed off by QA analyst.
- [ ] Performance metrics meet thresholds in `SRS.md`.
- [ ] Accessibility audit (axe or Lighthouse) has no critical issues.

## 5. Defect Triage
- Severity P0 (blocker): Simulation unusable, crashes, or data loss.
- Severity P1 (major): Feature broken but workaround exists.
- Severity P2 (minor): Cosmetic or low-impact copy issues.
- Severity P3 (nice-to-have): Enhancements or polish tasks.

## 6. Reporting
- Test runs documented in QA log (Notion/Sheets) with links to PRs.
- Bugs recorded via `.github/ISSUE_TEMPLATE/bug_report.md`.

## 7. Future Automation
- Add Playwright smoke tests covering grid editing and algorithm playback.
- Integrate GitHub Actions workflow to run Vitest on push/PR.
