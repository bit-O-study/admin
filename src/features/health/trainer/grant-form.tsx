"use client";
import { useState } from "react";
import { TrainerForm } from "./forms";
import { normalizePhone } from "./types";

export type GrantCandidate = { userId: string; name: string | null; email: string | null; phone: string | null };
const field = "block min-h-11 w-full rounded-lg border border-line px-2";

/** 신청하지 않은 회원에게 이용권을 바로 넣는다. 이름·휴대폰은 회원 정보로 채우되 고칠 수 있다. */
export function TrainerGrantForm({ members, start, end }: { members: GrantCandidate[]; start: string; end: string }) {
  const [user, setUser] = useState("");
  const member = members.find(m => m.userId === user);
  if (!members.length) return <p className="text-sm text-muted">지급할 수 있는 회원이 없어요.</p>;
  return <TrainerForm intent="grant" label="이용권 지급">
    <label className="block text-sm">회원<select name="trainer" required value={user} onChange={event => setUser(event.target.value)} className={field}>
      <option value="">회원 선택</option>
      {members.map(m => <option key={m.userId} value={m.userId}>{m.name ?? "이름 미입력"} · {m.email ?? m.userId.slice(0, 8)}</option>)}
    </select></label>
    {/* key: 회원을 바꾸면 그 회원 정보로 다시 채운다. */}
    <div key={user} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">이름<input name="name" required maxLength={80} defaultValue={member?.name ?? ""} className={field} /></label>
      <label className="text-sm">휴대폰<input name="phone" required inputMode="tel" placeholder="01012345678" defaultValue={normalizePhone(member?.phone ?? "") ?? ""} className={field} /></label>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm">시작일<input type="date" name="start" required defaultValue={start} className={field} /></label>
      <label className="text-sm">종료일<input type="date" name="end" required defaultValue={end} className={field} /></label>
      <label className="text-sm">회원 수<input type="number" name="seats" min={1} max={1000} required defaultValue={15} className={field} /></label>
    </div>
  </TrainerForm>;
}
