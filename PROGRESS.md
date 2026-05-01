# 온유 파이프라인 — 진행 상황

마지막 업데이트: 2026-05-01

## 🚀 다음 세션 시작 — 첫 명령부터 따라가는 플랜

**선택된 진행 중 작업**: Drive OAuth refresh token 방식 전환 (사용자 결정 5/1, Option B)
**중단 지점**: `scripts/drive-oauth-init.ts` + `npm run drive:oauth-init` 등록 완료. 사용자의 OAuth 클라이언트 발급 대기.

### 다음 세션 액션 (순서대로 실행)

1. **[Claude] 환경 점검** (시작 직후 자동)
   - `vercel whoami` → `gksaudrhks12-9858` 확인
   - `vercel env ls | grep -i google_oauth` → 새 키 등록됐는지 확인
   - 안 됐으면 → 2번 사용자 안내, 됐으면 → 3번으로

2. **[사용자] Google Cloud OAuth 클라이언트 발급** (선행 시 skip)
   - 본 문서 끝 **"부록 — Google OAuth 클라이언트 발급 가이드"** 참조
   - 결과: `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` 두 값
   - 사용자가 `.env.local`에 직접 박은 뒤 "박았다"고만 알려주면 됨 (시크릿 채팅 노출 금지)

3. **[사용자 + Claude] refresh token 발급**
   - 사용자 명령: `npm run drive:oauth-init`
   - 출력 URL → 사용자 브라우저로 승인 → 콘솔에 refresh_token 표시
   - `.env.local`에 `GOOGLE_OAUTH_REFRESH_TOKEN=...` 추가
   - Vercel env에도 동일 값 등록 (3개 환경)

4. **[Claude] `src/lib/drive.ts` 수정**
   - 현재: `google.auth.GoogleAuth` (service account JSON)
   - 변경: `google.auth.OAuth2(clientId, clientSecret)` + `setCredentials({ refresh_token })`
   - googleapis가 access token 자동 갱신

5. **[Claude] DB 시드**
   - `clinic.drive_folder_id`에 `1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV` 박기 (단일 클리닉이라 직접 update or seed 수정)

6. **[사용자 + Claude] 검증**
   - 새 케이스 등록 → 워크플로 진행 → 사용자 Drive 폴더에 mp4가 들어오는지 확인
   - 성공 시 PROGRESS.md Phase 5 완료 표시

### 보류 / 별도 트랙 (B 끝나면 우선순위 정함)
- **자막 burn-in** (옵션 3 — HeyGen text input + caption:true)
- **번역 자동화 미작동 원인** — pipeline.ts L405 platforms loop 구조 점검
- **결과물 페이지 인라인 플레이어** (`<audio>` / `<video>` controls)
- **Resend 도메인 인증** — 운영 진입 전
- **HeyGen wallet 자동충전 활성화 검토** — 현재 $4.97 / 영상 4편치

### 5/1 검증 산출물 (case 02) — ⚠️ 만료 주의
- **영상 mp4** (HeyGen CDN signed URL): **약 7일 후(2026-05-08 경) 만료** — 다음 세션 진입 전 다운로드 권장
- **음성 mp3** (Vercel Blob): 만료 없음
- 전체 URL: `STATUS_2026-05-01.md` 참조

### 다음 세션 진입 전 체크리스트 (사용자)
- [ ] **case 02 영상 mp4 다운로드** (HeyGen CDN URL은 약 7일 후 만료 — 5/8 경)
- [ ] **담당자에게 짧은 메시지 전달** — `STATUS_2026-05-01.md` 끝의 "📱 카톡/슬랙용 빠른 공유 메시지" 섹션 그대로 복붙
- [ ] **(선택) Google Cloud OAuth 클라이언트 발급** — 다음 세션 첫 작업 단축. 본 문서 끝 "부록 — Google OAuth 클라이언트 발급 가이드" 참조

