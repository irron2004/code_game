# Security & Privacy Guidelines

The Algorithm Learning Game is designed for young learners; safeguarding data and providing a trustworthy experience is mandatory.

---

## 1. Data Handling Principles
- Operate as an offline-first application. No personal accounts or cloud storage in MVP.
- Store only non-sensitive preferences (e.g., animation speed) in `localStorage` under the `alg-game/` namespace.
- Never store names, emails, or identifiable classroom data.

## 2. Permissions & Telemetry
- Any analytics events must be optional and disabled by default.
- Display a clear opt-in dialog for teachers with a summary of collected metrics (`ANALYTICS_METRICS.md`).
- Provide a "Delete data" button that clears local storage and resets settings.

## 3. Security Controls
- Validate imported JSON files before applying to the grid; reject malformed content.
- Escape or sanitize any user-generated text (e.g., custom level titles) before rendering.
- Maintain dependency hygiene; review third-party packages for licenses and vulnerabilities.

## 4. Compliance Checklist
- [ ] COPPA alignment: No collection of personal information under age 13.
- [ ] FERPA awareness: Avoid storing student identifiers.
- [ ] Accessibility compliance: Conform to WCAG 2.1 AA (see `UX_GUIDE.md`).

## 5. Incident Response
- Document incidents in internal tracker with timeline, impact, remediation steps.
- Notify stakeholders (product, legal, partner schools) within 24 hours of detection.
- Provide follow-up action items and prevention plan post-mortem.

## 6. Future Considerations
- Evaluate secure cloud sync if accounts become necessary (use OAuth with parental consent).
- Add automated linting for insecure patterns (e.g., `eval`, dynamic script injection).
