"use client";

import { useState } from "react";

import { FilterSelect } from "@/components/filter-select";
import { MemberLiteGrant } from "@/features/health/components/member-lite-grant";

export type LiteGrantMember = {
  userId: string;
  name: string | null;
  email: string | null;
  /** 지급분이 살아 있으면 만료일(YYYY-MM-DD), 없으면 null. */
  grantedUntil: string | null;
};

const label = (m: LiteGrantMember) =>
  `${m.name ?? "이름 미입력"} · ${m.email ?? m.userId.slice(0, 8)}`;

/**
 * 라이트(990원) 지급 — 회원을 골라 지급하고, 지급 중인 회원은 아래에서 연장·회수한다.
 * 결제 중인 회원은 목록에 넣지 않는다(서버도 거절한다).
 */
export function LiteGrantPanel({ members }: { members: LiteGrantMember[] }) {
  const [user, setUser] = useState("");
  const picked = members.find((m) => m.userId === user);
  const granted = members.filter((m) => m.grantedUntil);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-2">
        <FilterSelect
          label="라이트 지급 회원"
          emptyLabel="회원 선택"
          searchPlaceholder="이름·이메일로 찾기"
          className="min-w-0 flex-1 basis-64"
          value={user}
          onChange={setUser}
          options={members.map((m) => ({
            value: m.userId,
            label: `${label(m)}${m.grantedUntil ? ` (지급 ~${m.grantedUntil})` : ""}`,
          }))}
        />
        {picked ? (
          <MemberLiteGrant
            key={picked.userId}
            userId={picked.userId}
            granted={picked.grantedUntil !== null}
            paid={false}
          />
        ) : null}
      </div>

      {granted.length > 0 ? (
        <ul className="space-y-2" data-testid="lite-granted-list">
          {granted.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <p className="min-w-0 truncate text-sm">
                {label(m)}
                <span className="ml-2 text-xs text-zinc-500">~{m.grantedUntil}</span>
              </p>
              <MemberLiteGrant userId={m.userId} granted paid={false} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">지급 중인 회원이 없어요.</p>
      )}
    </div>
  );
}
