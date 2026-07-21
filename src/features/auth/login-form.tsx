"use client";

import { useActionState } from "react";

import { signInAction, type SignInState } from "./actions";

const initial: SignInState = { error: null };

export function LoginForm({ denied }: { denied?: boolean }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const error =
    state.error ??
    (denied ? "관리자 권한이 없는 계정입니다." : null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          이메일
        </span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          비밀번호
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}