import { Logo } from "@/components/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

const ADMIN_HOME = "/internal/elbakri-admin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = sp.redirect?.startsWith(ADMIN_HOME) ? sp.redirect : ADMIN_HOME;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-[22px] border border-ice bg-white p-8 shadow-glass">
        <div className="mb-6 flex justify-center">
          <Logo className="h-10" />
        </div>
        <h1 className="mb-1 text-center text-xl font-extrabold text-navy">لوحة التحكم</h1>
        <p className="mb-6 text-center text-sm text-muted">للمشرفين المصرّح لهم فقط</p>
        <LoginForm redirectTo={redirectTo} configured={isSupabaseConfigured()} />
      </div>
    </div>
  );
}
