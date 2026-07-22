import { MatrixFigure } from "@/features/iq/components/matrix-figure";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  TYPE_LABEL,
  type CellSpec,
  type Question,
} from "@/features/iq/questions";

const DIFF_LABEL: Record<number, string> = {
  1: "쉬움",
  2: "보통",
  3: "어려움",
};
const DIFF_TONE: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  3: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};

/** 도형 한 칸 — 정답이면 강조. */
function Cell({
  spec,
  id,
  correct = false,
}: {
  spec: CellSpec;
  id: string;
  correct?: boolean;
}) {
  return (
    <div
      className={
        "flex h-16 w-16 items-center justify-center rounded-xl border " +
        (correct
          ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900")
      }
    >
      <MatrixFigure spec={spec} size={52} idPrefix={id} />
    </div>
  );
}

/** 문제 본문(유형별). odd 는 보기 자체가 문제라 본문 없음. */
function ProblemBody({ q }: { q: Question }) {
  if (q.type === "matrix") {
    return (
      <div className="grid w-fit grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
        {q.grid.map((cell, i) => (
          <div
            key={i}
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-zinc-900"
          >
            <MatrixFigure spec={cell} size={52} idPrefix={`q${q.id}-g${i}`} />
          </div>
        ))}
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 text-2xl font-black text-zinc-400">
          ?
        </div>
      </div>
    );
  }

  if (q.type === "analogy") {
    return (
      <div className="flex w-fit flex-wrap items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
        <Cell spec={q.a} id={`q${q.id}-a`} />
        <span className="text-lg font-black text-zinc-400">→</span>
        <Cell spec={q.b} id={`q${q.id}-b`} />
        <span className="mx-1 text-xl font-black text-zinc-500">::</span>
        <Cell spec={q.c} id={`q${q.id}-c`} />
        <span className="text-lg font-black text-zinc-400">→</span>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 text-2xl font-black text-zinc-400">
          ?
        </div>
      </div>
    );
  }

  if (q.type === "odd") return null;

  // number / letter 수열
  return (
    <div className="flex w-fit flex-wrap items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
      {q.sequence.map((term, i) => (
        <div
          key={i}
          className={
            "flex h-12 min-w-12 items-center justify-center rounded-lg px-3 text-lg font-black tabular-nums " +
            (term === "?"
              ? "border-2 border-dashed border-zinc-400 text-zinc-400"
              : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100")
          }
        >
          {term}
        </div>
      ))}
    </div>
  );
}

/** 보기 — 정답 강조. series 는 텍스트, 나머지는 도형. */
function Options({ q }: { q: Question }) {
  if (q.type === "number" || q.type === "letter") {
    return (
      <div className="flex flex-wrap gap-2">
        {q.options.map((opt, i) => (
          <div
            key={i}
            className={
              "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-bold tabular-nums " +
              (i === q.answer
                ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400")
            }
          >
            {opt}
            {i === q.answer && <span className="ml-1 text-[10px]">✓정답</span>}
          </div>
        ))}
      </div>
    );
  }

  // 여기 도달하면 matrix/odd/analogy → options 는 CellSpec[]
  const cellOptions = q.options as CellSpec[];
  return (
    <div className="flex flex-wrap gap-2">
      {cellOptions.map((opt, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Cell spec={opt} id={`q${q.id}-o${i}`} correct={i === q.answer} />
          {i === q.answer && (
            <span className="text-[10px] font-bold text-emerald-600">✓정답</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** 관리자용 전체 문항 검토 — 문제·정답·해설. */
export function QuestionReview() {
  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        총 <b>{TOTAL_QUESTIONS}</b>문항 · 각 문항의 정답(초록)과 풀이 규칙을 검토용으로
        표시합니다. (실제 응시 화면과 동일한 결정적 문제 세트)
      </p>
      <ol className="space-y-4">
        {QUESTIONS.map((q, idx) => (
          <li
            key={q.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Q{idx + 1}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {TYPE_LABEL[q.type]}
              </span>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                  DIFF_TONE[q.difficulty]
                }
              >
                {DIFF_LABEL[q.difficulty]}
              </span>
            </div>

            <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {q.prompt}
            </p>

            <div className="mb-3">
              <ProblemBody q={q} />
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold text-zinc-500">보기</p>
              <Options q={q} />
            </div>

            <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950/40">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                풀이:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">
                {q.explanation}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}