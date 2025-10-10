# 학습 지표(로컬 로깅)

## 이벤트(콘솔/로컬)
- `level_loaded` {cols, rows, source?}
- `level_saved` {cols, rows, size, source, timestamp}
- `algo_run` {algorithm, allowDiagonal, useWeights, trigger}
- `algo_run_end` {runId, durationMs, result, pathLength, visited, frontier, cost, algorithm, allowDiagonal, useWeights, trigger, gridCols, gridRows}
- `no_path_detected` {blockedCells, unreachable}
- `rule_toggle` {rule, value}

브라우저 콘솔에 `[analytics] eventName` 포맷으로 출력되며, `algorithm-game/src/analytics.js`에서 후속 연동(예: 원격 전송)을 위한 subscriber를 연결할 수 있습니다.

## 원격 수집 파이프라인
- 클라이언트는 `algorithm-game/src/telemetry.js`를 통해 `/v1/events`로 배치 전송(최대 20건/32KB, 5초 주기)하며, `algo_run_end`, `no_path_detected` 등은 즉시 `sendBeacon`으로 전송됩니다.
- `/v1/ingest-token`에서 TTL 5분의 JWT를 발급받아 `Authorization: Bearer` 헤더에 첨부합니다(환경 변수 `INGEST_SECRET` 설정 시 필수).
- 서버는 `server.js`에서 Rate-Limit(기본 600 req/min)와 Origin 화이트리스트(`INGEST_ALLOW_ORIGINS`)를 적용하고, Postgres(`DATABASE_URL`)의 `events` 테이블(JSONB)로 저장합니다. 미설정 시 수집은 허용되지만 저장되지 않으며 콘솔로 안내됩니다.

## KPI(수동 측정/파일럿)
- 세션당 규칙 변경 횟수
- 알고리즘 전환 후 재실행 비율
- 경로 없음 → 해결까지 시도 횟수
