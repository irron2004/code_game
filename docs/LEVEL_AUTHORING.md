# Level Authoring Guide

This guide explains how to create, validate, and share level files for the Algorithm Learning Game.

---

## 1. Level JSON Schema
```json
{
  "id": "string",
  "title": "string",
  "narrative": "string",
  "recommendedAlgorithm": "bfs" | "dijkstra" | "astar",
  "grid": {
    "width": number,
    "height": number,
    "tiles": [[number]]
  },
  "start": { "x": number, "y": number },
  "goal": { "x": number, "y": number },
  "weights": [{ "x": number, "y": number, "cost": number }],
  "hints": ["string"]
}
```

### Tile Encoding
- `0`: empty floor
- `1`: wall/blocked
- `S`: start (optional shorthand, prefer `start` object)
- `G`: goal (optional shorthand, prefer `goal` object)
- Weighted tiles stored separately in `weights` with cost ≥ 2.

## 2. Authoring Workflow
1. Sketch the challenge and learning objective (e.g., introduce weighted paths).
2. Use in-app editor to craft the base grid.
3. Export JSON and refine metadata (`title`, `narrative`, `hints`).
4. Validate with schema (see below) before distributing.

## 3. Validation Checklist
- Start and goal exist and are not identical unless intentional tutorial.
- Grid dimensions ≤ 40×40 for performance.
- Weighted tiles coordinates fall within grid bounds.
- Provide at least one hint. When no solution exists intentionally, mark narrative accordingly.

## 4. Tooling
- CLI validator (planned) will live under `tools/level-validate.js`.
- For now, use https://jsonlint.com/ plus manual review against this document.
- Store canonical levels in `src/levels.js` and update documentation when adding new archetypes.

## 5. Sharing Guidelines
- Include preview screenshot or GIF when submitting new levels via PR.
- Provide teacher notes on objective, estimated time, and possible extension questions.
- Tag difficulty (`easy`, `medium`, `challenge`).

## 6. Changelog Template
Add to the bottom of each level file comment block:
```
// 2025-09-01 — Added new weighted detour puzzle (Author Name)
```
