"use client";

import { useFormStatus } from "react-dom";

export function ApprovalButtons({ alreadyHandled }: { alreadyHandled: boolean }) {
  const { pending } = useFormStatus();
  const disabled = alreadyHandled || pending;

  return (
    <div className="flex gap-3">
      <button
        type="submit"
        name="approved"
        value="true"
        disabled={disabled}
        className="flex-1 rounded-md bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "처리 중..." : "승인하고 영상 생성"}
      </button>
      <button
        type="submit"
        name="approved"
        value="false"
        disabled={disabled}
        className="flex-1 rounded-md border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {pending ? "처리 중..." : "반려"}
      </button>
    </div>
  );
}
