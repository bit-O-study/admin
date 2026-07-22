/**
 * 문항 생성 엔진 (멀티 유형 · 결정적 · 중복 제거)
 *
 * 실제 멘사/IQ 검사처럼 서로 다른 추론 유형을 조합한다.
 *   1) 도형 행렬 추론(matrix)   — 레이븐식 3×3, 8지선다 도형
 *   2) 수열 추론(number)        — 규칙 있는 숫자 나열, 정답이 유일하게 결정됨
 *   3) 문자열 추론(letter)      — 알파벳 규칙 나열
 *   4) 다른 하나 찾기(odd)      — 하나만 규칙을 어기는 도형 고르기
 *   5) 도형 유추(analogy)       — A:B = C:? 변환 규칙 적용
 *
 * 설계 원칙
 *  - 모든 문항은 "규칙"에서 정답을 함께 계산하므로 정답이 항상 정확하다.
 *  - 오답 보기는 규칙을 잘못 적용했을 때 나오는 "그럴듯한" 값으로 만든다.
 *  - 시드 기반이라 렌더링/채점이 항상 동일하다.
 *  - 유형/시드 조합으로 전체 문항이 서로 다르도록 중복을 제거한다(dedup).
 *  - 난이도(1→3)가 뒤로 갈수록 오르도록 배치한다.
 *
 * ⚠️ 본 검사는 잘 구성된 연습/참고용 추론 검사이며, 표본 규준(norming)에
 *    기반한 임상 지능검사가 아니다.
 */

export type Shape = "circle" | "square" | "triangle" | "diamond" | "hexagon";
export type FillStyle = "outline" | "solid" | "half" | "dots";

export interface CellSpec {
  shape: Shape;
  count: number; // 1..4
  rotation: number; // degrees
  fill: FillStyle;
  size?: number; // 도형 크기 배율(0~1, 기본 1)
  color: string; // stroke/fill 색
}

export type QuestionType = "matrix" | "number" | "letter" | "odd" | "analogy";
export type Difficulty = 1 | 2 | 3;

interface BaseQuestion {
  id: number;
  type: QuestionType;
  prompt: string;
  answer: number; // options 내 정답 인덱스
  difficulty: Difficulty;/** 왜 이 답이 정답인지(규칙) 한글 해설 — 결과 화면 문항 리뷰용 */
  explanation: string;
}

export interface MatrixQuestion extends BaseQuestion {
  type: "matrix";
  grid: CellSpec[]; // 앞 8칸(0..7). 9번째 칸이 정답.
  options: CellSpec[]; // 8지선다 도형 보기
}

export interface SeriesQuestion extends BaseQuestion {
  type: "number" | "letter";
  sequence: string[]; // 보이는 항들. 마지막 항은 "?"
  options: string[]; // 텍스트 보기
}

export interface OddQuestion extends BaseQuestion {
  type: "odd";
  options: CellSpec[]; // 도형 보기(하나가 정답=다른 것)
}

export interface AnalogyQuestion extends BaseQuestion {
  type: "analogy";
  a: CellSpec;
  b: CellSpec;
  c: CellSpec;
  options: CellSpec[]; // ?에 들어갈 도형 보기
}

export type Question = MatrixQuestion | SeriesQuestion | OddQuestion | AnalogyQuestion;

const INK = "#1f2937";
const SHAPE_POOL: Shape[] = ["circle", "square", "triangle", "diamond", "hexagon"];
const FILL_POOL: FillStyle[] = ["outline", "solid", "half", "dots"];
const SIZE_POOL = [0.62, 0.82, 1.0];
const COUNT_POOL = [1, 2, 3, 4];
const ROTATION_POOL = [0, 90, 180, 270];

/* ─────────────────────────── 유틸 ─────────────────────────── */

/** mulberry32 시드 PRNG — 결정적 생성용 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 서로 다른 n개를 뽑는다 */
function sample<T>(arr: T[], n: number, rand: () => number): T[] {
  return shuffle(arr, rand).slice(0, n);
}

