# 외부 서비스 계정 매핑

마지막 업데이트: 2026-05-01 (오후 세션 — wallet 충전 + end-to-end 검증 반영)

> ⚠️ 이 문서엔 **시크릿 값(API 키, 비밀번호)을 절대 적지 마세요**. ID, 이메일, URL만 OK.

## 핵심 — 어느 계정에 어떤 게 있는지 (5/1 시점)

| 서비스 | 계정 | 용도 | 결제 모드 | 잔액/한도 |
|---|---|---|---|---|
| **Vercel** | `gksaudrhks12-9858s-projects` (개인 Gmail) | 메인 프로젝트 + AI Gateway 호스트 | Hobby (무료) + AI Gateway 카드 등록 | AI Gateway $4.95 / 월 $5 무료 |
| **GitHub** | `mg1018` (개인) | 코드 레포 owner | 무료 | — |
| **HeyGen** | **`onyooclinic@gmail.com`** ✅ 확인됨 | 영상 생성 + 커스텀 아바타 (`onyoo clinic`) | **wallet (pay-as-you-go)**, subscription 없음 | **$4.97** (5/1 $5 충전 후 검증 1편 차감) |
| **ElevenLabs** | (확인 필요 — 사용자만 알 수 있음) | 음성 합성 한국어 multilingual_v2 | 무료 tier 추정 | TTS/Dubbing 권한 부여, 잔액은 콘솔 |
| **Resend** | `mg1018@whatap.io` (Owner) | 승인 메일 발송 | 무료 tier | 도메인 미인증 — owner 메일만 수신 가능 |
| **Anthropic Claude** | Vercel AI Gateway 경유 | 스크립트 자동 작성 (Sonnet 4.5) | Vercel 결제 | (Vercel AI Gateway $4.95 잔액 공유) |
| **Neon DB** | Vercel-Neon Marketplace 자동 관리 | PostgreSQL | 무료 tier (Vercel 통합) | — |
| **Google Cloud / Drive** | `onyooclinic@gmail.com` | 영상 업로드 (작업 중) | 무료 (개인 Drive 15GB) | OAuth 방식으로 작업 중 |

---

## Vercel

### 계정 3개 (혼동 주의)

| 계정 / 팀 | 상태 | 용도 |
|---|---|---|
| **`gksaudrhks12-9858s-projects`** | ✅ 현재 사용 | onyoo 프로젝트 호스트, 환경변수 보유 |
| `gksaudrhks12-4857s-projects` | ❌ 사용 X | 빈 프로젝트 (이전 잘못된 link 시 생성) |
| `mg1018-whatapios-projects` | ⚠️ 과거 | 이전 회사 팀 (whatap.io) — 더 이상 안 씀 |

### 현재 프로젝트
- **이름**: `v0-new-project-dcjikfknorx` (v0가 자동 생성)
- **URL**: https://vercel.com/gksaudrhks12-9858s-projects/v0-new-project-dcjikfknorx
- **Plan**: Hobby (무료)
- **Plan 한계**: collaborator 추가 불가 (Pro 필요)
- **AI Gateway**: 카드 등록됨, 무료 크레딧 $5/월

### Vercel 통합
- Neon DB Marketplace 연동 (자동 환경변수 동기화)
- Vercel Blob (Public store, 영상/음성 저장)

### 미해결 — Brian 합류
- Brian이 onyooclinic@gmail.com Vercel collaborator 요청
- Hobby라 추가 불가 → 옵션:
  - A. env 파일 안전 공유
  - B. onyooclinic 계정으로 프로젝트 transfer
  - C. Pro 결제 + Team transfer ($20/월)

---

## GitHub

### 계정 3개

| 계정 | 비밀번호 | 용도 |
|---|---|---|
| **`mg1018`** | 알고 있음 (찾음) | onu 레포 **owner**, admin 권한 |
| `mg1018-whatap` | gh CLI 로그인 | 회사 계정, push 권한 (collaborator) |
| `gksaudrhks12-sys` | gh CLI 로그인 | 별개 개인 계정 |