다음 세션에 Claude에게 한 줄로 시작:
> "PROGRESS.md 읽고 이어서 작업하자"

### 관련 문서 (참조)
| 파일 | 용도 |
|---|---|
| `STATUS_2026-05-01.md` | 담당자(원장/결제/운영) 공유 보고서 + 짧은 메시지 |
| `TEST_LOG_2026-05-01.md` | 5/1 raw 테스트 로그 (케이스 3건 step별 시간/URL/에러 + 디버깅 흐름) |
| `docs/README.md` | 운영 문서 인덱스 |
| `docs/ACCOUNTS.md` | 외부 서비스 계정 매핑 + **계정 인계/마이그레이션 가이드** + 사용 중인 모든 키 일람 (5/1 갱신) |
| `docs/CONFIG.md` | 환경변수 + 코드 설정 매핑 (5/1 갱신) |
| `docs/KNOWN_ISSUES.md` | 미해결 이슈 + 결정 보류 항목 |

## 검증된 파이프라인 흐름 (End-to-End)

```
케이스 등록 (consent 업로드 + DB insert)
   ↓
[Workflow] generateContentPipeline 시작
   ↓
loadCaseData (케이스/클리닉 조회)
   ↓
generateScript (Claude Sonnet 4.5 via AI Gateway, 한국어)  ✅
   ↓
emailApprovalRequest (Resend로 승인 이메일 발송)  ✅
   ↓
[Hook] 사람 승인 대기 → 승인 페이지 → 승인  ✅
   ↓
recordApproval (DB에 승인 결과 기록)
   ↓
generateVoiceover (ElevenLabs TTS → Vercel Blob 업로드)  ✅
   ↓
generateAvatar (HeyGen) — wallet 차감, 한국어 mp4 생성  ✅
   ↓
translate (ElevenLabs Dubbing)  ⚠️ 미호출 — 원인 조사 필요
   ↓
packageToDrive (Google Drive 업로드)  ⏭️ 우회 (driveFolderId null → Blob URL이 최종)
```

## 완료된 작업

### Phase 0 — 인프라
- [x] Next.js 16 (Turbopack) + Workflow 4.2.4 + Drizzle + Neon 연동
- [x] Vercel 프로젝트 연동, `vercel env pull`로 로컬 동기화
- [x] Vercel Blob (consent 파일 + 음성 mp3 저장)
- [x] DB 스키마: cases / clinics / scripts / renders / pipeline_logs

### Phase 1 — 사람 개입 흐름
- [x] **Claude (Anthropic via AI Gateway)** — 한국어 스크립트 자동 생성 (hook + script + hashtags JSON)
- [x] **Resend** — 승인 요청 이메일 발송
  - 발신자 owner: `mg1018@whatap.io` (도메인 미인증, 임시)
  - FROM: `Onyoo <onboarding@resend.dev>`
  - silent failure 방지 위해 `result.error` 체크 추가 (src/lib/email.ts)
- [x] 승인 페이지 (`/approve/[token]`) → hook resolve → 워크플로 재개
- [x] 시드 클리닉 approverEmail 지정 (scripts/seed.ts)
- [x] 워크플로 가드 완화: 단계별 체크로 변경 (clinic 셋업이 부분만 돼도 가능한 단계까지 진행)

### Phase 2 — 음성 합성
- [x] **ElevenLabs TTS** — multilingual_v2 모델, 한국어 합성
- [x] 합성된 mp3 → Vercel Blob 업로드 → URL 반환
- [x] 검증: TEST-015 케이스에서 24초만에 음성 생성 성공

