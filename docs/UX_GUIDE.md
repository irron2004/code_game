# UX & Interaction Guide

**Design Principles:** playful, legible, forgiving.

---

## 1. Layout
- **Top Bar:** Algorithm selector, speed slider, and status badge. Keep copy ≤ 2 words per control.
- **Left Panel:** Tool palette (start, goal, wall, weight brush, erase). Use icon + label.
- **Right Panel:** Narration log with collapsible hints and teacher notes toggle.
- **Bottom Bar:** Playback controls (play/pause, step, reset) sized 56×56px for touch.

## 2. Visual Language
- Primary color: `#2A6DE1` (buttons, highlights).
- Success color: `#2FB370`; Warning color: `#F5A623`.
- Walls use dark navy (#1C1C3C); weighted tiles overlay with semi-transparent gradients.
- Typography: Pretendard or system sans-serif, 16px base, 24px for headings.

## 3. Motion & Feedback
- Step transitions animate visited nodes with 150ms fade/scale.
- Path reveal uses 250ms "glow" animation after completion.
- Hints slide in from top with bounce easing; auto-dismiss after 6s unless hovered.
- Provide haptic feedback cues for supported devices (via `navigator.vibrate`).

## 4. Copy Guidelines
- Use kid-friendly verbs: "찾기", "도와줘", "다시 시도".
- Keep algorithm descriptions under 80 characters and avoid jargon (e.g., "BFS는 가까운 길부터 살펴봐요!").
- Provide teacher-only tooltips with more precise terminology when `Teacher Mode` is enabled.

## 5. Accessibility
- Ensure focus ring (4px) contrasts with surrounding tile colors.
- Provide alternative text for icons (`aria-label` or visually hidden spans).
- Support `Space`/`Enter` for activation, `Arrow` keys to move brush when canvas focused.
- Offer colorblind-friendly palette toggle (protanopia/deuteranopia safe set).

## 6. Empty & Error States
- **No Start/Goal:** Prompt "먼저 출발점과 도착점을 놓아볼까요?" with quick-place buttons.
- **No Path:** Highlight blocking tiles and display two suggestions (remove wall / change weights).
- **Import Error:** Show modal with validation messages and link to `LEVEL_AUTHORING.md`.

## 7. Responsive Behavior
- Tablet portrait: Collapse narration panel into tabbed drawer.
- Small desktop (<1280px): Reduce side panel width, maintain 16px body text.
- Large desktop: Introduce "Teacher Notes" column with printable tips.

## 8. Future Enhancements
- Avatar guide providing contextual narration.
- Achievement badges displayed after challenge completion with shareable image.
