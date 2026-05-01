# 환경변수 + 설정 매핑

마지막 업데이트: 2026-05-01 (오후 — 5/1 검증 후 dev 포트/voice ID/heygen 결제 정보 갱신)

> ⚠️ 이 문서엔 **시크릿 값을 적지 마세요**. 변수 이름 + 어디서 발급받는지만 기록.

> 📌 **계정/마이그레이션 정보는 [ACCOUNTS.md](ACCOUNTS.md)** 에 정리. 이 문서는 env 변수 + 코드 설정 위주.

## Vercel 환경변수 매핑

### 자동 관리 (Marketplace 연동) — 손대지 말 것

| 변수 | 발급처 | 비고 |
|---|---|---|
| `DATABASE_URL` | Vercel-Neon 연동 | pooled connection |
| `DATABASE_URL_UNPOOLED` | Vercel-Neon 연동 | unpooled |
| `POSTGRES_*` | Vercel-Neon 연동 | 추가 별칭들 |
| `NEON_PROJECT_ID` | Vercel-Neon 연동 | |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (Public store) | |
| `VERCEL_OIDC_TOKEN` | Vercel | AI Gateway 인증용 |

→ 위 변수들은 Vercel Marketplace에서 자동으로 채워줍니다. **수동으로 수정 금지**.

### 수동 등록 (Sensitive OFF + All Environments)

| 변수 | 발급처 | 값 형식 예 |
|---|---|---|
| `HEYGEN_API_KEY` | https://app.heygen.com/settings?nav=API | 긴 영숫자 |
| `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys | 긴 영숫자 |
| `RESEND_API_KEY` | https://resend.com/api-keys | `re_...` |
| `RESEND_FROM` | (직접 작성) | `Onyoo <onboarding@resend.dev>` |
| `SEED_HEYGEN_AVATAR_ID` | HeyGen 학습 후 발급 | `48e30d8627d74f119c27e95fc213a630` |
| `SEED_ELEVENLABS_VOICE_ID` | ElevenLabs voice clone | `xiljObVlrwnlICRz7xhm` |

### 사용 안 하는 변수 (등록만 됨)
- `GOOGLE_SERVICE_ACCOUNT_JSON` — Drive 우회로 미사용
- `ANTHROPIC_API_KEY` — Vercel AI Gateway 사용으로 미사용

### 미등록 (선택사항) / 로컬 전용
- `APP_BASE_URL` — 승인 메일 링크용 base URL. dev 시 **`http://localhost:3004`** (5/1 포트 변경). `.env.development.local`에 분리 저장 (vercel env pull로 안 덮어쓰임).
- `SEED_APPROVER_EMAIL` — 클리닉 approverEmail. 미설정 시 코드 기본값(`mg1018@whatap.io`).
- `SEED_DRIVE_FOLDER_ID` — Drive 폴더. **5/1 기준 빈 문자열** (Drive 우회). OAuth 작업 후 `1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV`로 채울 예정.

### 다음 세션 추가 예정 (Drive OAuth 작업)
- `GOOGLE_OAUTH_CLIENT_ID` — Google Cloud Console에서 발급
- `GOOGLE_OAUTH_CLIENT_SECRET` — 위 클라이언트의 secret
- `GOOGLE_OAUTH_REFRESH_TOKEN` — `npm run drive:oauth-init`로 발급

## 클리닉 시드 데이터

### 현재 시드된 클리닉 (5/1 기준)

| 필드 | 값 |
|---|---|
| id | `95e1e1a5-7392-40da-91a2-1b818d43b521` |
| name | 온유성형외과 |
| heygenAvatarId | `48e30d8627d74f119c27e95fc213a630` |
| elevenlabsVoiceId | `xiljObVlrwnlICRz7xhm` (2026-04-30 변경) |
| approverEmail | mg1018@whatap.io |
| driveFolderId | `null` (Drive 우회 — OAuth 작업 후 `1T_lXT_otiNBiTlgrnunZI_4P_cvilJXV`로 변경 예정) |

