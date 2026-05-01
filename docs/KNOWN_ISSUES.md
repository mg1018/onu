# 미해결 이슈 + 결정 보류 항목

마지막 업데이트: 2026-04-30

## 🚨 현재 막힌 곳

### 1. HeyGen 크레딧 부족 (긴급)

**증상**:
```
HeyGen render failed: MOVIO_PAYMENT_INSUFFICIENT_CREDIT
"This operation requires 'api' credits."
```

**상황**:
- 첫 검증(2026-04-30, 12개 영상 한 번에 생성) 후 무료/시험 크레딧 소진
- 두 번째 검증부터 영상 생성 단계에서 실패

**해결 옵션**:

| 옵션 | 비용 | 검증 가능량 |
|---|---|---|
| A. HeyGen Creator+ Plan | ~$89/월 | ~10건 |
| B. HeyGen Team Plan | ~$179/월 | ~30건 |
| C. API 크레딧 단독 구매 | (가능 여부 확인) | 가변 |
| D. 영상 생성 보류 | $0 | 0건 |

**다음 액션**:
- HeyGen 대시보드에서 현재 크레딧 잔액 + 충전 옵션 확인: https://app.heygen.com/account/balance
- Plan 결정 후 결제 → 즉시 검증 재개 가능

---

## ⏸ 결정 보류 항목

### 2. Brian 합류 — Vercel 접근 권한

**상황**:
- Brian이 자기 맥에서 onyoo 검증 진행 희망
- `onyooclinic@gmail.com`을 Vercel collaborator로 초대 요청
- Vercel **Hobby plan은 collaborator 추가 불가**

**옵션**:

| 옵션 | 비용 | 명관님 접근 | 보안 |
|---|---|---|---|
| A. env 파일 안전 공유 | $0 | 유지 | 1회 노출 위험 |
| B. onyooclinic 계정으로 transfer | $0 | 공용 계정 로그인 시만 | 안전 |
| C. Vercel Pro Team | $20/월 | 정상 collaborator | 가장 안전 |

**현재 상태**:
- GitHub은 collaborator 초대 완료 (`onyooclinic-eng`)
- Vercel은 보류 — 명관님 본인이 검증 진행 중이라 우선순위 낮음

### 3. Drive 통합 — 옵션 C로 우회 결정

**상황**:
- 개인 Gmail 폴더에 서비스 계정 업로드 불가 (Google 정책)
- 검증 단계엔 **Vercel Blob URL이 최종 결과**로 사용 (옵션 C)

**미래 결정**:
- 운영 시 Google Workspace 가입 + Shared Drive ($7.20/월)
- 또는 OAuth refresh token 방식 (개발 추가)
- 또는 Drive 통합 자체 포기

**현재 동작**:
- 클리닉 `driveFolderId: null` → 워크플로가 자동으로 Drive 단계 skip
- "delivered" 상태로 정상 종료

### 4. Resend 도메인 인증

**상황**:
- 현재 `mg1018@whatap.io` 외 다른 이메일로 발송 불가
- 발신 도메인은 Resend 무료 `onboarding@resend.dev` 사용 중

**운영 전 To-do**:
- 자체 도메인(`onyoo.dev` 등) 확보 + Resend 인증
- `RESEND_FROM`을 `noreply@onyoo.dev` 같은 형식으로 교체
- 클리닉 `approverEmail`을 원장님 실제 이메일로 변경

### 5. ElevenLabs 더빙 + 멀티 플랫폼 — 임시 비활성화

**현재**:
- 더빙: 4개 언어 → **0개** (비활성화)
- 플랫폼: 3개 → **1개** (youtube_shorts만)

**미래**:
- 검증 완료 후 환경변수로 켜고 끄기 가능하게 일반화
- 또는 케이스 등록 폼에서 선택 가능하게 UI 확장

---

## ✅ 해결된 이슈 (이번 세션)

