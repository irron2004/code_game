# 아키텍처 개요

## 모듈
- grid.js: 셀/이웃/가중치/휴리스틱, 좌표→키 변환
- algorithms.js: BFS/Dijkstra/A* (Generator로 step 상태 yield)
- simulator.js: 알고리즘 생성기 래핑, step/play/pause/reset
- renderer.js: 캔버스 드로잉(배경/방문/프론티어/경로/현재/격자)
- main.js: UI 바인딩, 규칙 Proxy(변경 시 시뮬 재구성)
- levels.js: 샘플 생성, 랜덤 벽

## 상태 흐름(요약)
UI → rules 변경 → Simulator 재생성 → Player.play(step 호출 루프)
→ algorithms.* 제너레이터가 `{visited, frontier, current, path}` 상태 yield
→ renderer.draw(state, options) → 상태 패널 갱신

## 확장 포인트
- `grid.neighbors(...)` 규칙 주입(대각/가중치/추가 제약)
- `algorithms.js`에 새 알고리즘(예: Greedy Best-First, Jump Point Search)
- 레벨 포맷 JSON → `Grid.fromJSON` 로더 추가
- 다국어: UI 문구 분리 파일(`i18n_*.js`)

## 성능 노트
- 캔버스 상태 변경 최소화, 셀 루프에서 색상 배치로 칠하기
- 방문/프론티어는 집합을 순회하며 사각형 그리기(배치)
