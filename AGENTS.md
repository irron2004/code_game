# AGENTS.md — code_game 작업 규칙

> 공통 정책: 워크스페이스 루트 `../AGENTS.md` (ruahverce 정책)를 먼저 따른다.
> 단독 클론 시 최소 원칙 1줄: 비밀키 커밋 금지·파괴적 git 명령 금지·실패 게이트
> 삭제/skip 금지·아동 대상 서비스이므로 PII·추적·광고 도입 금지.
>
> 다음 할 일: `next.yml` (유지 규칙: 워크스페이스 루트 `../AGENTS.md` §4.5)

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

**주의 — 루트의 Python 스캐폴딩은 실제 제품과 무관한 미사용 보일러플레이트다**: `src/app.py`(FastAPI 헬스체크 스텁), `tests/test_health.py`, `pyproject.toml`, `requirements.in`, `Makefile`, `.pre-commit-config.yaml`, `scripts/setup.sh`. `algorithm-game/`의 어떤 모듈도 이를 import하지 않는다. `requirements.in`은 `pyproject.toml`의 dev extra를 가리키는 pip-tools 입력이고, `ci-python.yml`은 이 스텁만 별도로 검증한다. 삭제하거나 실제 백엔드로 발전시키기 전에 사용자에게 먼저 확인한다.

## 3) 로컬 실행(실측 검증됨)

```bash
npm ci
npm start        # server.js 기동 → http://localhost:8080
npm test         # 결정론적 1회 실행 (algorithm-game/src/__tests__/**/*.spec.js)
npm run check    # server.js 구문 검사 + Vitest 전체 실행
```

- 빠른 미리보기(서버 없이): `cd algorithm-game && python3 -m http.server 5173`
- 검증 기준(2026-07-23, Node v22): 6개 파일, 18개 테스트가 모두 통과해야 한다. 브라우저 전역은 Vitest의 `vi.stubGlobal`로 스텁하고 `vi.unstubAllGlobals`로 복원한다.
- 정적 앱이라 별도 빌드 단계는 없다. ESLint/Prettier 설정도 아직 없으므로 존재하지 않는 게이트를 통과했다고 보고하지 않는다.
- 사용하지 않는 Python 스텁까지 건드린 경우: `.venv/bin/pip install -e ".[dev]" && make check`.

## 4) 코드 원칙

1. 번들러 도입 금지 — 브라우저에서 `index.html`을 바로 여는 구조를 유지한다. 필요 시 PR로 먼저 제안한다.
2. 알고리즘은 제너레이터 기반(step-by-step)을 유지해 재생/일시정지/한 스텝 제어가 가능해야 한다(`algorithms.js`).
3. 레벨/규칙은 데이터 드리븐(JSON)으로 확장한다(`level_io.js`, `docs/LEVEL_AUTHORING.md`).
4. 아동 UX 우선: 큰 버튼, 쉬운 용어, 즉각 피드백, 색 대비.
5. PII 수집 금지, 저장은 로컬 우선(localStorage). 텔레메트리는 익명 세션/디바이스 ID만 사용한다(`docs/SECURITY_PRIVACY.md`).
6. 큰 외부 라이브러리 추가는 지양한다(필요 시 근거를 첨부해 제안).
7. 미사용 Python 스텁, 추적된 산출물, 배포 경로를 임의로 삭제·전환하지 않는다. 삭제는 루트 정책에 따라 사용자 승인을 받는다.

## 5) CI/배포

- `ci-node.yml`이 유일하게 제품과 관련된 CI다. `algorithm-game/**`, `server.js`, `package.json`, `package-lock.json`, `vitest.config.js` 변경 시 트리거되며 Node 22에서 `npm ci` → `npm run check`를 실행한다. 문서·Docker 변경은 이 CI를 트리거하지 않는다.
- `ci-python.yml`은 `main`/`develop` 브랜치로의 push·PR에서, `docker.yml`은 `main` 브랜치 push(+`v*` 태그)와 `main` 대상 PR에서 돈다 — 둘 다 path 필터가 없어 어떤 파일이 바뀌어도 트리거되지만, 각각 §2의 Python 스텁, Docker 이미지 빌드만 검증한다.
- Railway 배포는 Node(`npm start`, 권장) 또는 Docker 두 경로를 지원한다. Start Command 설정 실수로 인한 오류는 `docs/DEPLOY_TROUBLESHOOTING.md`에 정리돼 있다.
- 텔레메트리 API(`/v1/events`, `/v1/ingest-token`)는 `INGEST_SECRET`, `INGEST_ALLOW_ORIGINS`, `DATABASE_URL`, `INGEST_RATE_MAX`, `INGEST_WINDOW_MS` 환경 변수로 제어한다. `DATABASE_URL` 미설정 시 이벤트는 202로 수락되지만 저장되지 않는다(`server.js`).

## 6) 문서 지도

`docs/`에 제품 문서가 이미 있다 — 새로 만들기 전에 먼저 확인한다: `PRD.md`(제품 요구), `SRS.md`/`ARCHITECTURE.md`(설계), `UX_GUIDE.md`, `LEVEL_AUTHORING.md`(레벨 JSON 스키마), `TELEMETRY_SETUP.md`/`SECURITY_PRIVACY.md`/`ANALYTICS_METRICS.md`(계측), `QA_TEST_PLAN.md`, `DEPLOY_TROUBLESHOOTING.md`, `WSL_SETUP.md`.

구버전 초안 `AGENT.md`(루트)와 `docs/AGENT.md`는 제거됨(git 이력 참조) — 규칙은 본 `AGENTS.md`를 따른다.

## 7) 커밋/브랜치

- 브랜치: `feat/*`, `fix/*`, `docs/*`
- 커밋: `type(scope): subject` (예: `feat(sim): add JSON import/export`)
- 동시 작업은 루트 `AGENTS.md` §3의 분리 worktree/브랜치 규칙을 그대로 적용하고, 커밋 전 `git status`와 최근 로그를 확인한다.
