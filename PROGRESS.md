# 온유 파이프라인 — 진행 상황

마지막 업데이트: 2026-04-29

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
generateAvatar (HeyGen) — heygenAvatarId 없으면 skip 후 failed  ⏳
   ↓
translate (ElevenLabs Dubbing)  ⏳
   ↓
packageToDrive (Google Drive 업로드)  ⏳
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

### Phase 3 — 영상 생성 (셋업 완료, 검증 대기)
- [x] **HeyGen 셋업 완료** (2026-04-29)
  - HeyGen 계정 + API 키 발급/등록 (`HEYGEN_API_KEY`)
  - **커스텀 아바타 이미 학습돼 있음**: `onyoo clinic` (`48e30d8627d74f119c27e95fc213a630`)
  - heygen-check 통과: stock 1283개, talking photos 5474개 접근 가능
  - Vercel env + 클리닉 DB 모두 등록 완료
- [ ] **워크플로 실증 검증** — 다음 세션에서 end-to-end 테스트
  - generateAvatar → waitForHeyGen → mp4 URL 반환 확인
  - 더빙(Phase 4) → "delivered" 도달까지 (Drive 우회)

### Phase 4 — 다국어 더빙
- [ ] **ElevenLabs Dubbing API** — 한국어 mp4 → en/ja/zh 번역
  - 권한 이미 부여됨 (현재 API 키에 더빙 읽기/작성)
  - HeyGen 결과물(mp4)이 있어야 더빙 가능 → Phase 3 의존
  - 워크플로 코드는 이미 작성돼있음 (src/workflows/pipeline.ts)

### Phase 5 — Drive 패키징 (셋업 완료, 검증 대기)
- [x] 셋업 — Phase 5 완료 항목 참조
- [ ] 실제 업로드 검증 — HeyGen 영상 생성 후 가능

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

### Vercel 등록 완료 (2026-04-29 시점)
- `RESEND_API_KEY`, `RESEND_FROM` (Onyoo <onboarding@resend.dev>)
- `ELEVENLABS_API_KEY`, `SEED_ELEVENLABS_VOICE_ID` (`s07IwTCOrCDCaETjUVjx`)
- `HEYGEN_API_KEY`, `SEED_HEYGEN_AVATAR_ID` (`48e30d8627d74f119c27e95fc213a630`) ✅
- `BLOB_READ_WRITE_TOKEN`
- `DATABASE_URL` 외 Neon 관련 일체 (Vercel-Neon Marketplace 연동 자동 관리)

### Vercel 미등록 / 사용 안 함
- `SEED_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY` — Drive 우회로 미사용
- (선택) `APP_BASE_URL` (development 환경에서만)

## 검증 케이스 기록

- TEST-014 (eyes): 음성 단계까지 성공 후 avatar에서 의도 종료 — 4:53 PM 시작
- TEST-015 (eyes, 턱끝/코끝): 동일하게 음성 생성 24s, 1m 27s 전체 워크플로 완료 — 4:53~4:55 PM
- ⚠️ 2026-04-29: Vercel 프로젝트 이전 + DB 비밀번호 rotate + 새 Neon DB 생성으로 **기존 케이스 데이터 모두 초기화됨**. 다음 세션부터 새 검증 케이스 기록.

## 2026-04-29 세션 변경 이력

- **Vercel 프로젝트 이전**: `mg1018-whatapios-projects` → `gksaudrhks12-9858s-projects/v0-new-project-dcjikfknorx` (개인 Gmail 계정 / v0 자동 생성 프로젝트)
- **시크릿 rotate**: HeyGen API 키, Neon DB 비밀번호 (둘 다 채팅 노출 후 즉시 무효화 + 재발급)
- **DB 재구축**: 새 Neon 인스턴스에 `npm run db:push`로 스키마 적용, `db:seed`로 클리닉 1개 재생성
- **HeyGen 검증 완료**: 커스텀 아바타 `onyoo clinic` 발견 → seed 등록
