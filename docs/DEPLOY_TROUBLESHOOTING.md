# Railway 배포 트러블슈팅

## 증상
Railway에서 자동 감지(Launchpad/Railpack)로 배포 시 다음 오류가 발생했습니다.

- `Script start.sh not found`
- `Railpack could not determine how to build the app`

### 원인
- 서비스 Start Command가 `start.sh`로 지정되어 있으나 레포지토리에 해당 스크립트가 없음.
- 레포지토리에 문서와 정적 자산만 존재해 언어/빌드 방식을 감지할 단서(`package.json`, `Staticfile`, Dockerfile 등)가 없었음.

## 해결 방법
### 1) Node 정적 서버 도입(권장)
- 루트에 `package.json`, `server.js`를 추가하고 `algorithm-game/` 폴더를 Express 정적 서버로 서빙.
- Railway Start Command를 `npm start`로 설정하거나 값 제거(기본값 사용) 후 재배포.
- 로컬 검증: `npm install && npm start` → `http://localhost:8080`.

### 2) Docker 배포 유지
- 이미 포함된 `Dockerfile`을 선택해 배포하거나, Railway에서 Docker 모드를 사용해 빌드.
- Start Command는 비워 두고, Railway가 컨테이너 Entrypoint를 그대로 실행하도록 설정.

## 체크리스트
- [ ] Railway → Settings → Start Command가 `npm start`인지 확인(이전 `start.sh` 값 제거).
- [ ] `npm install` 후 `npm start`로 로컬에서 정상 기동되는지 확인.
- [ ] 필요 시 `npm test`로 Vitest 스위트를 실행해 코어 로직 검증.

## 참고
- Node 서버는 `server.js`에서 `algorithm-game/` 정적 파일을 서빙합니다.
- 자세한 배포 가이드는 레포지토리 `README.md`의 “Railway 배포” 섹션을 참고하세요.
