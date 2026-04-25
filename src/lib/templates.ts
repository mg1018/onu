export type ContentTemplate = {
  id: string;
  name: string;
  description: string;
  structure: string;
  targetDurationSec: number;
};

export const TEMPLATES: ContentTemplate[] = [
  {
    id: "before_after_story",
    name: "Before/After Story",
    description: "환자 여정 중심의 변화 스토리",
    targetDurationSec: 40,
    structure: `
[Hook 0-3s] 시술 전 주된 고민 한 문장 (과장 금지, 환자가 말한 것만)
[Problem 3-10s] 고민이 일상에 준 구체적 영향 (비교 표현 금지)
[Method 10-25s] 시술 방식 요약 (전문 용어는 1회 사용 후 쉬운 말로 풀기)
[Outcome 25-35s] 회복 과정 + 환자 소감 ("만족도 100%" 같은 단정 표현 금지)
[CTA 35-40s] "자세한 상담은 프로필 링크에서" 형태로 온건하게 마무리
`,
  },
  {
    id: "myth_buster",
    name: "Myth Buster",
    description: "흔한 오해를 짚고 정확한 정보 전달",
    targetDurationSec: 35,
    structure: `
[Hook 0-3s] "이거 오해하시는 분 많더라고요" 형태의 후킹
[Myth 3-10s] 오해 명시
[Fact 10-25s] 의학적 근거 기반 반박, 출처는 "임상적으로" "일반적으로" 톤
[Nuance 25-30s] 예외·개인차 언급
[CTA 30-35s] 상담 유도
`,
  },
  {
    id: "procedure_explainer",
    name: "Procedure Explainer",
    description: "시술 과정을 3단계로 설명",
    targetDurationSec: 45,
    structure: `
[Hook 0-3s] "이 시술 어떻게 진행되는지 궁금해하시는 분"
[Step 1 3-15s] 상담·진단
[Step 2 15-30s] 시술 과정 핵심 (위험·부작용 한 줄 필수)
[Step 3 30-40s] 회복·관리
[CTA 40-45s] 상담 유도
`,
  },
  {
    id: "recovery_tips",
    name: "Recovery Tips",
    description: "시술 후 회복 팁",
    targetDurationSec: 30,
    structure: `
[Hook 0-3s] "시술 후 이것만 지켜도 회복이 빨라져요"
[Tip 1-3 3-25s] 3가지 팁 (수면/식이/관리 등)
[CTA 25-30s] "개인차 있으니 담당의 안내 우선" + 상담 유도
`,
  },
  {
    id: "candidate_check",
    name: "Candidate Check",
    description: "이 시술이 맞는 사람 / 안 맞는 사람",
    targetDurationSec: 35,
    structure: `
[Hook 0-3s] "이 시술, 아무나 할 수 있는 건 아니에요"
[Good Fit 3-18s] 시술 적합 케이스 3가지
[Not Fit 18-30s] 시술 비적합 케이스 3가지 (필수)
[CTA 30-35s] "본인이 맞는지는 상담 후 결정"
`,
  },
];

export const MEDICAL_AD_RULES = `
[KR 의료법/의료광고 준수 규칙 — 반드시 지켜야 함]
아래 표현은 절대 사용 금지:
- "100%", "완전히", "완벽한", "최고", "최상", "유일", "세계 최초", "국내 최초" 같은 단정/최상급
- 다른 병원/시술/의사 대비 비교 표현 ("A보다 B가 나은", "일반 병원과 다른" 등)
- 치료 효과를 단정하는 표현 ("반드시 좋아진다", "부작용 없음")
- 환자·연예인의 치료 경험담을 효과 증빙으로 사용하는 내용 ("이 시술로 얼굴이 완전히 바뀌었어요")
- 비급여 수술 비용 할인·이벤트·무료 상담 강조
- 검증되지 않은 의학 용어/신기술 표현

아래 요소는 반드시 포함:
- "개인차가 있을 수 있습니다" 또는 동등한 면책 문구
- 시술의 부작용·위험성 언급 (짧게라도)
- 의사 판단/상담 후 결정 필요 언급

Disclosure (반드시 자막 첫 2초에 삽입):
- 한국어: "AI 생성 영상입니다"
- 영어: "AI-generated content"
- 일본어: "AI生成コンテンツ"
- 중국어: "AI生成内容"
`;
