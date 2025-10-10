# TELEMETRY_SETUP — 원격 이벤트 인제스트 구성 안내

## 1. 개요
- 목적: `analytics.js`가 내보내는 학습 이벤트를 **자체 수집 API**로 전송하고 Postgres(JSONB)에 저장.
- 클라이언트: `algorithm-game/src/telemetry.js`
  - 배치 전송 (최대 20건/32KB, 5초 주기)
  - 즉시 전송: `algo_run_end`, `no_path_detected`, `tutorial_completed`, `error`
  - `navigator.sendBeacon` → 실패 시 `fetch` fallback
- 서버: `server.js`
  - `POST /v1/events` — 이벤트 인제스트
  - `GET /v1/ingest-token` — TTL 5분의 JWT 발급 (옵션)
  - 정적 자산 제공과 동일한 Node 프로세스에서 동작

## 2. 환경 변수
| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `ENABLE_TELEMETRY` | `true` | `false`로 설정하면 인제스트 라우트를 비활성화 |
| `DATABASE_URL` | (없음) | Postgres 연결 문자열 (예: Railway 제공) |
| `PGSSLMODE` | (없음) | `disable`이면 SSL 비활성화, 그 외에는 `rejectUnauthorized:false`로 연결 |
| `INGEST_SECRET` | (없음) | JWT 서명용 비밀키. 설정 시 Bearer 인증 필수 |
| `INGEST_AUDIENCE` | `ingest` | JWT `aud` 필드 |
| `INGEST_TOKEN_TTL_MS` | `300000` | JWT 만료(ms). 최소 5분 권장 |
| `INGEST_ALLOW_ORIGINS` | 빈 문자열 | CORS 허용 Origin 목록(쉼표 구분). 미설정 시 Same-Origin만 허용 |
| `INGEST_RATE_MAX` | `600` | RateLimit 최대 요청 수(기본 600 req/min) |
| `INGEST_WINDOW_MS` | `60000` | RateLimit 윈도우(ms) |
| `INGEST_REQUIRE_AUTH` | `true` (secret 있을 때) | Bearer 검증 강제 여부 |

## 3. DB 스키마
```sql
CREATE TABLE IF NOT EXISTS events (
  event_id    text PRIMARY KEY,
  ts          timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  type        text NOT NULL,
  session_id  text,
  anon_id     text,
  app_version text,
  env         text,
  page        text,
  lang        text,
  props       jsonb
);

CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events(type, ts);
```
- 보존 정책: 원시 이벤트는 30~90일 보관 후 요약 테이블로 이동 권장.
- 장기 저장 전 교직원/학부모 대상 개인정보 고지 필수.

## 4. 보안 수칙
- Bearer 인증을 사용할 경우, `INGEST_SECRET`은 Railway Variable/Secret으로 관리하고 저장소에 커밋하지 않습니다.
- CORS Origin은 배포 도메인 목록으로 제한 (`https://<your-app>.railway.app` 또는 커스텀 도메인).
- RateLimit 기본값(600 req/min)은 교육용 트래픽에 충분하며, 대규모 공개 시 상향 조정 + IP 기반 추적 필요.
- 서버 로그에는 이벤트 본문 대신 요약(수량/상태)만 남기고, PII는 저장하지 않습니다.

## 5. 운영 체크리스트
1. `DATABASE_URL`/`INGEST_SECRET`/`INGEST_ALLOW_ORIGINS` 설정 후 Railway 재배포.
2. `npm install`로 `express-rate-limit`, `jsonwebtoken`, `pg` 의존성을 설치 → `npm start` 확인.
3. 배포 환경에서 `/v1/ingest-token` 호출해 JWT 확인 (`exp` 5분).
4. 브라우저에서 알고리즘 실행 → 서버 로그/DB에서 이벤트 적재 여부 확인.
5. 실패 시 `docs/DEPLOY_TROUBLESHOOTING.md`에 케이스 기록.

## 6. 향후 과제
- 이벤트 집계 API 또는 Grafana/Metabase 대시보드 연결.
- 익명/세션 ID 재사용 기간 정책 확정 (예: 7일 후 갱신).
- 튜토리얼 완료율, 규칙 실험 횟수 등 주요 KPI 자동 리포트.
