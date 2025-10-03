# Product Requirements Document (PRD)

**Product:** Algorithm Learning Game — Pathfinding Playground for Kids
**Authors:** Product & Curriculum Guild
**Last Updated:** 2025-08-28

---

## 1. Vision & Goals
- Empower learners aged 8–12 to experiment with pathfinding algorithms through playful, visual simulations.
- Support teachers with ready-to-run lesson plans, printable worksheets, and metrics that demonstrate understanding.
- Offer a scaffolded sandbox where learners can tinker safely without breaking the experience.

### Success Metrics
- ≥ 70% of learners can articulate the difference between BFS and Dijkstra during post-lesson exit tickets.
- ≥ 80% of classroom sessions complete the "Find the Treasure" level within 10 minutes.
- Net Promoter Score (educator) ≥ +40 within the pilot cohort.

## 2. Target Users
### Primary Learners
- Students in late elementary or early middle school.
- Comfortable with tablets or Chromebooks but new to algorithmic vocabulary.

### Secondary Personas
- Teachers / facilitators guiding group sessions.
- Guardians exploring enrichment activities at home.

## 3. Product Pillars
1. **Show the Journey:** Reveal each decision the algorithm makes through animation and narration.
2. **Tinker without Fear:** Provide undo, reset, and level cloning so experimentation feels safe.
3. **Connect to the Real World:** Offer story-based levels and reflection prompts relating to navigation problems.

## 4. Key Features (MVP)
- **Interactive Grid Editor:** Drag-and-drop start, goal, walls, and weighted tiles. Mobile-friendly gestures.
- **Algorithm Selector:** BFS, Dijkstra, and A* with explanatory tooltips and progress narration.
- **Step Controls:** Play, pause, step-forward, step-back, and adjustable speed slider (0.25×–3×).
- **Level Library:** Pre-built levels (tutorial, maze, detour) plus import/export for JSON.
- **Hint System:** When no path exists, highlight blocking obstacles and explain why.
- **Progress Tracker:** Optional star system awarding badges for completing challenge criteria.

## 5. Out of Scope (MVP)
- Competitive multiplayer or real-time collaboration.
- Login accounts or cloud saves (future iteration post-privacy review).
- Algorithms beyond BFS/Dijkstra/A* (e.g., Greedy Best-First, Bellman-Ford).
- Full localization beyond Korean/English copy (TBD).

## 6. User Stories
1. *Learner* — "As a student, I want to drop different terrains so I can see how the path changes."
2. *Learner* — "As a player, I want hints when the path fails so I know what to adjust."
3. *Teacher* — "As a teacher, I want printable walkthroughs so I can plan activities offline."
4. *Teacher* — "As a facilitator, I want to see which algorithm learners chose most often."
5. *Content Author* — "As a curriculum designer, I want to create challenge levels via JSON without touching code."

## 7. Competitive Landscape
- **Code.org Maze Challenges:** Great onboarding but limited to block-based controls.
- **LightBot / Robot Turtle:** Focused on sequencing; lacks algorithm transparency.
- **Pathfinding Visualizers (general web):** Typically aimed at adults; uses technical jargon and dense controls.

## 8. Release Strategy
- Pilot with three partner classrooms (grade 5) using Chromebooks.
- Collect qualitative feedback through teacher interviews and learner journaling.
- Iterate bi-weekly based on observation notes and analytics instrumentation.

## 9. Open Questions
- Should we gamify with XP/coins or stick to narrative milestones?
- What scaffolding best supports students with color vision deficiencies?
- Do we need offline printable grids for no-device classrooms?

## 10. Appendices
- See `SCOPE_PLAN.md` for milestone breakdown and release gating.
- See `UX_GUIDE.md` for interface principles and motion specs.
- See `ANALYTICS_METRICS.md` for measurement framework.
