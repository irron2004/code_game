# Repository Guidelines

## Project Structure & Module Organization
The playable prototype lives in `algorithm-game/`. Load `index.html` together with `styles.css` for the canvas UI, while logic is split across ES modules in `src/` (`main.js` wires UI controls, `grid.js` manages cell state, `renderer.js` draws the board, `simulator.js` runs algorithms, `levels.js` stores presets, `algorithms.js` houses pathfinding helpers). Tests sit in `src/__tests__/`. Planning, UX, QA, and security references sit in `docs/`; keep them aligned with gameplay changes.

## Build, Test & Development Commands
- `npm install && npm start` — run the Express wrapper that serves `algorithm-game/` (mirrors Railway Node deployment, uses `PORT`).
- `docker build -t code-game . && docker run --rm -p 8080:8080 code-game` — spins up the production image locally, mirroring the Railway deployment (container honours the `PORT` env var).
- `cd algorithm-game && python3 -m http.server 5173` — launch a lightweight dev server; visit `http://localhost:5173` to interact with the game.
- `cd algorithm-game && npx serve .` — alternative static server if Node tooling is preferred.
- `npm install && npm test` — run the Vitest suite (grid + algorithms); required before review once dependencies are installed.

## Level Sharing & Keyboard Controls
- 좌측 패널의 **레벨 저장/불러오기**에서 JSON을 다운로드·복사하거나 파일/텍스트로 불러올 수 있습니다 (스키마는 `docs/LEVEL_AUTHORING.md`).
- 화살표 키로 격자 커서를 이동하고 스페이스바로 현재 브러시를 적용/해제합니다(같은 브러시가 있으면 빈칸으로 토글). `P`/`Enter`는 재생·일시정지 토글, `N`은 한 스텝, `R`은 리셋, `1~6`은 브러시 변경입니다.

- Node 모드: `package.json`과 `server.js`를 사용하며 Start Command는 `npm start`로 설정합니다.
- Docker 모드: Start Command를 비워 두고 컨테이너 EntryPoint(`/docker-entrypoint.sh`)를 그대로 사용하세요. `npm start`로 설정되어 있으면 `The executable npm could not be found.` 오류가 발생합니다.
- Docker 모드에서는 배포 후 Service → Networking → Domains에서 포트 8080을 노출해야 퍼블릭 링크가 생성됩니다.
- 공통: 빌드/실행 오류(`start.sh not found`, `could not determine build`, `npm could not be found`)가 발생하면 `docs/DEPLOY_TROUBLESHOOTING.md`에서 원인과 조치를 확인하세요.

## Coding Style & Naming Conventions
Use two-space indentation and concise ES modules with named exports. Favor pure functions and immutable data, mirroring the existing grid and renderer patterns. Classes stay PascalCase (`Renderer`), functions and constants use camelCase, and enums/flags are UPPERCASE (`Cell.WALL`). When adding UI copy, supply Korean defaults alongside English context as seen in status labels. Never bundle large third-party libraries without prior alignment.

## Testing Guidelines
Vitest specs live under `src/__tests__/` (currently `grid.spec.js`, `algorithms.spec.js`). Add regression tests alongside new modules and keep coverage comments in PRs. Continue following `docs/QA_TEST_PLAN.md` for manual smoke checks (devices, performance, accessibility) and attach notes in the PR body.

## Commit & Pull Request Guidelines
Follow the conventional commits format `type(scope): subject`, e.g., `feat(grid): add weighted terrain costs`. Branch names should mirror intent (`feat/weighted-costs`). Every PR needs: clear summary, linked issue reference, updated docs (including `/docs` guides when behavior changes), and screenshots or GIFs for UI-visible tweaks. Document manual test evidence and call out any remaining risks before requesting review.
