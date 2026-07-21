import { LoginForm } from "@/features/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold">통합 관리자</h1>
          <p className="mt-1 text-sm text-zinc-500">
            양주 · 아이큐 · 헬스앱 관리 콘솔
          </p>
        </div>
        <LoginForm denied={denied === "1"} />
      </div>
    </main>
  );
}