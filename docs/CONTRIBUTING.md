# Contributing

## 코드 스타일
- ES 모듈(ES2020+), 함수형 우선, 부작용 최소화
- 네이밍: 명확/구체(`reconstructPath`, `terrainCost`)
- 주석: 알고리즘 의도/복잡도(O표기) 중심

## 린트/포맷(권장)
- ESLint: `no-unused-vars`, `eqeqeq`, `prefer-const`
- Prettier 기본

## 브랜치/PR
- 브랜치: `feat/`, `fix/`, `docs/`
- PR 템플릿(요약/변경점/스크린샷/테스트 영향/체크리스트)

## 테스트(권장)
- Vitest: `src/algorithms.spec.js`
- 케이스: 직선 통로, 봉쇄 맵, 가중치 경로 차이

## 이슈 라벨
- `bug`, `enhancement`, `a11y`, `good first issue`, `education`
