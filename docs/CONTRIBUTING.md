# Contributing

## 코드 스타일
- ES Modules(ES2020+), 함수형 우선
- 명확한 네이밍: `reconstructPath`, `terrainCost`
- 주석: 알고리즘 의도/복잡도(O-표기)

## 린트/포맷(권장)
- ESLint: `no-unused-vars`, `eqeqeq`, `prefer-const`
- Prettier 기본

## 브랜치/PR
- 브랜치: `feat/*`, `fix/*`, `docs/*`
- PR 템플릿 사용(스크린샷/레벨 JSON 첨부)

## 테스트(권장: Vitest)
- `src/algorithms.spec.js`
- 케이스: 직선/봉쇄/가중치/대각 on-off

## 이슈 라벨
- `bug`, `enhancement`, `a11y`, `good first issue`, `education`
