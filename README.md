# Algorithm Learning Game

유·초등 학습자를 위한 최단경로 알고리즘 시뮬레이터입니다. 격자 위에 지형을 배치하고 BFS, Dijkstra, A*가 어떻게 경로를 찾는지 단계별로 살펴볼 수 있습니다.

## 프로젝트 구조
- `algorithm-game/` — 정적 웹 앱 (HTML, CSS, ES Modules)
  - `index.html` / `styles.css`
  - `src/` (그리드, 알고리즘, 렌더러, 시뮬레이터, 레벨 샘플)
- `docs/` — 제품/UX/QA 가이드 및 기획 문서 모음 (`DEPLOY_TROUBLESHOOTING.md` 포함)
- `server.js` — Express 기반 정적 서버 (Railway/로컬 `npm start` 경로)
- `docker/`, `Dockerfile` — Railway 등 컨테이너 환경 배포용 Nginx 구성
- `AGENTS.md` — 기여자를 위한 한 페이지 요약 가이드

## 로컬 실행
- 빠른 미리보기: `cd algorithm-game && python3 -m http.server 5173` → `http://localhost:5173`
- Node 기반 정적 서버: `npm install && npm start` → 기본 포트 `http://localhost:8080`
- Docker 이미지: `docker build -t code-game . && docker run --rm -p 8080:8080 -e PORT=8080 code-game`

## 레벨 저장/불러오기
좌측 패널의 **레벨 저장/불러오기**에서 JSON을 다운로드하거나 클립보드로 복사할 수 있습니다. JSON 파일을 선택하거나 텍스트 영역에 붙여넣은 뒤 “텍스트 적용”을 누르면 동일한 맵을 복원할 수 있습니다. 스키마는 `docs/LEVEL_AUTHORING.md`를 참고하세요.

## 학습 지원 기능
- **경로 없음 진단**: 목표에 도달하지 못하면 1초 내 토스트가 표시되며, 대각선 허용·가중치 끄기·A* 전환 중 성공 가능한 규칙을 안내합니다. 성공 옵션은 녹색으로, 이미 적용된 규칙은 “적용됨”으로 강조됩니다.
- **튜토리얼 3단계**: 직선 길, 가중치 비교, 대각선+A* 순으로 안내 모달을 제공해 3~5분 내 핵심 개념을 익힐 수 있습니다.
- **온보딩 패널**: 첫 방문 시 Space/N/R/1~6 단축키를 소개하는 패널이 노출되며 “다시 보지 않기” 체크로 숨길 수 있습니다.

## 키보드 조작법
- 화살표: 커서 이동
- 스페이스바: 현재 브러시 적용/해제(동일 브러시가 있으면 빈칸으로 토글)
- `P` 또는 `Enter`: 시뮬레이션 재생/일시정지 토글
- `N`: 한 스텝 진행
- `R`: 리셋 (시작/목표 위치로 커서도 복귀)
- `1`~`6`: 브러시 선택(벽, 빈칸, 시작, 목표, 숲, 모래)

## 테스트
Vitest 기반 단위 테스트를 추가했습니다.
1. `npm install`
2. `npm test`

Grid와 알고리즘 모듈의 핵심 로직이 검증되며, 향후 `level_io`, `no_path_advice`, `store` 모듈까지 확장할 예정입니다. 커버리지는 `coverage/` 폴더로 출력됩니다.

## Railway 배포
두 가지 옵션을 지원합니다.

1. **Node(권장)** — Railway가 `package.json`과 `server.js`를 감지해 Express 정적 서버를 실행합니다.
   - Start Command를 `npm start`로 설정(이전 `start.sh` 값 제거).
   - `server.js`는 `algorithm-game/` 폴더를 정적 자산으로 서빙하며 `PORT` 환경 변수를 사용합니다.
2. **Docker** — Service 타입을 Docker로 선택하고 `Dockerfile`을 지정합니다. 컨테이너는 Nginx로 정적 자산을 서빙하며, `PORT` 환경변수에 따라 바인딩합니다.
   - Start Command는 비워 두고 컨테이너 기본 EntryPoint(`/docker-entrypoint.sh`)가 실행되도록 설정하세요. 이전에 `npm start`를 설정했다면 제거하지 않으면 `The executable npm could not be found.` 오류가 발생합니다.
   - 배포 후 Service → Networking → Domains에서 포트 8080을 노출하거나 기본 도메인을 생성해야 퍼블릭 링크가 활성화됩니다.

Railway에서 “Start Command not found”, “could not determine how to build”, 또는 `The executable npm could not be found.` 오류가 발생하면 `docs/DEPLOY_TROUBLESHOOTING.md`를 참고하세요.

## 텔레메트리 인제스트
- 브라우저 측 `telemetry.js`가 `[analytics]` 이벤트를 배치 전송하며, 즉시 이벤트(`algo_run_end`, `no_path_detected`)는 `sendBeacon`으로 보냅니다.
- 서버는 `/v1/ingest-token`(JWT 발급, TTL 5분)과 `/v1/events`(배치 수신, RateLimit 기본 600 req/min)를 노출하며, `INGEST_SECRET`, `INGEST_ALLOW_ORIGINS`, `DATABASE_URL`, `INGEST_RATE_MAX`, `INGEST_WINDOW_MS` 환경 변수로 제어합니다.
- Postgres(`events` 테이블) 연결이 설정되지 않으면 이벤트는 202 응답과 함께 드랍되며 콘솔 경고가 출력되므로, 운영 배포 전 `DATABASE_URL`과 초기 스키마를 구성해 주세요.
