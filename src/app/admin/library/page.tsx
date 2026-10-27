import Link from "@/components/PendingLink";
import { Download, ExternalLink, FolderOpen } from "lucide-react";

import { requireAdmin } from "@/features/admin/admin";
import { libraryRequest, memoOrigin, type LibraryData, type ReviewState } from "@/features/library/data";
import { ReviewForm } from "@/features/library/review-form";
import { Badge, ChipLink, EmptyState, PageHeader, buttonClass, fieldClass, type Tone } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const labels: Record<ReviewState, string> = { pending: "확인 대기", reviewed: "확인 완료", hold: "보류" };
const tones: Record<ReviewState, Tone> = { pending: "amber", reviewed: "emerald", hold: "red" };
const date = (value: string) => new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });
const mb = (bytes: number) => (bytes / 1024 / 1024).toLocaleString("ko-KR", { maximumFractionDigits: 2 });

/**
 * 메모 moa › 자료실 (895c3ea 통합 자료실, 2026-10-27 BOadmin 2.0 화면 규칙).
 * 메모 moa 프로젝트에서 올린 원본 파일을 확인하고 검수 상태·메모를 남긴다. 데이터·다운로드·저장은
 * 메모 moa API(libraryRequest)를 그대로 쓴다. 상태 칩·검색·프로젝트 필터는 주소에 남는다.
 */
export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["q", "project", "status", "page"]) if (typeof params[key] === "string") query.set(key, params[key]);
  let data: LibraryData | null = null;
  try {
    const response = await libraryRequest("?" + query);
    if (response.ok) data = await response.json();
  } catch {}

  const link = (over: Record<string, string | undefined>) => {
    const next = new URLSearchParams(query);
    for (const [k, v] of Object.entries(over)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in over)) next.delete("page");
    const qs = next.toString();
    return "/admin/library" + (qs ? `?${qs}` : "");
  };
  const status = query.get("status") ?? "";

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="자료실"
        description="메모 moa 프로젝트에서 올린 원본 파일을 확인하고 검수 기록을 남깁니다."
        actions={
          <a href={memoOrigin + "/files"} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>
            <ExternalLink size={14} aria-hidden="true" />메모 moa 자료실 열기
          </a>
        }
      />
      {!data ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          자료실을 불러오지 못했습니다. 메모 moa 연결(MEMO_APP_URL)과 로그인 상태를 확인한 뒤 새로고침해 주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <section aria-label="파일 검수 현황" className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-4">
            {([["total", "전체 파일", ""], ["pending", "확인 대기", "pending"], ["reviewed", "확인 완료", "reviewed"], ["hold", "보류", "hold"]] as const).map(([key, label, st], i) => (
              <Link
                key={key}
                href={link({ status: st || undefined })}
                aria-current={status === st ? "true" : undefined}
                className={cn("flex flex-col gap-1 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900", i % 2 === 0 && "border-r border-line", i < 2 && "border-b border-line lg:border-b-0", i === 1 && "lg:border-r", status === st && "bg-zinc-50 dark:bg-zinc-900")}
              >
                <span className="text-[12.5px] text-zinc-500">{label}</span>
                <span className="text-2xl font-semibold tabular-nums">{data.counts[key].toLocaleString("ko-KR")}</span>
              </Link>
            ))}
          </section>

          <form className="flex flex-col gap-2 sm:flex-row" action="/admin/library">
            {status && <input type="hidden" name="status" value={status} />}
            <input name="q" aria-label="파일명 또는 프로젝트 검색" defaultValue={query.get("q") ?? ""} placeholder="파일명 또는 프로젝트" maxLength={100} className={cn(fieldClass, "sm:max-w-sm")} />
            <select name="project" aria-label="프로젝트" defaultValue={query.get("project") ?? ""} className={cn(fieldClass, "sm:w-56")}>
              <option value="">모든 프로젝트</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className={buttonClass("secondary")}>검색</button>
            {(query.get("q") || query.get("project")) && <ChipLink href={link({ q: undefined, project: undefined })}>필터 지우기</ChipLink>}
          </form>

          {!data.storageReady && (
            <p role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              파일 서버 연결이 끊겨 다운로드를 잠시 쓸 수 없습니다. 검수 기록은 계속 보고 남길 수 있어요.
            </p>
          )}

          {data.files.length === 0 ? (
            <EmptyState title="조건에 맞는 파일이 없습니다" hint="검색어나 상태 필터를 바꿔 보세요." action={<FolderOpen size={18} className="mx-auto text-zinc-400" aria-hidden="true" />} />
          ) : (
            <ul aria-label="업로드 파일 목록" className="overflow-hidden rounded-lg border border-line bg-surface">
              {data.files.map((file) => (
                <li key={file.id} className="grid gap-4 border-b border-line px-4 py-4 last:border-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-zinc-500">
                      <Badge tone={tones[file.status]}>{labels[file.status]}</Badge>
                      <a href={memoOrigin + "/s/" + file.spaceId + "/files"} target="_blank" rel="noopener noreferrer" className="truncate hover:text-zinc-950 dark:hover:text-zinc-50">{file.projectName} ↗</a>
                    </div>
                    <h2 className="mt-1.5 break-all text-[15px] font-semibold">{file.name}</h2>
                    <p className="mt-0.5 font-mono text-[12px] text-zinc-500">
                      {file.versionLabel && `v${file.versionLabel} · `}{mb(file.size)} MB · {date(file.createdAt)}
                    </p>
                    <p className="mt-1 break-all text-[12.5px] text-zinc-500">
                      올린 사람 {file.uploaderName || file.uploaderEmail || "탈퇴한 사용자"}{file.uploaderName && file.uploaderEmail ? ` · ${file.uploaderEmail}` : ""}
                    </p>
                    {file.description && <p className="mt-2 whitespace-pre-wrap break-words text-[13.5px] text-zinc-600 dark:text-zinc-300">{file.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {data.storageReady ? (
                        <a href={"/api/admin/library?download=" + file.id} className={buttonClass("secondary", "sm")}><Download size={14} aria-hidden="true" />다운로드</a>
                      ) : (
                        <span className="text-[12px] text-zinc-400">서버 연결 대기</span>
                      )}
                      <details className="min-w-0 flex-1 text-[12px] text-zinc-500">
                        <summary className="cursor-pointer">SHA-256 확인</summary>
                        <code className="mt-1 block break-all font-mono">{file.sha256}</code>
                      </details>
                    </div>
                  </div>
                  <div className="min-w-0 lg:border-l lg:border-line lg:pl-4">
                    <ReviewForm key={file.id + file.reviewedAt} id={file.id} status={file.status} note={file.reviewNote} />
                    {file.reviewerEmail && file.reviewedAt && <p className="mt-2 break-all text-[11.5px] text-zinc-500">마지막 검수 {file.reviewerEmail} · {date(file.reviewedAt)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {(data.page > 1 || data.hasNext) && (
            <nav aria-label="자료실 페이지" className="flex items-center justify-center gap-2 text-[13px]">
              {data.page > 1 && <Link href={link({ page: String(data.page - 1) })} className={buttonClass("secondary", "sm")}>이전</Link>}
              <span className="px-2 tabular-nums text-zinc-600 dark:text-zinc-300">{data.page} 페이지</span>
              {data.hasNext && <Link href={link({ page: String(data.page + 1) })} className={buttonClass("secondary", "sm")}>다음</Link>}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
