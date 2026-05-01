# 외부 서비스 계정 매핑

마지막 업데이트: 2026-04-30

> ⚠️ 이 문서엔 **시크릿 값(API 키, 비밀번호)을 절대 적지 마세요**. ID, 이메일, URL만 OK.

## 핵심 — 어느 계정에 어떤 게 있는지

| 서비스 | 계정 | 용도 | 결제 |
|---|---|---|---|
| **Vercel** | `gksaudrhks12-9858s-projects` (개인) | 메인 프로젝트 + AI Gateway | 카드 등록됨 |
| **GitHub** | `mg1018` (개인) | 코드 레포 owner | 무료 |
| **HeyGen** | (확인 필요) | 영상 생성 + 커스텀 아바타 | **크레딧 부족 — 결제 필요** |
| **ElevenLabs** | (확인 필요) | 음성 합성 + voice clone | 무료 tier |
| **Resend** | mg1018@whatap.io (Owner) | 승인 메일 발송 | 무료 tier |
| **Neon DB** | Vercel-Neon 연동 자동 관리 | PostgreSQL | 무료 tier (Vercel 통합) |

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

### 계정
- (확인 필요) — Vercel env에 등록된 `HEYGEN_API_KEY` 발급한 계정

### 자산
- **커스텀 아바타**: `48e30d8627d74f119c27e95fc213a630`
  - 이름: `onyoo clinic`
  - 종류: 학습된 커스텀 아바타 (stock 아님)
  - env 변수: `SEED_HEYGEN_AVATAR_ID`

### 검증 시 발견된 정보 (heygen-check 출력)
- Stock avatars: 1283개 사용 가능
- Talking photos: 5474개

### ⚠️ 현재 막힌 부분 — 크레딧 부족
- 첫 검증(12개 영상) 후 API 크레딧 소진
- 에러: `MOVIO_PAYMENT_INSUFFICIENT_CREDIT`
- 해결: HeyGen plan 업그레이드 또는 API 크레딧 충전
- HeyGen Pricing: https://www.heygen.com/pricing

### Plan 옵션 (참고)
| Plan | 월 비용 | API 크레딧 |
|---|---|---|
| Free | $0 | 거의 없음 |
| Creator+ | $89~ | 30 |
| Team | $179~ | 90 |

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

### 사용 여부
- ❌ **사용 X** (옵션 C — Drive 우회 결정)

### 등록된 자산 (사용 안 함)
- Google Cloud 프로젝트: `onyoo-pipeline` (onyooclinic@gmail.com)
- 서비스 계정: `onyoo-drive-uploader@onyoo-pipeline.iam.gserviceaccount.com`
- Drive 폴더: `Onyoo Pipeline Output`
- env 변수 `GOOGLE_SERVICE_ACCOUNT_JSON`은 등록만 됨

### 우회 이유
- 개인 Gmail 폴더에 서비스 계정 업로드 불가 (Google 정책 2023~)
- 해결책: Workspace 가입 + Shared Drive ($7.20/월) — 운영 시 결정

### 현재 동작
- 클리닉 `driveFolderId: null` 시 Vercel Blob URL을 최종 결과로 사용
- 워크플로 코드는 그대로 유지 (env 다시 채우면 활성화)

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
```