### Phase 5 — Drive 셋업 (보류 — Vercel Blob으로 우회)
- [x] **Google Cloud 프로젝트** `onyoo-pipeline` 생성 (onyooclinic@gmail.com 계정)
- [x] **Google Drive API** 활성화
- [x] **서비스 계정** `onyoo-drive-uploader@onyoo-pipeline.iam.gserviceaccount.com` + JSON 키 발급
- [x] **Drive 폴더** `Onyoo Pipeline Output` 생성 + 서비스 계정 편집자 권한 공유
- ⚠️ **막힘:** 개인 Gmail 계정의 폴더에는 서비스 계정 업로드 불가
  - Google 정책 (2023~): "Service Accounts do not have storage quota"
  - 해결책 1: Google Workspace + Shared Drive ($7.20/월) — production 권장
  - 해결책 2: OAuth refresh token 방식 — 추가 개발 필요
- [x] **결정: 옵션 C — Drive 통합 보류, Vercel Blob URL을 최종 결과로 사용**
  - 워크플로 수정: driveFolderId 미설정 시 Blob URL로 "delivered" 처리
  - 시드 SEED_DRIVE_FOLDER_ID 제거 → 클리닉 driveFolderId null
  - 코드는 그대로 유지 (나중에 Workspace 가입 시 그대로 활성화 가능)
- [x] env 등록 자체는 완료 (`GOOGLE_SERVICE_ACCOUNT_JSON`, `SEED_DRIVE_FOLDER_ID`은 Vercel에 등록됨 — 사용 안 함)

## 다음 작업

### Phase 3 — 영상 생성 ✅ 완료
- [x] **커스텀 아바타 등록**: `onyoo clinic` (`48e30d8627d74f119c27e95fc213a630`)
- [x] Vercel env 등록 (`HEYGEN_API_KEY`, `SEED_HEYGEN_AVATAR_ID`)
- [x] **HeyGen API 키 재확인** — Vercel env에 정상 값 들어가있었음 (PROGRESS.md엔 빈 문자열로 적혀있던 게 부정확). `npm run heygen:check` 통과
- [x] **결제 모드 확인** — `billing_type: wallet` (pay-as-you-go), 구독 없음. 영상 1편당 ~$0.95 차감
- [x] **wallet 충전** — $5 top-up (담당자 결제, 2026-05-01). $0.92 → $5.92 → 검증 후 $4.97
- [x] **end-to-end 검증** — case 02 (`c4b4825f-...`) 한국어 youtube_shorts 1편 정상 delivered (3분 5초 소요)

### Phase 4 — 다국어 더빙 ⚠️ 자동 호출 안 됨
- [x] **ElevenLabs Dubbing API** — 권한 부여 + 코드 작성 완료
- ⚠️ **case 02 검증 시 translate 단계가 호출되지 않음** — `deliverableCount: 1`만 기록 (한국어 1편)
- 원인 후보: pipeline.ts L405 `for (const platform of platforms)` 구조에서 Korean render 후 translate loop 진입 조건 누락 가능성
- **다음 작업**: pipeline.ts 코드 점검 + 1차 fix 후 재검증

### Phase 5 — Drive 패키징 (OAuth 방식으로 전환 작업 중)
- [x] **이전 시도** — service account 셋업 완료, 그러나 개인 Gmail 정책상 업로드 불가 (Option C로 보류했었음)
- [x] **OAuth refresh token 방식 시작 (2026-05-01)** — 사용자 본인 Drive에 직접 업로드. quota 정책 우회
  - [x] `scripts/drive-oauth-init.ts` 추가 + `npm run drive:oauth-init` 명령 등록
  - [ ] Google Cloud Console에서 OAuth Desktop 클라이언트 발급 (사용자 작업)
  - [ ] refresh token 발급 + env 등록
  - [ ] `src/lib/drive.ts` 수정 (service account → OAuth2Client)
  - [ ] DB clinic.drive_folder_id에 `1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV` 박기
  - [ ] 새 케이스 등록 → Drive 업로드 검증

## 정리/개선 거리

### 완료
- [x] **`APP_BASE_URL` env 관리** — `.env.development.local`로 분리. `vercel env pull`이 더 이상 안 지움
- [x] **`failed` 상태 의미 분리** — `pending_setup` enum 추가. 셋업 미완료 종료 시 노란 "셋업 대기" 배지