### Repo
- **URL**: https://github.com/mg1018/onu
- **Visibility**: Private
- **Collaborator**: `onyooclinic-eng` (Brian, 초대 발송 완료)

### gh CLI 활성 계정
```bash
gh auth status  # 현재 mg1018-whatap 활성
gh auth switch  # 계정 전환
```

⚠️ **Collaborator 초대는 admin 권한 필요** → `mg1018` 계정에서만 가능 (gh CLI 또는 웹).

---

## HeyGen

### 계정 (5/1 확인됨)
- **Email**: `onyooclinic@gmail.com`
- **First/Last**: onyoo clinic
- **Username**: `52ca73d4f2e84b40a3911731133ed6ae`
- **콘솔**: https://app.heygen.com

### 결제 모드
- **billing_type**: `wallet` (pay-as-you-go, 충전식)
- **subscription**: 없음 (월 정액제 X)
- **auto_reload**: disabled (수동 충전만)
- **잔액 (5/1 세션 종료 시점)**: $4.97 USD
- **충전 이력**: 5/1 $5 top-up (담당자 결제, $0.92 → $5.92)

### 비용 (실측)
- **영상 1편 (한국어, 1080×1920, ~30초)**: ~$0.95
- 월 운영 추정 (주 5~10편): $20~$40

### 자산
- **커스텀 아바타**: `48e30d8627d74f119c27e95fc213a630`
  - 이름: `onyoo clinic`
  - 종류: 학습된 커스텀 아바타 (stock 아님)
  - env 변수: `SEED_HEYGEN_AVATAR_ID`
- Stock avatars: 1283개 / Talking photos: 5474개 (필요 시 대체 가능)

### test 모드 (`test: true`) 정책
- 워터마크 영상 생성. **하지만 wallet 차감은 동일** (무료 아님)
- 5/1 검증에서 확인 — 무료 검증 목적엔 부적합
- 코드는 `test: false` (운영 모드)

### 가격 정보
- 공식 가격 페이지: https://www.heygen.com/api-pricing
- 최소 top-up: $5
- 정액제 plan(Creator/Team)도 있으나 현재 미사용

---

## ElevenLabs

### 계정
- (확인 필요)

### API 키
- 이름: `Menacing Persian Leopard`
- 생성일: 2026-04-25
- 권한: Text-to-speech 등 포함

### Voice IDs

| 사용 | voice_id | 비고 |
|---|---|---|
| 이전 | `s07IwTCOrCDCaETjUVjx` | 초기 stock voice |
| **현재** | `xiljObVlrwnlICRz7xhm` | 새로 작업한 음성 (2026-04-30 적용) |

env 변수: `SEED_ELEVENLABS_VOICE_ID`

### 권한
- TTS (음성 합성) ✅
- Dubbing (다국어 더빙) ✅ — 현재 비활성화 상태

---

## Resend

### 계정
- **Owner 이메일**: `mg1018@whatap.io`
- **수신 가능**: owner 이메일만 (도메인 미인증 상태)

### 발신 설정
- `RESEND_FROM`: `Onyoo <onboarding@resend.dev>` (Resend 무료 발신 도메인)
- 자체 도메인 인증 안 함 (운영 시작 전 필요)

### 운영 전 To-do
- 자체 도메인 인증 → `RESEND_FROM`을 `noreply@onyoo.dev` 같은 형식으로 교체
- 클리닉 `approverEmail`을 원장님 실제 이메일로 변경

---

## Neon DB

### 연동 방식
- **Vercel-Neon Marketplace 통합 자동 관리**
- DATABASE_URL 등 환경변수 자동 동기화

### 위치
- Region: Asia-Southeast (Singapore)
- Database 이름: `neondb`
- User: `neondb_owner`

### 비밀번호 정책
- 직접 접근 X — Neon 콘솔에서 reset 가능
- Reset 시 Vercel env가 자동 동기화됨

