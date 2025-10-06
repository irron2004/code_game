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
- Start Command는 **비워 두고**, Railway가 컨테이너 Entrypoint(`/docker-entrypoint.sh`)를 그대로 실행하도록 설정.

### Docker 배포 시 `npm could not be found`
- 증상: Docker 모드에서 컨테이너 실행 시 `The executable npm could not be found.` 로그가 출력되며 종료.
- 원인: 서비스 Start Command가 `npm start`로 남아 있어 Nginx 기반 컨테이너에서 존재하지 않는 `npm`을 실행하려고 함.
- 해결: Railway → Settings → Start Command 값을 비우거나 컨테이너 기본값으로 되돌립니다.

### Docker 배포 후 접속 링크가 보이지 않는 경우
- 증상: 컨테이너는 정상 기동(nginx 로그 출력)했지만 Railway 대시보드에 “Open App” 링크가 표시되지 않음.
- 원인: Docker 서비스는 자동으로 HTTP 포트를 노출하지 않습니다.
- 해결: Service → **Networking** → **Domains**에서 `Expose Port`를 8080으로 추가하거나 기본 도메인을 생성합니다. 도메인이 연결되면 `https://<서비스명>.up.railway.app` 형태의 링크가 활성화됩니다.

## 체크리스트
- [ ] Railway → Settings → Start Command가 `npm start`인지 확인(이전 `start.sh` 값 제거).
- [ ] `npm install` 후 `npm start`로 로컬에서 정상 기동되는지 확인.
- [ ] 필요 시 `npm test`로 Vitest 스위트를 실행해 코어 로직 검증.

## 참고
- Node 서버는 `server.js`에서 `algorithm-game/` 정적 파일을 서빙합니다.
- 자세한 배포 가이드는 레포지토리 `README.md`의 “Railway 배포” 섹션을 참고하세요.
