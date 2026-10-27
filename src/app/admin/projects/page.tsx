import { ExternalLink } from "lucide-react";

import { requireAdmin } from "@/features/admin/admin";
import { projectSites } from "@/features/admin/project-sites";
import { judgeProject, LEVEL_DOT } from "@/features/admin/status-model";
import { agentRequest } from "@/features/server/agent";
import type { ServerSnapshot } from "@/features/server/types";
import { PageHeader, buttonClass } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/**
 * 전체 서비스 › 사이트 (895c3ea 프로젝트 사이트, 2026-10-27 BOadmin 2.0 화면 규칙).
 * 운영 사이트(Vercel)로 바로 가고, 내부 서버 실행 상태를 함께 본다. 서버 직접 접속 주소는
 * VPN(Tailscale)·같은 네트워크에서만 열리고, 서버에서 실행 중일 때만 보여 준다.
 */
export default async function ProjectsPage() {
  await requireAdmin();
  let snapshot: ServerSnapshot | null = null;
  try {
    const response = await agentRequest("/status");
    if (response.ok) snapshot = await response.json();
  } catch {}

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="사이트" description="운영 사이트로 바로 가거나 내부 서버의 실행 상태를 확인합니다." />
      <p className="mb-5 rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-zinc-600 dark:text-zinc-300">
        운영 사이트는 Vercel 주소입니다. 서버에는 고정 도메인이 없어서, 서버 직접 접속은 VPN 또는 같은 네트워크에서만 열립니다.
        {!snapshot && " 지금은 서버 상태를 불러오지 못했습니다."}
      </p>
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {projectSites.map((site) => {
          const project = snapshot?.projects.find((p) => p.name === site.key);
          const judged = project ? judgeProject(project) : null;
          const running = project?.state === "running";
          return (
            <li key={site.key} className="grid gap-3 border-b border-line px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,1fr)_210px] md:items-center">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{site.name}</p>
                <p className="text-[12.5px] text-zinc-500">{site.description}</p>
              </div>
              <div className="min-w-0 text-[12.5px]">
                <span className="text-zinc-500">운영 </span>
                {site.url ? <span className="font-mono">{new URL(site.url).hostname}</span> : <span className="text-zinc-400">고정 도메인 없음</span>}
              </div>
              <div className="flex min-w-0 items-center gap-2 text-[12.5px]">
                {site.port ? (
                  <>
                    <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", judged ? LEVEL_DOT[judged.level] : "bg-zinc-300 dark:bg-zinc-700")} />
                    <span className="truncate">서버 {judged ? judged.detail : "상태 확인 필요"}</span>
                    <span className="font-mono text-zinc-500">:{site.port}</span>
                  </>
                ) : (
                  <span className="text-zinc-400">서버 없음</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {site.url && (
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm")}>
                    열기<ExternalLink size={13} aria-hidden="true" />
                  </a>
                )}
                {site.port && running && (
                  <>
                    <a href={"http://100.97.115.109:" + site.port} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>VPN</a>
                    <a href={"http://192.168.219.183:" + site.port} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>내부망</a>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
