# Contributing Guide

Welcome! This project thrives on collaboration between educators, designers, and engineers. Please follow the steps below to keep contributions consistent and learner-friendly.

---

## 1. Before You Start
- Read the `PRD.md` and `SRS.md` to align on scope.
- Check open issues or create a new one using the templates in `.github/ISSUE_TEMPLATE`.
- For major UX changes, share mockups or prototypes in the issue before implementation.

## 2. Development Workflow
1. Fork or create a feature branch (`feat/<summary>`, `fix/<summary>`, or `docs/<summary>`).
2. Keep commits small and descriptive using `type(scope): subject` format (e.g., `feat(grid): add weight brush`).
3. Run lint/tests (when available) and document manual test steps in the PR.
4. Update relevant docs within `/docs` and note changes in the PR body.

## 3. Code Style
- Use ES modules with named exports.
- Prefer pure functions and avoid mutable shared state.
- Maintain child-friendly copy and provide Korean defaults when adding text.
- Do not add large dependencies without discussion.

## 4. Review Expectations
- Ensure PR includes screenshots or GIFs for UI changes.
- Provide alternative approaches considered and rationale for the chosen solution.
- Seek at least one review from engineering and, when relevant, from curriculum/UX.

## 5. Release Checklist
- [ ] Docs updated (`README`, relevant guides).
- [ ] QA smoke tests executed (see `QA_TEST_PLAN.md`).
- [ ] Performance baseline validated (60fps target).
- [ ] Accessibility checks performed (keyboard + screen reader spot checks).

## 6. Communication
- Use project Slack channel `#alg-pathfinder` for quick questions.
- Document decisions in `/docs/CHANGELOG.md` (planned) with date and approvers.

Thank you for helping learners explore algorithms with joy!
