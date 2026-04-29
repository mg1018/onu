export type CaseStatus =
  | "draft"
  | "script_pending"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "generating_voice"
  | "generating_avatar"
  | "translating"
  | "packaging"
  | "delivered"
  | "failed"
  | "pending_setup";

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "draft":
    case "script_pending":
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    case "awaiting_approval":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
    case "approved":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "rejected":
    case "failed":
      return "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200";
    case "pending_setup":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
    case "generating_voice":
    case "generating_avatar":
    case "translating":
    case "packaging":
      return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200";
    case "delivered":
      return "bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100";
    default:
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "초안";
    case "script_pending":
      return "스크립트 생성 중";
    case "awaiting_approval":
      return "승인 대기";
    case "approved":
      return "승인됨";
    case "rejected":
      return "반려됨";
    case "generating_voice":
      return "음성 생성 중";
    case "generating_avatar":
      return "아바타 생성 중";
    case "translating":
      return "다국어 번역 중";
    case "packaging":
      return "패키징 중";
    case "delivered":
      return "전달 완료";
    case "failed":
      return "실패";
    case "pending_setup":
      return "셋업 대기";
    default:
      return status;
  }
}
