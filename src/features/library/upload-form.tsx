"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
export function LibraryUpload({ projects, ready }: { projects: { id: string; name: string }[]; ready: boolean }) {
  const router = useRouter(); const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget), file = data.get("file");
    if (!(file instanceof File) || !file.size || file.size > 64*1024*1024) { setMessage("64MB 이하의 파일을 선택해 주세요."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "upload", spaceId: data.get("spaceId"), name: file.name, size: file.size, version: data.get("version"), description: data.get("description") }) });
      const ticket = await response.json(); if (!response.ok) throw Error(ticket.error || "업로드 준비에 실패했습니다.");
      const uploaded = await fetch(ticket.url, { method: "PUT", headers: { Authorization: "Bearer "+ticket.token, "Content-Type": "application/octet-stream" }, body: file });
      const result = await uploaded.json(); if (!uploaded.ok) throw Error(result.error || "파일 저장에 실패했습니다.");
      form.current?.reset(); setMessage("자료실에 등록했습니다."); router.refresh();
    } catch(error) { setMessage(error instanceof Error ? error.message : "파일을 올리지 못했습니다."); }
    finally { setBusy(false); }
  }
  const input="min-w-0 rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";
  return <details className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><summary className="cursor-pointer text-sm font-bold">파일 올리기</summary><form ref={form} onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
    <select required name="spaceId" aria-label="업로드 프로젝트" className={input} defaultValue=""><option value="" disabled>프로젝트 선택</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <input required type="file" name="file" aria-label="업로드 파일" accept=".apk,.aab,.apks,.zip" className={input}/>
    <input name="version" aria-label="버전" placeholder="버전 (선택)" maxLength={60} className={input}/>
    <input name="description" aria-label="파일 설명" placeholder="변경 내용 (선택)" maxLength={1000} className={input}/>
    <button disabled={busy||!ready} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Upload size={16}/>{busy?"파일 올리는 중…":"파일 올리기"}</button>
    <p role="status" className="self-center text-sm text-zinc-500">{message||"APK·AAB·APKS·ZIP, 최대 64MB"}</p>
  </form></details>;
}
