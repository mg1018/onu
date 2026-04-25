# 온유 AI 콘텐츠 파이프라인 (Onyoo)

성형외과 / 피부과 케이스 데이터를 AI 아바타 기반 다국어 숏폼 영상으로 자동 변환하는 서비스.

## 파이프라인 개요

```
케이스 입력 (웹 폼)
   ↓
스크립트 생성 (Claude via AI Gateway)
   ↓
원장 승인 (Resend 매직 링크 + Workflow Hook)
   ↓
음성 생성 (ElevenLabs TTS)
   ↓
아바타 영상 (HeyGen, 플랫폼별 9:16 / 1:1 / 16:9)
   ↓
다국어 더빙 (영/일/중)
   ↓
Google Drive 자동 업로드 (주차별 / 케이스별 / 언어별 폴더)
```

## 스택

- **Next.js 16 (App Router, Server Actions)**
- **Vercel Workflow DevKit (WDK)** — durable orchestration
- **AI SDK v6** — `anthropic/claude-sonnet-4-5` via Vercel AI Gateway
- **Drizzle + Neon Postgres** — 케이스/스크립트/렌더 추적
- **Vercel Blob** — 동의서·B/A 이미지·중간 산출물
- **Resend** — 승인 이메일
- **ElevenLabs / HeyGen / Google Drive APIs**

## 셋업

```bash
# 1) 환경변수
cp .env.example .env.local
# DATABASE_URL, BLOB_READ_WRITE_TOKEN, AI_GATEWAY_API_KEY,
# ELEVENLABS_API_KEY, HEYGEN_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON,
# RESEND_API_KEY 채우기

# 2) DB 마이그레이션
npm run db:push

# 3) 개발 서버
npm run dev

# 4) Workflow 옵저버빌리티 (별도 터미널)
npm run workflow:web
```

## 핵심 디렉토리

```
src/
├── app/
│   ├── page.tsx               # 대시보드 (최근 케이스)
│   ├── cases/                 # 목록 / 상세 / 새 케이스
│   ├── approve/[token]/       # 1-클릭 승인 페이지
│   └── actions.ts             # Server Actions (createCase, submitApproval)
├── workflows/
│   └── pipeline.ts            # 7단계 durable workflow + steps
├── lib/
│   ├── heygen.ts              # 아바타 영상 + 영상 번역 API
│   ├── elevenlabs.ts          # TTS + Dubbing API
│   ├── drive.ts               # Service Account 기반 폴더링/업로드
│   ├── email.ts               # Resend 승인 이메일
│   └── templates.ts           # 콘텐츠 템플릿 5종 + 의료광고법 가드레일
└── db/
    ├── schema.ts              # cases, scripts, renders, clinics, logs
    └── index.ts               # Drizzle client
```

## 의료광고법 가드레일

`src/lib/templates.ts`의 `MEDICAL_AD_RULES`는 스크립트 생성 프롬프트에 자동 주입됩니다:

- 단정/최상급 표현 차단 (`100%`, `완벽한`, `최고`, `유일` 등)
- 비교 광고 차단
- 부작용·개인차 면책 문구 강제
- AI 생성 영상 자막 라벨링 (한/영/일/중) 강제

⚠️ 자동 가드레일은 **1차 필터일 뿐**. 의료광고 심의 최종 책임은 운영팀과 의료광고심의위원회 검토에 있습니다.

## 다음 단계

- [ ] Clinic 시드 데이터 입력 (HeyGen avatar_id, ElevenLabs voice_id, Drive folder_id)
- [ ] Resend 도메인 인증 + 발신 도메인 설정
- [ ] Google Drive 부모 폴더를 서비스 계정에 Editor 권한으로 공유
- [ ] 첫 케이스 dry-run + 원장 승인 플로우 검증
- [ ] 멀티 클리닉 SaaS 모드: clinic-scoped 인증/관리자 UI