### 검증 노트
- 2026-04-29 비밀번호 reset 1회 (시크릿 노출 대응)
- 새 Neon 인스턴스라 매번 `npm run db:push`로 스키마 적용 필요할 수 있음

---

## Anthropic (Claude)

### 사용 여부
- ❌ **현재 사용 X** (Vercel AI Gateway 경유로 Claude 호출)
- 직접 API 키 발급 시도 했으나 무료 크레딧 부족으로 옵션 변경

### Vercel env에 등록된 값
- `ANTHROPIC_API_KEY` 등록되어 있을 수 있음 — 사용 안 함, 그대로 둬도 무해

### 현재 Claude 호출 경로
```
앱 코드 → Vercel AI Gateway → Anthropic Claude
```
- AI Gateway가 인증 + 결제 처리 (Vercel 카드)

---

## Google Cloud / Drive

### 사용 여부 (5/1 변경)
- ⚠️ **현재 우회 중 — OAuth 방식으로 전환 작업 중** (다음 세션 마무리 예정)

### 등록된 자산
- Google Cloud 프로젝트: `onyoo-pipeline` (onyooclinic@gmail.com)
- 서비스 계정: `onyoo-drive-uploader@onyoo-pipeline.iam.gserviceaccount.com` (4/30 만든 것 — 사용 안 함, 폐기 검토)
- Drive 폴더 (이전 세션): `Onyoo Pipeline Output`
- Drive 폴더 (5/1 사용자 제공, OAuth 방식 타겟): `1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV`
  - URL: https://drive.google.com/drive/folders/1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV

### 4/30 service account 방식 보류 이유
- 개인 Gmail 폴더에 서비스 계정 업로드 불가 (Google 정책 2023~ "Service Accounts do not have storage quota")
- 폴더 공유는 가능하지만 실 업로드 시 quota 0으로 거부됨

### 5/1 OAuth refresh token 방식 작업 시작
- 사용자 본인 quota 사용 → 정책 한계 우회
- 추가 비용 0 (Workspace $7.20/월 회피)
- 작성된 도구: `scripts/drive-oauth-init.ts` + `npm run drive:oauth-init`
- 다음 세션 작업: PROGRESS.md TL;DR 6단계 참조

### 현재 워크플로 동작 (Drive 우회 중)
- 클리닉 `driveFolderId: null` 시 Vercel Blob/HeyGen CDN URL을 최종 결과로 처리
- log: `package/info Drive not configured — delivered via Vercel Blob URLs`

---

## 사용 안 하는 옵션 (시도했지만 폐기)

| 시도 | 결과 |
|---|---|
| Anthropic 직접 API | 무료 크레딧 0 → Vercel AI Gateway로 원복 |
| Google Gemini | 카드 없이 무료지만 Vercel AI Gateway 선택해서 미사용 |
| Brian Vercel collaborator 직접 초대 | Hobby 한계 → env 공유 또는 transfer 옵션 검토 중 |
| Vercel Blob private store | 코드가 public 요구 → public store로 재생성 |

---

## 계정 헷갈리지 않게 — 빠른 확인

```bash
# Vercel 현재 로그인 계정
vercel whoami  # gksaudrhks12-9858 여야 정상

# GitHub 현재 활성 계정
gh auth status

# 현재 프로젝트 link 상태
cat .vercel/project.json | grep orgId

# HeyGen 잔액 (시크릿 노출 X — 헤더에만 키 사용)
curl -s -H "X-Api-Key: $HEYGEN_API_KEY" https://api.heygen.com/v1/user/me \
  | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; \
                print(f'wallet \${d[\"wallet\"][\"remaining_balance\"]} ({d[\"wallet\"][\"currency\"]})')"

# Vercel AI Gateway 잔액 — 대시보드에서 확인 (CLI 없음)
# → https://vercel.com/gksaudrhks12-9858s-projects/~/ai
```

---

## 🔄 계정 인계/마이그레이션 가이드

