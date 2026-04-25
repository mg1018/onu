export default function ApprovalDonePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold">처리되었습니다</h1>
        <p className="text-zinc-500">
          승인된 경우 영상 생성이 자동으로 시작됩니다. 완료되면 Drive에 업로드됩니다.
        </p>
      </div>
    </main>
  );
}
