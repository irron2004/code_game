
# Contributing

## 코드 스타일
- ES Modules(ES2020+), 함수형 우선
- 명확한 네이밍: `reconstructPath`, `terrainCost`
- 주석: 알고리즘 의도/복잡도(O-표기)

## 검증
- 제품 전체 게이트: `npm ci && npm run check`
- 감시 모드: `npm run test:watch`
- ESLint/Prettier 설정과 빌드 단계는 아직 없다. 도입 전에는 CI가 실행한다고 가정하지 않는다.

## 브랜치/PR
- 브랜치: `feat/*`, `fix/*`, `docs/*`
- PR 템플릿 사용(스크린샷/레벨 JSON 첨부)

## 테스트(권장: Vitest)
- `algorithm-game/src/__tests__/algorithms.spec.js`
- 케이스: 직선/봉쇄/가중치/대각 on-off

## 이슈 라벨
- `bug`, `enhancement`, `a11y`, `good first issue`, `education`