### 클리닉 ID 확인 방법
```bash
cd /Users/hanmyeong-gwan/온유_/onyoo
npm run db:studio
# 브라우저에서 clinics 테이블 보기
```

또는 케이스 상세 페이지 URL이 `/cases/{case_id}` — case_id에서 clinic 역참조 가능 (DB Studio에서).

### 시드 재실행 (값 변경 후)
```bash
npm run db:seed
```
→ 새 값으로 클리닉 갱신.

## 코드 변경 사항 (이번 세션 적용)

### `src/workflows/pipeline.ts`

| 변경 | 이전 | 현재 |
|---|---|---|
| 더빙 언어 | `["en", "ja", "zh"]` | `[]` (비활성화) |
| 플랫폼 | `["tiktok", "youtube_shorts", "instagram_reels"]` | `["youtube_shorts"]` |
| Claude 모델 호출 | AI Gateway syntax | (그대로 유지) |

검증 끝나면 다국어 + 멀티 플랫폼은 환경변수로 켜는 형태로 일반화 권장.

### 승인 페이지 더블 클릭 방지 — `src/app/approve/[token]/`

**새 파일**: `buttons.tsx` — 클라이언트 컴포넌트, `useFormStatus`로 pending 상태 추적

**수정**: `page.tsx` — 인라인 button 대신 `<ApprovalButtons />` 컴포넌트 사용

**수정**: `src/app/actions.ts`의 `submitApproval` — 이미 처리된 요청은 throw 대신 done 페이지로 redirect

### 패키지 추가
- `@ai-sdk/anthropic` — 시도 후 미사용. 제거해도 OK:
  ```bash
  npm uninstall @ai-sdk/anthropic
  ```

## 로컬 개발 환경 변수 동기화

### 1. Vercel에서 로컬로 가져오기
```bash
cd /Users/hanmyeong-gwan/온유_/onyoo
vercel env pull .env.local
```

### 2. 변수 존재 확인 (안전, 값 노출 없음)
```bash
grep -E '^[A-Z_]+=' .env.local | cut -d= -f1
```

### 3. 특정 변수 갱신 여부만 확인
```bash
grep -c '^HEYGEN_API_KEY=' .env.local  # 있으면 1, 없으면 0
```

⚠️ **`cat .env.local` 또는 grep으로 값을 출력하지 마세요** — 시크릿 노출.

## 두 서버 동시 실행 필요

| 명령 | 역할 | 포트 |
|---|---|---|
| `npm run dev` | Next.js 앱 | **3004** (5/1 고정 — `next dev -p 3004`) |
| `npm run workflow:web` | Workflow runtime | 3456 |

⚠️ **둘 다 켜져 있어야 워크플로 정상 동작**. workflow:web 안 켜면 step 실행 안 됨.

⚠️ **5/1 변경**: 다른 프로젝트(name_card)가 3000을 점유한 환경에서 `next dev` 자동 할당이 어긋나 `APP_BASE_URL` 미스매치 발생 → 결정적으로 3004로 박음. 운영(Vercel) 환경엔 영향 없음.

### 서버 재시작이 필요한 경우
- 환경변수 변경 후 (`vercel env pull` 한 후)
- 코드 변경 후 (Next.js HMR로 일부 반영되지만 워크플로/액션은 재시작 안전)
- DB 스키마 변경 후 (`db:push` 후)

## DB 마이그레이션

### 스키마 적용 (새 DB 또는 schema 변경 시)
```bash
npm run db:push
```

### Drizzle Studio (DB 직접 보기)
```bash
npm run db:studio
```
브라우저로 표 형태로 데이터 확인 가능.

### 시드 (클리닉 데이터 갱신)
```bash
npm run db:seed
```

## 검증 명령

```bash
# HeyGen 연결 + 사용 가능 아바타 목록
npm run heygen:check

# Drive 연결 (우회 모드라 별 의미 없음)
npm run drive:check

# 워크플로 framework 헬스
npm run workflow:health
```
