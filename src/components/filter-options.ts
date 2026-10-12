export type FilterOption = { value: string; label: string };

/**
 * 검색어로 선택지 거르기 — 순수 함수. 띄어 쓴 낱말이 **모두** 들어 있는 것만 남긴다
 * (대소문자·앞뒤 공백 무시). 지금 고른 값은 검색어와 맞지 않아도 남긴다 — 빠지면
 * select 가 고른 값을 잃어 화면과 상태가 어긋난다.
 */
export function filterOptions<T extends FilterOption>(
  options: T[],
  query: string,
  selected = "",
): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  return options.filter((o) => {
    if (o.value === selected && selected) return true;
    const text = o.label.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}
