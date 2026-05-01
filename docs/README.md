# 온유 파이프라인 문서

핵심 운영 정보 모음. 새 세션 시작 또는 다른 사람 합류 시 이 폴더부터 읽으세요.

## 파일 구성

| 파일 | 내용 | 언제 보나 |
|---|---|---|
| **[ACCOUNTS.md](ACCOUNTS.md)** | 외부 서비스 계정 매핑 (Vercel/GitHub/HeyGen/ElevenLabs/Resend/Neon 등) | 어느 계정에 뭐가 있는지 헷갈릴 때 |
| **[CONFIG.md](CONFIG.md)** | 환경변수 + 클리닉 시드 + 코드 변경 사항 | 셋업할 때, 변수 갱신할 때 |
| **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)** | 미해결 이슈 + 결정 보류 + 해결된 이슈 기록 | 막힐 때, 무엇이 결정 보류인지 확인할 때 |
| **[../PROGRESS.md](../PROGRESS.md)** | 전체 파이프라인 진행 상황 + 페이지 경로 가이드 | 어디까지 검증됐는지, 페이지 URL 어떤지 |

## 빠른 진입 가이드

### 새 세션 시작
1. **PROGRESS.md** 마지막 섹션 — 현재까지 진행 상황
2. **KNOWN_ISSUES.md** 상단 — 막힌 곳 + 다음 세션 체크리스트
3. **ACCOUNTS.md** — 어느 계정 사용 중인지 빠른 확인

### 환경 셋업 (다른 컴퓨터로 옮길 때)
1. `git clone https://github.com/mg1018/onu`
2. `npm install`
3. **CONFIG.md** 보고 환경변수 셋업
4. `vercel link` (단, **9858 계정** 사용)
5. `vercel env pull .env.local`
6. `npm run db:push` (스키마 적용)
7. `npm run db:seed`
8. `npm run dev` + 별도 터미널 `npm run workflow:web`

### 막혔을 때
1. **KNOWN_ISSUES.md** — 같은 이슈가 이미 정리됐나
2. dev 서버 콘솔 + workflow web UI(http://localhost:3456) 양쪽 확인
3. 시크릿 노출 주의 — 변수명만 출력하는 안전한 명령 사용

## 절대 금지

- ❌ `.env.local` 파일을 채팅/이메일/Slack에 공유
- ❌ `cat .env.local` 결과를 채팅에 붙이기
- ❌ `grep -E '^.+=.+' .env.local` 같이 값을 출력하는 명령 결과 공유
- ❌ `.env*` 파일을 git에 커밋

## 안전한 변수 확인 방법

```bash
# 변수명만 출력 (값 X)
grep -E '^[A-Z_]+=' .env.local | cut -d= -f1

# 특정 변수 존재 여부만 (개수)
grep -c '^HEYGEN_API_KEY=' .env.local

# vercel env pull 출력은 안전 (변수명만 보임)
vercel env pull .env.local
```
