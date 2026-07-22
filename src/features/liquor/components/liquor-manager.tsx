"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  deleteLiquorAction,
  deleteLiquorPriceAction,
  insertLiquorAction,
  priceHistoryAction,
  searchLiquorAction,
  updateLiquorAction,
  uploadLiquorImageAction,
} from "@/features/liquor/actions";
import {
  discountRate,
  FLAVOR_AXES,
  FLAVOR_LABEL,
  formatKrw,
  type LiquorPrice,
  type LiquorRow,
} from "@/features/liquor/liquor";

type Props = {
  initialRows: LiquorRow[];
  initialTotal: number;
  pageSize: number;
};

export function LiquorManager({ initialRows, initialTotal, pageSize }: Props) {
  const [rows, setRows] = useState<LiquorRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<LiquorRow | null>(null);
  const [creating, setCreating] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function load(nextQ: string, nextPage: number) {
    setError(null);
    startTransition(async () => {
      const res = await searchLiquorAction({ q: nextQ, page: nextPage, pageSize });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows(res.data.rows);
      setTotal(res.data.total);
      setPage(res.data.page);
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    load(q, 1);
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  function afterSaved() {
    closeModal();
    load(q, page); // 추가/수정 반영을 위해 현재 페이지 재조회
  }

  function afterDeleted(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  return (
    <div>
      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품명 · 브랜드 · 정규화명 검색"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          검색
        </button>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          + 상품 추가
        </button>
      </form>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <p className="mb-2 text-xs text-zinc-500">
        총 {total.toLocaleString("ko-KR")}건 · {page}/{totalPages} 페이지
        {pending && " · 불러오는 중…"}
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2 font-semibold">상품</th>
              <th className="px-3 py-2 font-semibold">분류</th>
              <th className="px-3 py-2 font-semibold">용량/도수</th>
              <th className="px-3 py-2 font-semibold">최신가</th>
              <th className="px-3 py-2 font-semibold">수정일</th>
              <th className="px-3 py-2 text-right font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-sm text-zinc-500"
                >
                  {pending ? "불러오는 중…" : "표시할 상품이 없습니다."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <LiquorRowView
                  key={row.id}
                  row={row}
                  onEdit={() => setEditing(row)}
                  onDeleted={() => afterDeleted(row.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={pending || page <= 1}
          onClick={() => load(q, page - 1)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
        >
          이전
        </button>
        <span className="text-sm tabular-nums text-zinc-500">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={pending || page >= totalPages}
          onClick={() => load(q, page + 1)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
        >
          다음
        </button>
      </div>

      {(editing || creating) && (
        <EditModal row={editing} onClose={closeModal} onSaved={afterSaved} />
      )}
    </div>
  );
}

function LiquorRowView({
  row,
  onEdit,
  onDeleted,
}: {
  row: LiquorRow;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<LiquorPrice[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [rowError, setRowError] = useState<string | null>(null);

  const rate = discountRate(
    row.latestPrice?.currentPrice,
    row.latestPrice?.originalPrice,
  );

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && history === null) {
      startTransition(async () => {
        const res = await priceHistoryAction(row.id);
        if (res.ok) setHistory(res.data);
        else setRowError(res.error);
      });
    }
  }

  function onDelete() {
    if (
      !confirm(
        `"${row.productName ?? row.normalizedName}" 상품과 연결된 모든 가격을 삭제합니다. 계속할까요?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteLiquorAction(row.id);
      if (res.ok) onDeleted();
      else setRowError(res.error);
    });
  }

  function onDeletePrice(priceId: number) {
    if (!confirm("이 판매처 가격을 삭제할까요?")) return;
    startTransition(async () => {
      const res = await deleteLiquorPriceAction(priceId);
      if (res.ok) {
        setHistory((prev) => (prev ? prev.filter((p) => p.id !== priceId) : prev));
      } else {
        setRowError(res.error);
      }
    });
  }

  return (
    <>
      <tr className="bg-white align-top dark:bg-zinc-900">
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="가격 이력 펼치기"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.imageUrl ?? PLACEHOLDER}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                {row.productName ?? row.normalizedName}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {row.brand ?? "브랜드 없음"}
                {row.country ? ` · ${row.country}` : ""}
              </p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
          {row.category ?? "-"}
        </td>
        <td className="px-3 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
          {row.volumeMl ? `${row.volumeMl}ml` : "-"}
          {row.alcoholPercent != null ? ` · ${row.alcoholPercent}%` : ""}
        </td>
        <td className="px-3 py-3">
          {row.latestPrice ? (
            <div>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatKrw(row.latestPrice.currentPrice)}
              </span>
              {rate != null && (
                <span className="ml-1 text-xs font-semibold text-rose-600">
                  -{rate}%
                </span>
              )}
              <p className="text-[11px] text-zinc-400">{row.latestPrice.source}</p>
            </div>
          ) : (
            <span className="text-zinc-400">-</span>
          )}
        </td>
        <td className="px-3 py-3 text-xs text-zinc-400">
          {new Date(row.updatedAt).toLocaleDateString("ko-KR")}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="수정"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:bg-red-950/40"
              aria-label="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-zinc-50/60 dark:bg-zinc-900/40">
          <td />
          <td colSpan={6} className="px-3 pb-4 pt-1">
            {rowError && (
              <p className="mb-2 text-xs text-red-600">{rowError}</p>
            )}
            {history === null ? (
              <p className="text-xs text-zinc-400">불러오는 중…</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-zinc-400">가격 이력이 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {history.map((p) => {
                  const r = discountRate(p.currentPrice, p.originalPrice);
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
                    >
                      <span className="w-28 shrink-0 truncate font-medium text-zinc-700 dark:text-zinc-300">
                        {p.source}
                      </span>
                      <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatKrw(p.currentPrice)}
                      </span>
                      {p.originalPrice != null && (
                        <span className="text-xs text-zinc-400 line-through tabular-nums">
                          {formatKrw(p.originalPrice)}
                        </span>
                      )}
                      {r != null && (
                        <span className="text-xs font-semibold text-rose-600">
                          -{r}%
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-zinc-400">
                        {new Date(p.crawledAt).toLocaleString("ko-KR")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeletePrice(p.id)}
                        disabled={pending}
                        className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:bg-red-950/40"
                        aria-label="가격 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function EditModal({
  row,
  onClose,
  onSaved,
}: {
  /** null 이면 신규 추가 모드. */
  row: LiquorRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isCreate = row === null;
  const [form, setForm] = useState({
    productName: row?.productName ?? "",
    normalizedName: row?.normalizedName ?? "",
    brand: row?.brand ?? "",
    category: row?.category ?? "",
    country: row?.country ?? "",
    volumeMl: row?.volumeMl?.toString() ?? "",
    alcoholPercent: row?.alcoholPercent?.toString() ?? "",
    productUrl: row?.productUrl ?? "",
    imageUrl: row?.imageUrl ?? "",
    clazz: row?.clazz ?? "",
    sweet: row?.sweet?.toString() ?? "",
    smoky: row?.smoky?.toString() ?? "",
    fruity: row?.fruity?.toString() ?? "",
    spicy: row?.spicy?.toString() ?? "",
    woody: row?.woody?.toString() ?? "",
    body: row?.body?.toString() ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = isCreate
        ? await insertLiquorAction(form)
        : await updateLiquorAction(row.id, form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved();
    });
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadLiquorImageAction(fd);
    setUploading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    set("imageUrl", res.data.url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {isCreate ? "상품 추가" : "상품 정보 수정"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="상품명">
            <input
              value={form.productName}
              onChange={(e) => set("productName", e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="정규화명 (필수)">
            <input
              value={form.normalizedName}
              onChange={(e) => set("normalizedName", e.target.value)}
              required
              className={INPUT}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="브랜드">
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="카테고리">
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="분류(class)">
              <input
                value={form.clazz}
                onChange={(e) => set("clazz", e.target.value)}
                className={INPUT}
                placeholder="싱글몰트 등"
              />
            </Field>
            <Field label="원산지">
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="용량(ml)">
              <input
                value={form.volumeMl}
                onChange={(e) => set("volumeMl", e.target.value)}
                inputMode="numeric"
                className={INPUT}
              />
            </Field>
            <Field label="도수(%)">
              <input
                value={form.alcoholPercent}
                onChange={(e) => set("alcoholPercent", e.target.value)}
                inputMode="decimal"
                className={INPUT}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-zinc-500">
              향 프로필 (0~10)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FLAVOR_AXES.map((axis) => (
                <label key={axis} className="block">
                  <span className="mb-1 block text-[11px] text-zinc-400">
                    {FLAVOR_LABEL[axis]}
                  </span>
                  <input
                    value={form[axis]}
                    onChange={(e) => set(axis, e.target.value)}
                    inputMode="decimal"
                    className={INPUT}
                  />
                </label>
              ))}
            </div>
          </div>

          <Field label="상품 URL">
            <input
              value={form.productUrl}
              onChange={(e) => set("productUrl", e.target.value)}
              className={INPUT}
              placeholder="https://…"
            />
          </Field>
          <Field label="이미지">
            <div className="flex items-center gap-2">
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                className={INPUT}
                placeholder="https://… 또는 파일 업로드"
              />
              <label className="shrink-0 cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-700">
                {uploading ? "업로드…" : "파일"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </Field>
          {form.imageUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt=""
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending || uploading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {pending ? "저장 중…" : isCreate ? "추가" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const INPUT = cn(
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none",
  "focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950",
);

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23e4e4e7'/%3E%3C/svg%3E";