function randInt(rand: () => number, lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

function clampCount(n: number): number {
  return Math.max(1, Math.min(4, n));
}

/* ─────────────────── 도형 공통 ─────────────────── */

/** 도형의 회전 대칭 각(°). 이 각의 배수만큼 돌리면 시각적으로 동일하다. */
const SYMMETRY: Record<Shape, number> = {
  circle: 360,
  square: 90,
  diamond: 90,
  hexagon: 60,
  triangle: 120,
};

/**
 * 시각적 키: 대칭성을 반영해 "실제로 눈에 보이는" 모습을 식별한다.
 * 보기 중복 판정과 문항 중복 제거에 쓰인다.
 */
export function visualKey(c: CellSpec): string {
  const sym = SYMMETRY[c.shape];
  const eff = c.shape === "circle" ? 0 : ((Math.round(c.rotation) % sym) + sym) % sym;
  const sz = Math.round((c.size ?? 1) * 100);
  return `${c.shape}|${c.count}|${eff}|${c.fill}|${sz}|${c.color}`;
}

type AttrKey = "shape" | "count" | "fill" | "size" | "rotation";

function domain(key: AttrKey): (Shape | number | FillStyle)[] {
  if (key === "shape") return SHAPE_POOL;
  if (key === "fill") return FILL_POOL;
  if (key === "count") return COUNT_POOL;
  if (key === "size") return SIZE_POOL;
  return ROTATION_POOL;
}

function setAttr(cell: CellSpec, key: AttrKey, val: number | string): CellSpec {
  return { ...cell, [key]: val } as CellSpec;
}

function randomCell(rand: () => number): CellSpec {
  const shape = pick(SHAPE_POOL, rand);
  return {
    shape,
    count: pick(COUNT_POOL, rand),
    fill: pick(FILL_POOL, rand),
    size: pick(SIZE_POOL, rand),
    rotation: shape === "circle" ? 0 : pick(ROTATION_POOL, rand),
    color: INK,
  };
}

/** 정답 도형에서 속성 하나를 바꿔 오답 후보를 만든다 */
function mutate(base: CellSpec, rand: () => number): CellSpec {
  const c: CellSpec = { ...base };
  const keys: AttrKey[] =
    base.shape === "circle"
      ? ["count", "shape", "fill", "size"]
      : ["count", "shape", "fill", "size", "rotation"];
  const k = pick(keys, rand);
  if (k === "count") {
    let nc = clampCount(base.count + (rand() < 0.5 ? 1 : -1));
    if (nc === base.count) nc = base.count >= 4 ? base.count - 1 : base.count + 1;
    c.count = nc;
  } else if (k === "shape") {
    c.shape = pick(
      SHAPE_POOL.filter((s) => s !== base.shape),
      rand,
    );
  } else if (k === "fill") {
    c.fill = pick(
      FILL_POOL.filter((f) => f !== base.fill),
      rand,
    );
  } else if (k === "size") {
    const cur = base.size ?? 1;
    const alt = SIZE_POOL.filter((s) => s !== cur);
    c.size = alt.length ? pick(alt, rand) : cur;
  } else {
    c.rotation = (base.rotation + pick([90, 180, 270], rand)) % 360;
  }
  return c;
}

/** 정답 + 후보들에서 서로 다른 count개의 보기를 만든다 */
function assembleOptions(
  answer: CellSpec,
  cands: CellSpec[],
  count: number,
  seed: number,
): { options: CellSpec[]; answerIdx: number } {
  const rand = rng(seed);
  const answerKey = visualKey(answer);
  const opts: CellSpec[] = [answer];
  const push = (c: CellSpec) => {
    if (opts.length >= count) return;
    if (visualKey(c) === answerKey) return;
    if (opts.some((o) => visualKey(o) === visualKey(c))) return;
    opts.push(c);
  };
  for (const c of shuffle(cands, rand)) push(c);
  let guard = 0;
  while (opts.length < count && guard++ < 400) push(mutate(answer, rand));
  const shuffled = shuffle(opts, rng(seed * 31 + 5));
  return { options: shuffled, answerIdx: shuffled.findIndex((o) => visualKey(o) === answerKey) };
}

/* ─────────────────── 해설(explanation) 라벨 ─────────────────── */

/** 속성 → 한글 이름 (해설 문구용) */
const ATTR_KR: Record<AttrKey, string> = {
  shape: "도형 종류",
  count: "도형 개수",
  fill: "칠하기(채우기) 방식",
  size: "크기",
  rotation: "회전 각도",
};

/* ─────────────────── 도형 행렬(matrix) 추론 ─────────────────── */

type Prog = (r: number, c: number) => number;

const progRow: Prog = (r) => r;
const progCol: Prog = (_r, c) => c;
const progLatin: Prog = (r, c) => (r + c) % 3; // 분포(distribution of three)
const progLatin2: Prog = (r, c) => (r + 2 * c) % 3;

const ALL_PROGS: Prog[] = [progRow, progCol, progLatin, progLatin2];

/** progression → 한글 설명 (해설 문구용) */
function progKR(p: Prog): string {
  if (p === progRow) return "행(가로)마다 순서대로 바뀝니다";
  if (p === progCol) return "열(세로)마다 순서대로 바뀝니다";
  return "각 행·열에 세 값이 하나씩 들어갑니다(분포 규칙)";
}

interface Track<T> {
  values: T[];
  prog: Prog;
}
function constTrack<T>(v: T): Track<T> {
  return { values: [v], prog: () => 0 };
}

interface Plan {
  shape: Track<Shape>;
  count: Track<number>;
  fill: Track<FillStyle>;
  size: Track<number>;
  rotation: Track<number>;
}

function cellAt(plan: Plan, r: number, c: number): CellSpec {
  return {
    shape: plan.shape.values[plan.shape.prog(r, c)],
    count: plan.count.values[plan.count.prog(r, c)],
    fill: plan.fill.values[plan.fill.prog(r, c)],
    size: plan.size.values[plan.size.prog(r, c)],
    rotation: plan.rotation.values[plan.rotation.prog(r, c)],
    color: INK,
  };
}

interface BuiltMatrix {
  grid: CellSpec[];
  options: CellSpec[];
  answer: number;
  sig: string;
  prompt: string;
  explanation: string;
}

function makeMatrix(seed: number, difficulty: Difficulty): BuiltMatrix | null {
  const rand = rng(seed);
  for (let attempt = 0; attempt < 40; attempt++) {
    const activeCount = difficulty === 1 ? 2 : 3;
    const useRotation = difficulty >= 2 && rand() < 0.45;
    const active: AttrKey[] = useRotation
      ? ["rotation", ...sample(["count", "fill", "size"] as AttrKey[], activeCount - 1, rand)]
      : sample(["shape", "count", "fill", "size"] as AttrKey[], activeCount, rand);

    const plan: Plan = {
      shape: constTrack(pick(SHAPE_POOL, rand)),
      count: constTrack(pick(COUNT_POOL, rand)),
      fill: constTrack(pick(FILL_POOL, rand)),
      size: constTrack(1),
      rotation: constTrack(0),
    };
    if (useRotation) plan.shape = constTrack("triangle");

    const progs = difficulty === 1 ? [progRow, progCol, progLatin] : ALL_PROGS;
    let hasLatin = false;
    for (const key of active) {
      const prog = pick(progs, rand);
      if (prog === progLatin || prog === progLatin2) hasLatin = true;
      if (key === "shape") plan.shape = { values: sample(SHAPE_POOL, 3, rand), prog };
      else if (key === "count") plan.count = { values: sample(COUNT_POOL, 3, rand), prog };
      else if (key === "fill") plan.fill = { values: sample(FILL_POOL, 3, rand), prog };
      else if (key === "size") plan.size = { values: shuffle(SIZE_POOL, rand), prog };
      else plan.rotation = { values: sample(ROTATION_POOL, 3, rand), prog };
    }
    // 어려움 단계에선 '분포' 규칙을 최소 1개 포함
    if (difficulty >= 3 && !hasLatin && active.length) {
      plan[active[active.length - 1]].prog = progLatin;
    }

    const cells: CellSpec[] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push(cellAt(plan, r, c));
    if (new Set(cells.map(visualKey)).size < 2) continue;

    const grid = cells.slice(0, 8);
    const answer = cells[8];

    const cands: CellSpec[] = [];
    for (const key of active) {
      const track = plan[key] as Track<number | string>;
      for (const v of track.values) cands.push(setAttr(answer, key, v));
    }
    for (const cell of grid) cands.push(cell);
    for (let i = 0; i < 16; i++) cands.push(mutate(answer, rand));

    const { options, answerIdx } = assembleOptions(answer, cands, 8, seed + attempt * 97);
    if (answerIdx < 0) continue;

    const rules = active.map(
      (k) => `${ATTR_KR[k]}이(가) ${progKR((plan[k] as Track<unknown>).prog)}`,
    );
    const explanation = `3×3 표에서 ${rules.join(", 그리고 ")}. 이 규칙대로 마지막(?) 칸을 채운 도형이 정답입니다.`;

    return {
      grid,
      options,
      answer: answerIdx,
      sig: cells.map(visualKey).join(";"),
      prompt: "3×3 도형의 규칙을 찾아 빈 칸(?)에 들어갈 도형을 고르세요.",
      explanation,
    };
  }
  return null;
}

/* ─────────────────── 다른 하나 찾기(odd) ─────────────────── */

interface BuiltOdd {
  options: CellSpec[];
  answer: number;
  sig: string;
  prompt: string;
  explanation: string;
}

function makeOdd(seed: number, difficulty: Difficulty): BuiltOdd | null {
  const rand = rng(seed);
  const keyByDiff: AttrKey[] =
    difficulty === 1 ? ["fill", "count"] : difficulty === 2 ? ["count", "size"] : ["size", "fill"];

  for (let attempt = 0; attempt < 50; attempt++) {
    const sKey = pick(keyByDiff, rand);
    const dom = domain(sKey);
    const sVal = pick(dom, rand);
    const others = (["shape", "count", "fill", "size"] as AttrKey[]).filter((k) => k !== sKey);

    const conformers: CellSpec[] = [];
    let guard = 0;
    while (conformers.length < 5 && guard++ < 300) {
      let c = setAttr(randomCell(rand), sKey, sVal as number | string);
      if (sKey === "shape" && sVal === "circle") c = { ...c, rotation: 0 };
      if (!conformers.some((o) => visualKey(o) === visualKey(c))) conformers.push(c);
    }
    if (conformers.length < 5) continue;
    // 다섯이 공유하는 규칙은 오직 sKey여야 한다(다른 속성은 서로 달라야 함)
    const secondaryRule = others.some(
      (k) => new Set(conformers.map((c) => String(c[k as keyof CellSpec]))).size < 2,
    );
    if (secondaryRule) continue;

    const oddVal = pick(
      dom.filter((v) => v !== sVal),
      rand,
    );
    let odd = setAttr(randomCell(rand), sKey, oddVal as number | string);
    if (sKey === "shape" && oddVal === "circle") odd = { ...odd, rotation: 0 };
    if (conformers.some((o) => visualKey(o) === visualKey(odd))) continue;

    const options = shuffle([...conformers, odd], rng(seed * 13 + 7));
    const answer = options.findIndex((o) => o === odd);
    if (answer < 0) continue;

    return {
      options,
      answer,
      sig: [...conformers, odd].map(visualKey).sort().join(";"),
      prompt: "다섯은 같은 규칙을 따르고 하나만 다릅니다. 다른 하나를 고르세요.",
      explanation: `다섯 도형은 ${ATTR_KR[sKey]}이(가) 서로 같습니다. 정답 도형만 ${ATTR_KR[sKey]}이(가) 달라서 '다른 하나'입니다.`,
    };
  }
  return null;
}

/* ─────────────────── 도형 유추(analogy) ─────────────────── */

interface Transform {
  name: string;
  tri?: boolean; // 삼각형에만 적용(회전 등)
  apply: (c: CellSpec) => CellSpec;
}

const TRANSFORMS: Transform[] = [
  {
    name: "fill",
    apply: (c) => ({ ...c, fill: FILL_POOL[(FILL_POOL.indexOf(c.fill) + 1) % FILL_POOL.length] }),
  },
  { name: "count", apply: (c) => ({ ...c, count: (c.count % 4) + 1 }) },
  {
    name: "shape",
    apply: (c) => {
      const s = SHAPE_POOL[(SHAPE_POOL.indexOf(c.shape) + 1) % SHAPE_POOL.length];
      return { ...c, shape: s, rotation: s === "circle" ? 0 : c.rotation };
    },
  },
  {
    name: "size",
    apply: (c) => {
      const i = Math.max(0, SIZE_POOL.indexOf(c.size ?? 1));
      return { ...c, size: SIZE_POOL[(i + 1) % SIZE_POOL.length] };
    },
  },
  { name: "rotate", tri: true, apply: (c) => ({ ...c, rotation: (c.rotation + 90) % 360 }) },
];

/** 변환 → 한글 설명 (해설 문구용) */
const TRANSFORM_KR: Record<string, string> = {
  fill: "칠하기(채우기) 방식이 한 단계 바뀝니다",
  count: "도형 개수가 하나 늘어납니다",
  shape: "도형 종류가 한 단계 바뀝니다",
  size: "크기가 한 단계 커집니다",
  rotate: "90° 회전합니다",
};

interface BuiltAnalogy {
  a: CellSpec;
  b: CellSpec;
  c: CellSpec;
  options: CellSpec[];
  answer: number;
  sig: string;
  prompt: string;
  explanation: string;
}

function makeAnalogy(seed: number, difficulty: Difficulty): BuiltAnalogy | null {
  const rand = rng(seed);
  const plain = TRANSFORMS.filter((t) => !t.tri);

  for (let attempt = 0; attempt < 50; attempt++) {
    // 난이도 3은 두 변환을 동시에 적용(고난도)
    const compose = difficulty === 3 && rand() < 0.85;
    let transform: (c: CellSpec) => CellSpec;
    let tri = false;
    let parts: Transform[];
    if (compose) {
      parts = sample(plain, 2, rand);
      transform = (x) => parts[1].apply(parts[0].apply(x));
    } else {
      const pool =
        difficulty === 1 ? TRANSFORMS.filter((t) => ["fill", "count", "shape"].includes(t.name)) : TRANSFORMS;
      const t = pick(pool, rand);
      parts = [t];
      tri = !!t.tri;
      transform = t.apply;
    }

    let a = randomCell(rand);
    let c = randomCell(rand);
    if (tri) {
      a = { ...a, shape: "triangle", rotation: pick(ROTATION_POOL, rand) };
      c = { ...c, shape: "triangle", rotation: pick(ROTATION_POOL, rand) };
    }
    const b = transform(a);
    const d = transform(c);
    if (visualKey(b) === visualKey(a)) continue;
    if (visualKey(d) === visualKey(c)) continue;
    if (visualKey(c) === visualKey(a)) continue;
    if (visualKey(d) === visualKey(b)) continue;

    const cands: CellSpec[] = [];
    // 부분만 적용한 결과(가장 그럴듯한 오답)
    for (const p of parts) {
      const src = p.tri && c.shape !== "triangle" ? { ...c, shape: "triangle" as Shape } : c;
      cands.push(p.apply(src));
    }
    // 다른 변환 결과
    for (const x of plain) if (!parts.includes(x)) cands.push(x.apply(c));
    cands.push(c, b, a);
    for (let i = 0; i < 8; i++) cands.push(mutate(d, rand));

    const { options, answerIdx } = assembleOptions(d, cands, 6, seed + attempt * 53);
    if (answerIdx < 0) continue;

    return {
      a,
      b,
      c,
      options,
      answer: answerIdx,
      sig: [a, b, c, d].map(visualKey).join(";"),
      prompt: "왼쪽의 변화 규칙을 오른쪽에도 똑같이 적용하세요. ?에 알맞은 도형은?",
      explanation: `왼쪽(A→B)에서는 ${parts
        .map((p) => TRANSFORM_KR[p.name] ?? p.name)
        .join(", 그리고 ")}. 오른쪽 C에도 같은 규칙을 적용한 도형이 정답입니다.`,
    };
  }
  return null;
}

/* ─────────────────── 수열(number) 추론 ─────────────────── */

interface RawSeries {
  terms: number[]; // 마지막 항이 정답
  answer: number;
  rule: string; // 규칙 한글 설명(해설용)
}

function numberSeries(rand: () => number, difficulty: Difficulty): RawSeries {
  // 난이도 1: 계차 증가 / 피보나치 / 등비 ×3
  if (difficulty === 1) {
    const kind = randInt(rand, 0, 2);
    if (kind === 0) {
      const a = randInt(rand, 1, 8);
      const e = randInt(rand, 2, 4);
      const t = [a];
      let cur = a;
      for (let i = 1; i < 6; i++) {
        cur += e + (i - 1);
        t.push(cur);
      }
      return { terms: t, answer: t[5], rule: "이전 항에 더하는 값이 1씩 커지는 계차수열입니다" };
    }
    if (kind === 1) {
      const a = randInt(rand, 1, 5);
      const b = randInt(rand, a + 1, a + 6);
      const t = [a, b];
      for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      return { terms: t, answer: t[5], rule: "앞의 두 항을 더하면 다음 항이 되는 피보나치식 수열입니다" };
    }
    const a = randInt(rand, 1, 4);
    const t = Array.from({ length: 5 }, (_, i) => a * 3 ** i);
    return { terms: t, answer: t[4], rule: "이전 항에 ×3 을 하는 등비수열입니다" };
  }

  // 난이도 2: ×2 후 +c / 2차식(계차 +2) / 두 등차 교차
  if (difficulty === 2) {
    const kind = randInt(rand, 0, 2);
    if (kind === 0) {
      const a = randInt(rand, 1, 3);
      const add = randInt(rand, 1, 4);
      const t = [a];
      for (let i = 1; i < 5; i++) t.push(t[i - 1] * 2 + add);
      return { terms: t, answer: t[4], rule: `이전 항에 ×2 를 한 뒤 ${add} 를 더합니다` };
    }
    if (kind === 1) {
      const a = randInt(rand, 1, 5);
      let cur = a;
      let dd = randInt(rand, 2, 5);
      const t = [a];
      for (let i = 1; i < 6; i++) {
        cur += dd;
        dd += 2;
        t.push(cur);
      }
      return { terms: t, answer: t[5], rule: "더하는 값이 2씩 커지는 2차식 수열입니다" };
    }
    const a = randInt(rand, 1, 6);
    const b = randInt(rand, 3, 9);
    const d1 = randInt(rand, 2, 4);
    const d2 = randInt(rand, 2, 5);
    const t: number[] = [];
    for (let i = 0; i < 6; i++) {
      t.push(i % 2 === 0 ? a + Math.floor(i / 2) * d1 : b + Math.floor((i - 1) / 2) * d2);
    }
    return { terms: t, answer: t[5], rule: "두 개의 등차수열이 한 칸씩 번갈아 나옵니다" };
  }

  // 난이도 3: ×3 후 +c / 곱 n·(n+1) / 교대연산(×2, +k) / 두 등비 교차
  const kind = randInt(rand, 0, 3);
  if (kind === 0) {
    const a = randInt(rand, 1, 3);
    const add = randInt(rand, 1, 4);
    const t = [a];
    for (let i = 1; i < 5; i++) t.push(t[i - 1] * 3 + add);
    return { terms: t, answer: t[4], rule: `이전 항에 ×3 을 한 뒤 ${add} 를 더합니다` };
  }
  if (kind === 1) {
    const k = randInt(rand, 2, 4);
    const t = Array.from({ length: 5 }, (_, i) => (i + k) * (i + k + 1));
    return { terms: t, answer: t[4], rule: "n×(n+1) 형태의 곱으로 이루어진 수열입니다" };
  }
  if (kind === 2) {
    const a = randInt(rand, 1, 4);
    const k = randInt(rand, 1, 5);
    const t = [a];
    let cur = a;
    for (let i = 1; i < 6; i++) {
      cur = i % 2 === 1 ? cur * 2 : cur + k;
      t.push(cur);
    }
    return { terms: t, answer: t[5], rule: `×2 와 +${k} 를 번갈아 적용합니다` };
  }
  const a = randInt(rand, 1, 3);
  const b = randInt(rand, 2, 4);
  const t: number[] = [];
  for (let i = 0; i < 6; i++) {
    t.push(i % 2 === 0 ? a * 2 ** Math.floor(i / 2) : b * 3 ** Math.floor((i - 1) / 2));
  }
  return { terms: t, answer: t[5], rule: "두 개의 등비수열이 한 칸씩 번갈아 나옵니다" };
}

function numberDistractors(terms: number[], answer: number, rand: () => number): number[] {
  const set = new Set<number>([answer]);
  const out: number[] = [];
  const lastDiff = terms.length >= 2 ? terms[terms.length - 1] - terms[terms.length - 2] : 1;
  const cand = [
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + lastDiff,
    answer - lastDiff,
    Math.round(answer * 1.5),
    Math.round(answer / 2),
    answer + 10,
  ];
  for (const c of shuffle(cand, rand)) {
    if (Number.isInteger(c) && c > 0 && !set.has(c)) {
      set.add(c);
      out.push(c);
      if (out.length >= 5) break;
    }
  }
  let g = 3;
  while (out.length < 5) {
    const c = answer + g;
    if (c > 0 && !set.has(c)) {
      set.add(c);
      out.push(c);
    }
    g = g > 0 ? -g : -g + 1;
    if (Math.abs(g) > 60) break;
  }
  return out;
}

/* ─────────────────── 문자열(letter) 추론 ─────────────────── */

function toLetter(pos: number): string {
  return String.fromCharCode(65 + (((pos % 26) + 26) % 26));
}

interface RawLetters {
  terms: string[];
  answerPos: number;
  rule: string; // 규칙 한글 설명(해설용)
}

function letterSeries(rand: () => number, difficulty: Difficulty): RawLetters {
  // 난이도 1: 간격 ≥2 등차 또는 두 계열 교차
  if (difficulty === 1) {
    if (rand() < 0.55) {
      const start = randInt(rand, 0, 12);
      const step = randInt(rand, 2, 5);
      const pos = Array.from({ length: 6 }, (_, i) => start + i * step);
      return {
        terms: pos.map(toLetter),
        answerPos: pos[5],
        rule: `알파벳 위치가 ${step} 칸씩 일정하게 건너뜁니다(등차)`,
      };
    }
    const s1 = randInt(rand, 0, 8);
    const s2 = randInt(rand, 0, 12);
    const d1 = randInt(rand, 1, 3);
    const d2 = randInt(rand, 1, 3);
    const pos = Array.from({ length: 6 }, (_, i) =>
      i % 2 === 0 ? s1 + Math.floor(i / 2) * d1 : s2 + Math.floor((i - 1) / 2) * d2,
    );
    return {
      terms: pos.map(toLetter),
      answerPos: pos[5],
      rule: "두 개의 알파벳 계열이 한 글자씩 번갈아 나옵니다",
    };
  }
  // 난이도 2: 간격이 점점 커짐
  if (difficulty === 2) {
    const start = randInt(rand, 0, 6);
    let cur = start;
    let st = randInt(rand, 1, 3);
    const pos = [start];
    for (let i = 1; i < 6; i++) {
      cur += st;
      st += 1;
      pos.push(cur);
    }
    return {
      terms: pos.map(toLetter),
      answerPos: pos[5],
      rule: "건너뛰는 간격이 1씩 점점 커집니다",
    };
  }
  // 난이도 3: 간격 큰 두 계열 교차 또는 간격 급증
  if (rand() < 0.5) {
    const s1 = randInt(rand, 0, 10);
    const s2 = randInt(rand, 0, 12);
    const d1 = randInt(rand, 2, 5);
    const d2 = randInt(rand, 2, 5);
    const pos = Array.from({ length: 6 }, (_, i) =>
      i % 2 === 0 ? s1 + Math.floor(i / 2) * d1 : s2 + Math.floor((i - 1) / 2) * d2,
    );
    return {
      terms: pos.map(toLetter),
      answerPos: pos[5],
      rule: "간격이 큰 두 개의 알파벳 계열이 번갈아 나옵니다",
    };
  }
  const start = randInt(rand, 0, 4);
  let cur = start;
  let st = randInt(rand, 2, 3);
  const pos = [start];
  for (let i = 1; i < 6; i++) {
    cur += st;
    st += 2;
    pos.push(cur);
  }
  return {
    terms: pos.map(toLetter),
    answerPos: pos[5],
    rule: "건너뛰는 간격이 2씩 급격히 커집니다",
  };
}

function letterDistractors(answerPos: number, rand: () => number): string[] {
  const norm = (p: number) => ((p % 26) + 26) % 26;
  const set = new Set<number>([norm(answerPos)]);
  const out: string[] = [];
  const cand = [answerPos + 1, answerPos - 1, answerPos + 2, answerPos - 2, answerPos + 3, answerPos - 3];
  for (const p of shuffle(cand, rand)) {
    if (!set.has(norm(p))) {
      set.add(norm(p));
      out.push(toLetter(p));
      if (out.length >= 5) break;
    }
  }
  let g = 4;
  while (out.length < 5 && g < 60) {
    if (!set.has(norm(answerPos + g))) {
      set.add(norm(answerPos + g));
      out.push(toLetter(answerPos + g));
    }
    g++;
  }
  return out;
}

interface BuiltSeries {
  sequence: string[];
  options: string[];
  answer: number;
  sig: string;
  prompt: string;
  explanation: string;
}

function makeSeries(seed: number, type: "number" | "letter", difficulty: Difficulty): BuiltSeries {
  const rand = rng(seed);
  if (type === "number") {
    const { terms, answer, rule } = numberSeries(rand, difficulty);
    const wrongs = numberDistractors(terms, answer, rand);
    const options = shuffle([String(answer), ...wrongs.map(String)], rng(seed * 17 + 3));
    return {
      sequence: [...terms.slice(0, -1).map(String), "?"],
      options,
      answer: options.indexOf(String(answer)),
      sig: terms.join(","),
      prompt: "다음 수열의 규칙을 찾아 ?에 들어갈 숫자를 고르세요.",
      explanation: `${rule}. 그래서 ?에 들어갈 값은 ${answer} 입니다.`,
    };
  }
  const { terms, answerPos, rule } = letterSeries(rand, difficulty);
  const answer = toLetter(answerPos);
  const wrongs = letterDistractors(answerPos, rand);
  const options = shuffle([answer, ...wrongs], rng(seed * 17 + 3));
  return {
    sequence: [...terms.slice(0, -1), "?"],
    options,
    answer: options.indexOf(answer),
    sig: terms.join(""),
    prompt: "다음 문자열의 규칙을 찾아 ?에 들어갈 문자를 고르세요.",
    explanation: `${rule}. 그래서 ?에 들어갈 글자는 ${answer} 입니다.`,
  };
}

/* ─────────────────── 문항 조립 ─────────────────── */

/** 유형/난이도 편성표 — 난이도 오름차순(1→3), 밴드별로 5개 유형을 순환 */
const TYPE_CYCLE: QuestionType[] = ["matrix", "number", "letter", "odd", "analogy"];
/** 밴드별 문항 수 — 쉬운 문항은 워밍업 수준으로만, 대부분 중·고난도 */
const BAND_SIZES: Record<Difficulty, number> = { 1: 6, 2: 12, 3: 18 };
const SCHEDULE: { type: QuestionType; difficulty: Difficulty }[] = ([1, 2, 3] as Difficulty[]).flatMap(
  (difficulty) =>
    Array.from({ length: BAND_SIZES[difficulty] }, (_, i) => ({
      type: TYPE_CYCLE[i % TYPE_CYCLE.length],
      difficulty,
    })),
);

function buildAll(): Question[] {
  const out: Question[] = [];
  const seen: Record<QuestionType, Set<string>> = {
    matrix: new Set(),
    number: new Set(),
    letter: new Set(),
    odd: new Set(),
    analogy: new Set(),
  };

  SCHEDULE.forEach((spec, idx) => {
    const id = idx + 1;
    const { type, difficulty } = spec;
    for (let salt = 0; salt < 200; salt++) {
      const seed = (id * 7919 + salt * 104729) >>> 0;

      if (type === "matrix") {
        const b = makeMatrix(seed, difficulty);
        if (b && !seen.matrix.has(b.sig)) {
          seen.matrix.add(b.sig);
          out.push({ id, type, difficulty, prompt: b.prompt, grid: b.grid, options: b.options, answer: b.answer, explanation: b.explanation });
          return;
        }
      } else if (type === "odd") {
        const b = makeOdd(seed, difficulty);
        if (b && !seen.odd.has(b.sig)) {
          seen.odd.add(b.sig);
          out.push({ id, type, difficulty, prompt: b.prompt, options: b.options, answer: b.answer, explanation: b.explanation });
          return;
        }
      } else if (type === "analogy") {
        const b = makeAnalogy(seed, difficulty);
        if (b && !seen.analogy.has(b.sig)) {
          seen.analogy.add(b.sig);
          out.push({
            id,
            type,
            difficulty,
            prompt: b.prompt,
            a: b.a,
            b: b.b,
            c: b.c,
            options: b.options,
            answer: b.answer,
            explanation: b.explanation,
          });
          return;
        }
      } else {
        const b = makeSeries(seed, type, difficulty);
        const distinct = new Set(b.options).size === b.options.length;
        if (b.answer >= 0 && distinct && !seen[type].has(b.sig)) {
          seen[type].add(b.sig);
          out.push({
            id,
            type,
            difficulty,
            prompt: b.prompt,
            sequence: b.sequence,
            options: b.options,
            answer: b.answer,
            explanation: b.explanation,
          });
          return;
        }
      }
    }
    throw new Error(`문항 생성 실패: #${id} (${type})`);
  });

  return out;
}

/** 전체 문제 은행 (결정적 · 중복 없음 · 난이도 오름차순) */
export const QUESTIONS: Question[] = buildAll();

export const TOTAL_QUESTIONS = QUESTIONS.length;
/** 문항당 40초 기준 제한시간(초) */
export const TIME_LIMIT_SECONDS = TOTAL_QUESTIONS * 40;
/** 유형별 한글 이름 */
export const TYPE_LABEL: Record<QuestionType, string> = {
  matrix: "도형 추론",
  number: "수열 추론",
  letter: "문자 추론",
  odd: "다른 하나 찾기",
  analogy: "도형 유추",
};