운영 단계 진입 또는 담당자 변경 시 어느 서비스를 어떻게 옮길지.

### 우선순위 분류

| 서비스 | 인계 난이도 | 운영 진입 전 필요? |
|---|---|---|
| GitHub `mg1018` 레포 owner | 쉬움 (collaborator → owner transfer) | 선택 |
| Vercel 프로젝트 (9858 → 회사 팀) | 중간 (Pro 결제 후 transfer 필요) | **권장** |
| Resend (mg1018@whatap.io → 자체 도메인) | 쉬움 (도메인 인증 + RESEND_FROM 변경) | **필수** |
| HeyGen (`onyooclinic@gmail.com`) | 어려움 (계정 자체 이관 X, API 키 재발급으로 대체) | 선택 |
| ElevenLabs | 중간 (계정 정보 + voice ID 인계) | 선택 |
| Google Cloud `onyoo-pipeline` | 중간 (소유자 변경 가능) | OAuth 작업 후 결정 |

### 1. GitHub 레포 (`mg1018/onu`)
- **현재**: `mg1018` 개인 계정 owner
- **Collaborator**: `onyooclinic-eng` (Brian, 초대 발송 완료, 수락 여부 확인 필요)
- **인계 옵션**:
  - A. Collaborator로 push 권한만 부여 (현재)
  - B. 회사 organization 만들어 transfer (Settings → Transfer ownership). admin 권한 그대로 유지하면서 organization 멤버 관리 가능
  - C. private 그대로 vs public 전환 — 시크릿이 git history에 없는지 확인 필요 (현재 .gitignore로 `.env*` 보호됨, history 점검 필요)
- **확인 명령**: `gh repo view mg1018/onu --json visibility,collaborators`

### 2. Vercel 프로젝트 (gksaudrhks12-9858 → 회사 팀)
- **현재**: 개인 Gmail 계정 Hobby 플랜
- **한계**: collaborator 추가 불가 (Pro 필요), 팀 협업 어려움
- **인계 절차**:
  1. 회사 명의 Gmail/이메일로 **Vercel 새 팀 생성** (`onyoo` 같은 슬러그)
  2. 새 팀에서 **Pro 플랜 결제** ($20/월)
  3. 기존 9858 → 새 팀으로 **프로젝트 transfer** (Settings → General → Transfer)
  4. 환경변수도 따라옴 (확인 필요)
  5. Neon DB 연동도 새 팀에 옮겨야 함 (Marketplace 재연결)
- **주의**: Vercel AI Gateway $5/월 무료 크레딧은 새 팀에도 적용됨 (팀 단위)

### 3. Resend (필수)
- **현재**: `mg1018@whatap.io` (개인 회사 계정), 발신은 `onboarding@resend.dev` 무료 도메인
- **운영 전 작업**:
  1. 자체 도메인 확보 (예: `onyoo.dev` 또는 `onyooclinic.com`)
  2. https://resend.com/domains → 도메인 추가 → DNS 레코드 등록 (SPF/DKIM/DMARC)
  3. Vercel env `RESEND_FROM` 변경: `Onyoo <noreply@onyoo.dev>` 같은 형식
  4. clinic 시드의 `approverEmail`도 원장 실제 이메일로 변경
  5. (인계) Resend 계정 owner를 회사 이메일로 변경 또는 새 계정 만들고 API 키 갈아끼기

### 4. HeyGen
- **현재**: `onyooclinic@gmail.com` (Onyoo 전용 — 이미 적절)
- **계정 자체 이관 X**, 다음 옵션:
  - A. 그대로 유지 (운영 진입 시에도 동일 계정)
  - B. 회사 명의로 새 계정 만들고 커스텀 아바타 재학습 + 새 API 키 발급 (시간 소요)
  - C. Team plan 가입 ($179~/월) — multi-seat 가능
- **API 키 인계**: API key를 새 멤버에 공유는 보안 위험 → 각자 이름의 API 키 발급 후 .env 차이로 관리
- **wallet 충전 담당자 변경**: 결제 카드만 담당자 카드로 교체

