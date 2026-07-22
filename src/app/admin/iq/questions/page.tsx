import Link from "next/link";

import { QuestionReview } from "@/features/iq/components/question-review";

export const dynamic = "force-dynamic";

export default function IqQuestionsPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <Link
          href="/admin/iq"
          className="text-sm text-zinc-500 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
        >
          ← 아이큐
        </Link>
        <h1 className="mt-1 text-xl font-bold">🧠 문제 해설</h1>
        <p className="mt-1 text-sm text-zinc-500">
          전체 문항 · 정답 · 풀이(규칙) 검토
        </p>
      </header>
      <QuestionReview />
    </div>
  );
}