### 우선순위 중간
- [ ] **Resend 도메인 인증** — 현재 mg1018 owner에만 발송 가능 (정식 운영 전 본인/회사 도메인 인증 필수)
  - 인증 후 RESEND_FROM을 `noreply@onyoo.dev` 같은 형식으로 교체
  - `SEED_APPROVER_EMAIL`도 원장님 실제 이메일로 변경

### 우선순위 낮음
- [ ] **결과물 동선 정리** — 음성/영상 파일 접근 UX 개선
  - 현재: 케이스 상세 로그에 Vercel Blob URL 노출 (긴 URL, 클릭하면 새 탭에서 재생)
  - 개선 아이디어:
    - 케이스 페이지 상단에 "결과물" 섹션 따로 배치 (음성 mp3, 영상 mp4 묶어서)
    - 인라인 `<audio controls>` / `<video controls>` 플레이어로 즉시 재생
    - 다운로드 버튼 + 파일 크기 표시
    - 단계별 Drive 링크가 생기면 그쪽으로 통합
- [ ] **깨진 URL 자동완성** — `/cases/...)로` 형태가 브라우저 히스토리에 캐시됨 (코드 문제 아님)
  - 사용자가 Chrome 주소창 항목 우클릭 → 방문기록에서 삭제로 정리

## 페이지 / URL 경로 맵

기본 dev URL: `http://localhost:3000` (npm run dev 실행 시)
배포 URL: Vercel Production 도메인 (배포 완료 후 확인)

### 사용자(클리닉/원장) 화면

| 경로 | 설명 | 필요한 ID |
|---|---|---|
| `/` | 메인 — 최근 케이스 10개 표시 + 신규 등록 / 전체 목록 진입 | 없음 |
| `/cases` | 전체 케이스 목록 | 없음 |
| `/cases/new` | **새 케이스 등록 폼** (시술 정보 + 환자 정보 + consent 업로드) | 없음 (등록 시 case UUID 자동 생성) |
| `/cases/[id]` | 케이스 상세 — 워크플로 진행 상태, 스크립트, 음성/영상 결과 | `id` = case UUID (등록 직후 redirect로 자동 이동) |
| `/approve/[token]` | 원장 승인 페이지 — 스크립트 검토 후 승인 | `token` = 승인 이메일에 포함된 토큰 (Resend 메일에서 클릭 진입) |
| `/approve/[token]/done` | 승인 완료 안내 화면 | `token` = 위와 동일 |

### 시스템(자동) 엔드포인트 — Vercel Workflow가 호출, 직접 접근 X

| 경로 | 용도 |
|---|---|
| `/.well-known/workflow/v1/flow` | Workflow Framework — flow 정의 노출 |
| `/.well-known/workflow/v1/step` | Workflow step 실행 |
| `/.well-known/workflow/v1/webhook/[token]` | 승인 hook resolve 콜백 |

### ID 형식 (모두 PostgreSQL `uuid` 자동 생성)

- **clinic.id**: seed 시 1회 생성. 현재 시드된 클리닉은 `온유성형외과` 한 개. 정확한 값은 `npm run db:studio` 또는 다음으로 확인:
  ```bash
  cd /Users/hanmyeong-gwan/온유_/onyoo
  npm run db:studio  # 브라우저 → clinics 테이블
  ```
- **case.id**: `/cases/new` 폼 제출 시 자동 생성, 제출 후 `/cases/{id}` 로 자동 이동
- **approval token**: 승인 이메일 발송 시 생성. Resend 이메일 본문 링크에 포함. 직접 알 필요 없음 (이메일에서 클릭만)
- **clinicId 주입**: `/cases/new`는 현재 단일 클리닉 가정. 클리닉 선택 UI 없음 (seed된 첫 클리닉 사용)

