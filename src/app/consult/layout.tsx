// app/consult/layout.tsx
import LayoutShell from "@/components/LayoutShell";
import AuthGuard from "@/components/AuthGuard"; // 未ログインなら / へ戻す（任意）

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LayoutShell>{children}</LayoutShell>
    </AuthGuard>
  );
}