### Vercel 잘못된 프로젝트 link
- 원인: `vercel link` 시 새 프로젝트 자동 생성 (4857 계정)
- 해결: `rm -rf .vercel` 후 `--project v0-new-project-dcjikfknorx` 명시

### Vercel Blob private store 에러
- 원인: 새 store가 private 모드, 코드는 public 요구
- 해결: 기존 store 삭제 후 public store 재생성 (access mode는 사후 변경 불가)

### AI Gateway 카드 등록 필요
- 원인: Vercel AI Gateway 무료 크레딧도 카드 등록 필수
- 해결: 카드 등록 (실제 청구는 한도 초과 시만)

### Resend "whatap.io 도메인 미인증" 에러
- 원인: `RESEND_FROM`에 `mg1018@whatap.io` 잘못 설정
- 해결: `Onyoo <onboarding@resend.dev>`로 변경 (Resend 무료 발신 도메인)

### Anthropic 무료 크레딧 부족
- 시도: 직접 Anthropic API 사용 → 신규 가입도 크레딧 거의 없음
- 해결: Vercel AI Gateway로 원복 (카드 등록 후)

### 시크릿 채팅 노출 (2회)
- 원인: `.env.local` 내용 그대로 채팅 공유
- 해결: HeyGen 키 + Neon DB 비밀번호 즉시 rotate
- 예방: 변수명만 출력하는 명령 사용 (`grep -E '^[A-Z_]+=' .env.local | cut -d= -f1`)

### 워크플로 step 실행 안 됨
- 원인: `npm run workflow:web`을 별도 터미널에서 실행 안 함
- 해결: 두 서버 동시 실행 필요 (dev + workflow:web)

### 승인 메일 silent fail (이전 세션)
- 원인: Resend `result.error` 체크 누락
- 해결: `src/lib/email.ts`에 에러 체크 추가

### 승인 버튼 더블 클릭 방지
- 원인: 클라이언트 측 즉시 disabled 안 됨
- 해결: `useFormStatus`로 pending 상태 추적, `buttons.tsx` 클라이언트 컴포넌트 도입

---

## 다음 세션 시작 시 체크리스트

### 진입 전 확인
- [ ] `vercel whoami` → `gksaudrhks12-9858` 인지
- [ ] `gh auth status` → 적절한 계정인지
- [ ] HeyGen 크레딧 결정 — 결제 했나? 보류 중인가?

### 검증 재개 시 (HeyGen 결제 후)
- [ ] Vercel 환경변수 최신 — `vercel env pull .env.local`
- [ ] DB 시드 최신 — `npm run db:seed`
- [ ] 두 서버 동시 실행 — `npm run dev` + `npm run workflow:web`
- [ ] 새 케이스 등록 → 한국어 youtube_shorts 1개 영상 + 새 voice 검증
- [ ] 영상 + 음성 품질 확인

### 검증 5건 완료 후
- [ ] 더빙 + 멀티 플랫폼 다시 활성화 (코드 또는 env 토글)
- [ ] PROGRESS.md에 검증 결과 기록
- [ ] Brian 합류 옵션 결정 (env 공유 / transfer / Pro)
- [ ] 운영 진입 결정 (계속 / 보류)

### 운영 진입 시
- [ ] Resend 자체 도메인 인증
- [ ] approverEmail 원장님 실제 이메일로 변경
- [ ] 클리닉 등록 폼 (현재는 단일 클리닉 시드만 됨)
- [ ] HeyGen Plan 결정 (Creator+ vs Team)
- [ ] Drive 통합 결정 (Workspace 가입 / OAuth / 미사용)

---

## 참고 — 이번 세션 이전 결정 사항

이전 세션의 PROGRESS.md 결정:
- **옵션 C (Drive 우회)** — Vercel Blob URL 사용
- **이전 계획**: 1단계 (Onyoo 계정으로 신규 서비스) → 2단계 (도메인 후 Resend/ElevenLabs 이전) → 3단계 (Vercel Team 이전) → 4단계 (결제 통합)