### End-to-End 테스트 시나리오 (다음 세션)

1. `npm run dev` → http://localhost:3000 접속
2. 메인에서 **"새 케이스"** 버튼 → `/cases/new`
3. 폼 입력:
   - 시술명, 부위, 환자 이니셜/연령대 등 (필수 필드만 채우면 OK)
   - consent 사진 업로드 (테스트용 더미 이미지)
4. 등록 → 자동으로 `/cases/{id}` 로 이동 → 워크플로 시작 확인
5. 원장 메일함(`mg1018@whatap.io`) 확인 → 승인 메일 수신
6. 메일의 승인 링크 클릭 → `/approve/{token}` → **승인** 버튼
7. 다시 `/cases/{id}` 새로고침하면서 진행 모니터링:
   - script_generated → voice_generated → avatar_generated → translated → **delivered**
8. 결과 확인: 케이스 상세 페이지에 mp3/mp4 Blob URL 표시되면 성공

## 핵심 파일/위치

### 워크플로
- 메인 파이프라인: `src/workflows/pipeline.ts`
- 승인 hook: `recordApproval` step에서 토큰으로 워크플로 재개

### 외부 서비스 어댑터
- `src/lib/email.ts` — Resend
- `src/lib/elevenlabs.ts` — TTS + Dubbing
- `src/lib/heygen.ts` — Avatar 렌더
- `src/lib/drive.ts` — Google Drive 업로드

### UI
- 케이스 등록: `src/app/cases/new/page.tsx`
- 케이스 상세: `src/app/cases/[id]/page.tsx`
- 승인 페이지: `src/app/approve/[token]/page.tsx`
- 서버 액션: `src/app/actions.ts`

### 시드/스키마
- `scripts/seed.ts` — 클리닉 1개 등록 (env로 ID 주입)
- `src/db/schema.ts` — Drizzle 스키마

## 사용 중인 외부 계정

| 서비스 | 계정 | 이전 우선순위 |
|---|---|---|
| Vercel | mg1018-whatapios-projects (whatap.io) | 낮음 (도메인 묶임) |
| Resend | mg1018@whatap.io (Owner) | 중간 (도메인 인증 시 함께 이전) |
| ElevenLabs | (확인 필요) | 중간 |
| Google Cloud / Drive | **onyooclinic@gmail.com** (Onyoo 전용 신규) | — |
| HeyGen | (미생성) — 처음부터 onyooclinic으로 | — |

**이전 계획:**
1. 1단계 (현재): Drive/Cloud + HeyGen은 처음부터 Onyoo 계정으로
2. 2단계: 도메인 확보 후 Resend/ElevenLabs 이전
3. 3단계: Vercel 팀 이전 — onyooclinic@gmail.com으로 새 팀 생성 후 프로젝트 Transfer (현재 mg1018-whatapios-projects 회사 팀 → 신규 `onyoo` 팀)
4. 4단계: 운영 시작 전 결제 정보 통합

## 환경변수 현황

### Vercel 등록 완료 (2026-05-01 시점)
- `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` — 단 코드는 string-based 모델 ID로 AI Gateway 라우팅 (실 결제는 Vercel AI Gateway $5/월 무료 크레딧)
- `RESEND_API_KEY`, `RESEND_FROM` (Onyoo <onboarding@resend.dev>)
- `ELEVENLABS_API_KEY`, `SEED_ELEVENLABS_VOICE_ID` (`s07IwTCOrCDCaETjUVjx`)
- `HEYGEN_API_KEY` ✅ 정상 (이전 PROGRESS.md 기록은 부정확이었음)
- `SEED_HEYGEN_AVATAR_ID` (`48e30d8627d74f119c27e95fc213a630`)
- `BLOB_READ_WRITE_TOKEN`
- `VERCEL_OIDC_TOKEN` — AI Gateway 자동 인증
- `DATABASE_URL` 외 Neon 관련 일체 (Vercel-Neon Marketplace 연동 자동 관리)