### 5. ElevenLabs
- **현재**: 계정 이메일 미확인 (사용자 본인만 알 수 있음)
- API 키 이름: `Menacing Persian Leopard` (생성 2026-04-25)
- **인계**:
  - 계정 이메일/비번 공유 (보안 X)
  - 또는 새 계정에서 voice clone 다시 만들고 voice_id 갈아끼기
- voice_id 변경 시 `SEED_ELEVENLABS_VOICE_ID` env 업데이트 + `npm run db:seed`

### 6. Google Cloud (onyoo-pipeline 프로젝트)
- **현재**: `onyooclinic@gmail.com`
- **인계 옵션**:
  - A. IAM에서 새 owner 추가 (Owner role) → 기존 owner 제거 가능
  - B. 프로젝트 자체를 새 organization으로 옮기기 (Workspace 가입 시)
- OAuth 클라이언트는 발급한 프로젝트에 묶임 → 인계 시 새 OAuth 클라이언트 발급이 더 쉬움

### 7. Neon DB
- **인계**: Vercel 프로젝트 transfer 시 자동으로 따라옴 (Marketplace 통합)
- 별도 작업 불필요

---

## 🔑 5/1 시점 사용 중인 모든 키/변수 한눈에 보기

### Vercel env 등록 (Production+Preview+Development 공통)
- `ANTHROPIC_API_KEY` — Anthropic 직접 발급. **현재 사용 X** (AI Gateway 라우팅), 그대로 두면 무해
- `ANTHROPIC_BASE_URL` = `https://api.anthropic.com` — 위와 동일, 사용 X
- `RESEND_API_KEY` — Resend API 키
- `RESEND_FROM` = `Onyoo <onboarding@resend.dev>` — 운영 전 도메인 인증 후 교체
- `ELEVENLABS_API_KEY`
- `SEED_ELEVENLABS_VOICE_ID` = `xiljObVlrwnlICRz7xhm` (5/1 기준 새 voice. PROGRESS의 `s07IwTC...`는 이전 값)
- `HEYGEN_API_KEY` — `sk-...` 형식 아닌 raw 영숫자 54자
- `SEED_HEYGEN_AVATAR_ID` = `48e30d8627d74f119c27e95fc213a630`
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (Public store)
- `VERCEL_OIDC_TOKEN` — AI Gateway 자동 인증용 (Vercel Marketplace 자동 관리)
- `DATABASE_URL` 외 Neon 관련 일체 — Marketplace 자동 동기화

### Vercel env 등록됐으나 미사용
- `GOOGLE_SERVICE_ACCOUNT_JSON` — 4/30 service account 방식 보류
- `SEED_DRIVE_FOLDER_ID` — 빈 문자열 (의도된 우회)

### 다음 세션 추가 예정 (Drive OAuth 작업 후)
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

### 로컬 전용 (.env.development.local — `.gitignore`로 보호)
- `APP_BASE_URL` = `http://localhost:3004`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (4/30 시도 중 박힌 값 — 미사용이지만 교체/제거 권장)

---

## ⚠️ 운영 시작 전 필수 교체 체크리스트

- [ ] **Resend 자체 도메인 인증** + RESEND_FROM 교체 + clinic.approverEmail 원장 실제 이메일로 변경
- [ ] **Google Service Account private key 회전** (5/1 채팅에 노출됨, 테스트용으로 그대로 진행 결정했지만 운영 전엔 필수)
- [ ] **Vercel 회사 팀 transfer** (collaborator 추가 위해 Pro 필요)
- [ ] **HeyGen wallet auto-reload 활성화 검토** (현재 비활성, 운영 시 영상 생성 중간에 잔액 0이면 fail)
- [ ] **GitHub 레포 organization 이관** 또는 collaborator 권한 재정리
- [ ] **케이스 시드 데이터 초기화** (TEST_*, 02 등 검증 케이스 다 정리)
