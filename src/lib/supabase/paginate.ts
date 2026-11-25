/**
 * PostgREST 는 한 번에 최대 행 수(Supabase 기본 1000)까지만 돌려준다 — `.limit(5000)` 을 줘도
 * 1000행에서 말없이 잘린다. 범위를 나눠 끝까지(또는 maxRows 까지) 읽는다. 순수 모듈.
 *
 * fetchPage(from, to) 는 `.range(from, to)` 를 건 쿼리를 돌려주면 된다(정렬은 호출부가 고정).
 * 한 페이지라도 실패하면 error 를 돌려준다 — 실패를 '0건' 으로 위장하지 않기 위해.
 * truncated: maxRows 에 걸려 더 있을 수 있음.
 */
export type PageResult<T> = { data: T[] | null; error: unknown };

export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  { pageSize = 1000, maxRows = 20000 }: { pageSize?: number; maxRows?: number } = {},
): Promise<{ rows: T[]; error: unknown; truncated: boolean }> {
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += pageSize) {
    const to = Math.min(from + pageSize, maxRows) - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) return { rows, error, truncated: false };
    const page = data ?? [];
    rows.push(...page);
    if (page.length < to - from + 1) return { rows, error: null, truncated: false };
  }
  return { rows, error: null, truncated: true };
}
