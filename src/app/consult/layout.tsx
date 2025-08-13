// app/consult/layout.tsx
import LayoutShell from "@/components/LayoutShell";
import AuthGuard from "@/components/AuthGuard"; // 未ログインなら / へ戻す（任意）

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden">
        {/* 背景レイヤー（ログイン画面と同じドット＋#414141） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[#414141]
                     [background-image:radial-gradient(rgba(255,255,255,.12)_1.2px,transparent_1.2px)]
                     [background-size:22px_22px]"
        />
        <LayoutShell>{children}</LayoutShell>
      </div>
    </AuthGuard>
  );
}
