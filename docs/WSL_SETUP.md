# WSL 개발 환경 설정 가이드

이 문서는 WSL(Ubuntu)에서 실제 제품인 Node 정적 앱을 실행하는 방법을 설명합니다.
Python 관련 명령은 제품 런타임이 아닌 루트 헬스체크 스텁을 수정할 때만 사용합니다.

## 🚀 빠른 시작

### 1. WSL 환경 확인
```bash
# Windows PowerShell에서 배포판 확인
wsl --list --verbose

# 설치된 배포판 시작
wsl -d Ubuntu-24.04
```

### 2. 프로젝트 위치
- 체크아웃 위치는 자유롭게 정하되, 아래 명령은 저장소 루트(`code_game/`)에서 실행합니다.
- NTFS 마운트보다 WSL 파일시스템의 worktree가 파일 I/O와 패키지 설치에 유리합니다.

### 3. 제품 설치·검증
```bash
npm ci
npm run check
npm start
```

`npm start`의 기본 주소는 `http://localhost:8080`입니다.

## 🛠️ 수동 설정

### 1. WSL 환경 최적화
```bash
# WSL 설정 파일 생성
sudo tee /etc/wsl.conf > /dev/null << 'EOF'
[interop]
appendWindowsPath = false

[network]
generateHosts = true
generateResolvConf = true
EOF

# WSL 재시작
wsl --shutdown
```

### 2. Python 스텁용 패키지 설치(선택)
```bash
sudo apt update
sudo apt install -y build-essential python3-venv python3-pip git openssh-client \
    pkg-config libffi-dev libssl-dev curl
```

### 3. Python 가상환경 설정
```bash
# 가상환경 생성
python3 -m venv .venv
source .venv/bin/activate

# 제품과 무관한 Python 헬스체크 스텁 의존성 설치
pip install --upgrade pip setuptools wheel
pip install -e ".[dev]"
```

### 4. Git 설정
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# Git 전역 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📋 사용 가능한 명령어

### Makefile 명령어(Python 스텁)
```bash
make help          # 도움말 보기
make bootstrap      # 개발 환경 설정
make dev           # 개발 서버 시작
make test          # 테스트 실행
make lint          # 코드 린팅
make fmt           # 코드 포맷팅
make clean         # 임시 파일 정리
make up            # Docker 서비스 시작
make down          # Docker 서비스 중지
```

### 개발 워크플로우
```bash
# 1. 개발 환경 설정
make bootstrap

# 2. 개발 서버 시작
make dev

# 3. 테스트 실행
make test

# 4. 코드 품질 검사
make check

# 5. CI 로컬 실행
make ci
```

## 🔧 개발 도구

### 설치된 도구들
- **Python**: 3.10 이상(스텁 수정 시에만 필요)
- **pytest**: 테스트 프레임워크
- **black**: 코드 포맷터
- **isort**: import 정렬
- **ruff**: 빠른 린터
- **mypy**: 타입 체커
- **pre-commit**: Git 훅 관리

### 설정 파일들
- `pyproject.toml`: Python 의존성·도구 설정의 캐노니컬 소스
- `.pre-commit-config.yaml`: pre-commit 설정
- `requirements.in`: `pyproject.toml`의 dev extra를 가리키는 pip-tools 입력
- `Makefile`: 개발 명령어
- `docker-compose.yml`: 로컬 서비스

## 🐳 Docker 개발 환경

### 서비스 시작
```bash
# 모든 서비스 시작
make up

# 서비스 로그 확인
make logs

# 서비스 중지
make down
```

### 포함된 서비스
- **app**: 메인 애플리케이션 (포트 8080)
- **postgres**: PostgreSQL 데이터베이스 (포트 5432)
- **redis**: Redis 캐시 (포트 6379)

## 🧪 테스트

### 테스트 실행
```bash
# 모든 테스트
make test

# 특정 테스트
.venv/bin/python -m pytest tests/test_health.py -v

# 커버리지 포함
pytest tests/ --cov=src --cov-report=html
```

### 테스트 종류
- **단위 테스트**: `@pytest.mark.unit`
- **통합 테스트**: `@pytest.mark.integration`
- **느린 테스트**: `@pytest.mark.slow`

## 🔍 코드 품질

### 린팅 및 포맷팅
```bash
# 코드 포맷팅
make fmt

# 포맷팅 검사
make fmt-check

# 린팅 실행
make lint

# pre-commit 실행
make pre-commit
```

## 🚀 CI/CD

### GitHub Actions 워크플로우
- **ci-python.yml**: Python 테스트 및 린팅
- **ci-node.yml**: Node.js 정적 앱·Express 서버 검사
- **docker.yml**: Docker 이미지 빌드 및 푸시

### 로컬 CI 실행
```bash
# CI 체크 로컬 실행
make ci
```

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. 권한 문제
```bash
# SSH 키 권한 설정
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

#### 2. 가상환경 문제
```bash
# 기존 가상환경을 지우는 작업은 사용자 승인 후 수행
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

#### 3. Git 인증 문제
```bash
# SSH 연결 테스트
ssh -T git@github.com

# Git URL 확인
git remote -v
```

#### 4. WSL PATH 문제
```bash
# PATH 확인
echo $PATH

# Windows 경로가 섞여있다면 WSL 재시작
wsl --shutdown
```

## 📚 추가 리소스

- [WSL 공식 문서](https://docs.microsoft.com/en-us/windows/wsl/)
- [Python 가상환경 가이드](https://docs.python.org/3/tutorial/venv.html)
- [pytest 문서](https://docs.pytest.org/)
- [pre-commit 문서](https://pre-commit.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성: `git switch -c feat/amazing-feature`
3. 변경사항 커밋: `git commit -m 'Add amazing feature'`
4. 브랜치 푸시: `git push origin feat/amazing-feature`
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
