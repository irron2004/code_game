# AGENTS.md — code_game 작업 규칙

> 공통 정책: 워크스페이스 루트 `../AGENTS.md` (ruahverce 정책)를 먼저 따른다.
> 단독 클론 시 최소 원칙 1줄: 비밀키 커밋 금지·파괴적 git 명령 금지·아동 대상 서비스이므로 PII·추적·광고 도입 금지.

## 1) 프로젝트 요약

- 이름: Algorithm Learning Game — 유·초등 학생용 BFS/Dijkstra/A* 길찾기 학습 게임.
- 실제 제품은 **`algorithm-game/`** 하나의 정적 웹 앱(ES Modules, 빌드 없음, `index.html` 직접 실행)이다.
- 저장소 루트에는 이 정적 앱을 배포하기 위한 Express 서버(`server.js`)와 Docker/Nginx 설정이 함께 있다.

## 2) 디렉터리 구조(실측)

```
algorithm-game/           # 실제 제품 — 정적 웹 앱
  index.html, styles.css
  src/
    main.js grid.js algorithms.js simulator.js renderer.js
    levels.js level_io.js no_path_advice.js tutorial.js
    store.js analytics.js telemetry.js
    __tests__/*.spec.js   # Vitest 테스트
server.js                 # Express 정적 서버 + 텔레메트리 인제스트 API
docker/, Dockerfile, docker-compose.yml   # Nginx 기반 컨테이너 배포
docs/                     # 제품 문서(§6 참조)
.github/workflows/        # ci-node.yml(실사용) · ci-python.yml, docker.yml(§5 참조)
```

**주의 — 루트의 Python 스캐폴딩은 실제 제품과 무관한 미사용 보일러플레이트다**: `src/app.py`(FastAPI 헬스체크 스텁), `tests/test_health.py`, `pyproject.toml`, `requirements.in`, `Makefile`, `.pre-commit-config.yaml`, `scripts/setup.sh`. `algorithm-game/`의 어떤 모듈도 이를 import하지 않는다. `ci-python.yml`이 CI에서 실제로 돌기는 하지만(§5) 검증 대상은 이 스텁 자체뿐이다. 이 스캐폴딩을 실제 백엔드로 발전시키기 전에 사용자에게 먼저 확인한다 — 별 근거 없이 기능을 얹지 않는다.

## 3) 로컬 실행(실측 검증됨)

```bash
npm install
npm start        # server.js 기동 → http://localhost:8080
npm test         # vitest --run (algorithm-game/src/__tests__/**/*.spec.js)
```

- 빠른 미리보기(서버 없이): `cd algorithm-game && python3 -m http.server 5173`
- `npm test` 실행 결과(2026-07-23, Node v22): 6개 파일 중 5개 통과, `telemetry.spec.js`의 "flushes queued events via fetch" 1건이 `Cannot set property navigator of #<Object> which has only a getter`로 실패. Node ≥20의 read-only 전역 `navigator`와 테스트의 `global.navigator = {...}` 스텁이 충돌하는 기존 결함이며, 무관한 변경으로 재발생해도 회귀로 오인하지 않는다. 새 실패가 이 케이스 외에 추가되면 회귀로 취급한다.
- `package.json`에는 `lint`/`build` 스크립트가 없다. CI가 `--if-present`로 건너뛸 뿐 실제 lint 게이트는 없다 — ESLint/Prettier 도입은 `docs/CONTRIBUTING.md`의 권장 사항일 뿐 아직 설정 파일이 없다.

## 4) 코드 원칙

1. 번들러 도입 금지 — 브라우저에서 `index.html`을 바로 여는 구조를 유지한다. 필요 시 PR로 먼저 제안한다.
2. 알고리즘은 제너레이터 기반(step-by-step)을 유지해 재생/일시정지/한 스텝 제어가 가능해야 한다(`algorithms.js`).
3. 레벨/규칙은 데이터 드리븐(JSON)으로 확장한다(`level_io.js`, `docs/LEVEL_AUTHORING.md`).
4. 아동 UX 우선: 큰 버튼, 쉬운 용어, 즉각 피드백, 색 대비.
5. PII 수집 금지, 저장은 로컬 우선(localStorage). 텔레메트리는 익명 세션/디바이스 ID만 사용한다(`docs/SECURITY_PRIVACY.md`).
6. 큰 외부 라이브러리 추가는 지양한다(필요 시 근거를 첨부해 제안).

## 5) CI/배포

- `ci-node.yml`이 유일하게 제품과 관련된 CI다. `algorithm-game/**`, `package.json`, `package-lock.json`, `vitest.config.js` 변경 시에만 트리거되며 `npm ci` → `npm test -- --run`을 실행한다. `server.js`/`docs/`/Docker 관련 변경은 이 CI를 트리거하지 않는다.
- `ci-python.yml`, `docker.yml`은 모든 push/PR에서 돌지만 각각 §2의 Python 스텁, Docker 이미지 빌드만 검증한다.
- Railway 배포는 Node(`npm start`, 권장) 또는 Docker 두 경로를 지원한다. Start Command 설정 실수로 인한 오류는 `docs/DEPLOY_TROUBLESHOOTING.md`에 정리돼 있다.
- 텔레메트리 API(`/v1/events`, `/v1/ingest-token`)는 `INGEST_SECRET`, `INGEST_ALLOW_ORIGINS`, `DATABASE_URL`, `INGEST_RATE_MAX`, `INGEST_WINDOW_MS` 환경 변수로 제어한다. `DATABASE_URL` 미설정 시 이벤트는 202로 수락되지만 저장되지 않는다(`server.js`).

## 6) 문서 지도

`docs/`에 제품 문서가 이미 있다 — 새로 만들기 전에 먼저 확인한다: `PRD.md`(제품 요구), `SRS.md`/`ARCHITECTURE.md`(설계), `UX_GUIDE.md`, `LEVEL_AUTHORING.md`(레벨 JSON 스키마), `TELEMETRY_SETUP.md`/`SECURITY_PRIVACY.md`/`ANALYTICS_METRICS.md`(계측), `QA_TEST_PLAN.md`, `DEPLOY_TROUBLESHOOTING.md`, `WSL_SETUP.md`.

루트의 `AGENT.md`와 `docs/AGENT.md`는 이 파일 이전에 작성된 구버전 초안(내용 대부분 본 문서에 반영됨)이다 — 규칙은 본 `AGENTS.md`를 따른다.

## 7) 커밋/브랜치

- 브랜치: `feat/*`, `fix/*`, `docs/*`
- 커밋: `type(scope): subject` (예: `feat(sim): add JSON import/export`)