### Vercel 등록됐으나 미사용 / 보류
- `SEED_DRIVE_FOLDER_ID` (값 비어있음), `GOOGLE_SERVICE_ACCOUNT_JSON` — service account 방식 보류, OAuth로 전환 작업 중
- (선택) `APP_BASE_URL` (development 환경에서만, 현재 `http://localhost:3004`)

### 추가 예정 (Drive OAuth)
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`

## 검증 케이스 기록

- TEST-014 (eyes): 음성 단계까지 성공 후 avatar에서 의도 종료 — 4:53 PM 시작
- TEST-015 (eyes, 턱끝/코끝): 동일하게 음성 생성 24s, 1m 27s 전체 워크플로 완료 — 4:53~4:55 PM
- ⚠️ 2026-04-29: Vercel 프로젝트 이전 + DB 비밀번호 rotate + 새 Neon DB 생성으로 **기존 케이스 데이터 모두 초기화됨**. 다음 세션부터 새 검증 케이스 기록.

### 2026-05-01 검증 케이스
- **case 02 (`c4b4825f-0325-4aac-9322-07b052007b61`)** — 코성형 / "소진" / nose
  - 단계 시간: script +11s → voice +36s → avatar +138s → delivered. 총 **3분 5초**
  - 결과물: 한국어 youtube_shorts 1편 (1080×1920 mp4)
  - HeyGen mp4 URL: `files2.heygen.ai/...mp4` (signed, 7일 만료)
  - 음성 mp3: Vercel Blob (만료 없음)
  - 자막 SRT: 없음 (audio_url 입력 방식이라 HeyGen이 SRT 미발급)
  - 비용: HeyGen $0.95 + Anthropic ~$0.005
- **case 5c931a8c (TEST_0501_01)** — HeyGen wallet 부족으로 generating_avatar에서 fail (충전 전)
- **case 1f3af067 (TEST_0501)** — 위와 동일 사유 fail

## 2026-04-29 세션 변경 이력

- **Vercel 프로젝트 이전**: `mg1018-whatapios-projects` → `gksaudrhks12-9858s-projects/v0-new-project-dcjikfknorx` (개인 Gmail 계정 / v0 자동 생성 프로젝트)
- **시크릿 rotate**: HeyGen API 키, Neon DB 비밀번호 (둘 다 채팅 노출 후 즉시 무효화 + 재발급)
- **DB 재구축**: 새 Neon 인스턴스에 `npm run db:push`로 스키마 적용, `db:seed`로 클리닉 1개 재생성
- **HeyGen 커스텀 아바타 확인**: `onyoo clinic` 발견 → seed 등록

## 2026-05-01 세션 변경 이력

### 오전 (이전 세션)
- **status enum에 `pending_setup` 추가** — 셋업 미완료로 인한 종료를 `failed`와 분리. 노란 "셋업 대기" 배지로 UI 구분
- **APP_BASE_URL을 `.env.development.local`로 분리** — `vercel env pull`이 더 이상 덮어쓰지 않음
- **Drive 통합 시도 → Option C로 결정** (Phase 5 보류 → 오후에 OAuth로 재시도)
  - 서비스 계정 + 폴더 공유까지 완료했으나 개인 Gmail 정책상 업로드 불가 ("Service Accounts do not have storage quota")
  - 워크플로: `driveFolderId`가 null이면 Blob URL로 "delivered" 처리하도록 수정
- **`scripts/drive-check.ts` 추가** — Drive 통합 단독 검증 스크립트
- **`db:seed` 스크립트 dual env 로드** — `.env.development.local` + `.env.local` 모두 인식
- **케이스 상세 페이지 URL 클릭 가능화**

### 오후 (현재 세션)
- **환경 정리**: Vercel 9858 계정 재로그인 + `v0-new-project-dcjikfknorx` 재link + `vercel env pull` 동기화
- **로컬 포트 고정**: 3000 점유 충돌 회피 위해 `dev` 스크립트를 `next dev -p 3004`로 변경. `APP_BASE_URL`도 3004로 일치
- **외부 서비스 잔액 점검 루틴**: HeyGen `/v1/user/me` (wallet), ElevenLabs `/v1/user/subscription` (권한 부족), Vercel AI Gateway 잔액 ($4.95 / 월 $5 무료 크레딧 사용)
- **AI Gateway 라우팅 확인**: 코드의 `model: "anthropic/claude-sonnet-4-5"` string ID + `VERCEL_OIDC_TOKEN` 으로 Anthropic 직접 호출 우회 → Vercel 결제로 통합
- **HeyGen wallet 충전 $5** (담당자 결제) — $0.92 → $5.92
- **end-to-end 검증 완료** — case 02 한국어 youtube_shorts 1편 정상 delivered (자세한 내용은 위 검증 케이스 섹션)
- **HeyGen `test` flag 변경 흔적**: 디버깅 중 `test: true` 시도했으나 wallet 정책상 동일하게 차단되는 것 확인 → `test: false` 운영 모드 그대로 사용
- **자막 burn-in 옵션 분석** — 현재 audio_url 입력 방식으로는 HeyGen이 SRT 안 줌. 옵션 3 (text input + caption:true) 적용 시 가능 (별도 작업 필요)
- **Drive OAuth 방식 작업 시작** — `scripts/drive-oauth-init.ts` + `npm run drive:oauth-init` 등록. 다음: 사용자 OAuth 클라이언트 발급 후 refresh token 발급 → `src/lib/drive.ts` 코드 변경
- **`STATUS_2026-05-01.md` 추가** — 담당자 공유용 보고서 (스크립트 샘플, 비용, 결정 사항 포함)
- **PROGRESS.md TL;DR 재구성** — "다음 세션 액션" 6단계로 명시. 부록에 OAuth 발급 가이드 첨부

---

## 부록 — Google OAuth 클라이언트 발급 가이드 (다음 세션 사용자 작업)

**전제**: `onyoo-pipeline` Google Cloud 프로젝트 + `onyooclinic@gmail.com` 계정 사용

1. https://console.cloud.google.com → 우측 상단 프로젝트 선택 → **`onyoo-pipeline`** 클릭
2. 좌측 햄버거 → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** 선택 → 만들기
   - App name: `Onyoo Pipeline`
   - User support email + Developer contact email: `onyooclinic@gmail.com`
   - 나머지 필수 아닌 항목 빈 칸 유지 → Save and Continue
   - **Scopes** 단계: "ADD OR REMOVE SCOPES" → `https://www.googleapis.com/auth/drive` 추가 (전체 Drive 권한 — 본인 계정이라 부담 X)
   - **Test users**: `onyooclinic@gmail.com` 추가 (publishing 안 해도 본인 계정만으론 사용 가능)
3. 좌측 **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Desktop app**
   - Name: `onyoo-cli`
   - 만들기 → JSON 다운로드 (또는 client_id / client_secret 복사)
4. `.env.local`에 두 값 추가:
   ```
   GOOGLE_OAUTH_CLIENT_ID=...
   GOOGLE_OAUTH_CLIENT_SECRET=...
   ```
5. Claude에게 "OAuth 클라이언트 박았어"라고 알려주면 → `npm run drive:oauth-init` 실행 안내 받음

**주의**: client_secret은 채팅에 직접 붙여넣지 말고, 다운로드한 JSON 파일에서 본인이 직접 .env.local로 복사. Claude는 시크릿 받지 않음.

---

## 다음 세션 진입 시 첫 인사말 권장 (사용자 → Claude)

> "PROGRESS.md 읽고 이어서 작업하자"

→ Claude가 자동으로 위 6단계 액션 플랜에 따라 환경 점검부터 시작.
