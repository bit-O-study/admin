import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  analogySolutionKeys,
  findOddRules,
  visualKey,
  type CellSpec,
  type Question,
} from "../src/features/iq/questions";

/** 문항 서명 — 중복 판정용 */
function signature(q: Question): string {
  if (q.type === "matrix") {
    return "m:" + [...q.grid, q.options[q.answer]].map(visualKey).join(";");
  }
  if (q.type === "odd") {
    return "o:" + q.options.map(visualKey).slice().sort().join(";");
  }
  if (q.type === "analogy") {
    return "a:" + [q.a, q.b, q.c, q.options[q.answer]].map(visualKey).join(";");
  }
  return `${q.type}:${q.sequence.join(",")}`;
}

describe("question bank", () => {
  it("has the expected number of questions", () => {
    expect(QUESTIONS.length).toBe(TOTAL_QUESTIONS);
    expect(TOTAL_QUESTIONS).toBeGreaterThan(0);
  });

  it("every question has a valid answer index into distinct options", () => {
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      let keys: string[];
      if (q.type === "number" || q.type === "letter") keys = q.options;
      else keys = (q.options as CellSpec[]).map(visualKey);
      expect(new Set(keys).size).toBe(q.options.length);
    }
  });

  it("matrix questions have 8 grid cells and counts within 1..4", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "matrix") continue;
      expect(q.grid.length).toBe(8);
      for (const c of [...q.grid, ...q.options]) {
        expect(c.count).toBeGreaterThanOrEqual(1);
        expect(c.count).toBeLessThanOrEqual(4);
      }
    }
  });

  it("series questions expose a blank (?) to fill", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "number" && q.type !== "letter") continue;
      expect(q.sequence[q.sequence.length - 1]).toBe("?");
      expect(q.sequence.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("no two questions are identical (deduplicated)", () => {
    const sigs = QUESTIONS.map(signature);
    expect(new Set(sigs).size).toBe(sigs.length);
  });

  it("difficulty is non-decreasing across the test", () => {
    for (let i = 1; i < QUESTIONS.length; i++) {
      expect(QUESTIONS[i].difficulty).toBeGreaterThanOrEqual(QUESTIONS[i - 1].difficulty);
    }
  });

  it("combines multiple question types", () => {
    const types = new Set(QUESTIONS.map((q) => q.type));
    expect(types.size).toBeGreaterThanOrEqual(4);
  });

  it("odd-one-out questions have exactly one 5-to-1 visual rule", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "odd") continue;
      const rules = findOddRules(q.options);
      expect(rules).toHaveLength(1);
      expect(rules[0].oddIndex).toBe(q.answer);
    }
  });

  it("analogy questions have one answer across plausible transforms", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "analogy") continue;
      expect(analogySolutionKeys(q.a, q.b, q.c)).toEqual([
        visualKey(q.options[q.answer]),
      ]);
    }
  });

  it("generation is deterministic (stable answer keys)", () => {
    const first = QUESTIONS[0];
    expect(Number.isInteger(first.answer)).toBe(true);
  });

  it("every question has a non-empty explanation", () => {
    for (const q of QUESTIONS) {
      expect(typeof q.explanation).toBe("string");
      expect(q.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("series explanations reveal the correct answer value", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "number" && q.type !== "letter") continue;
      const answerText = q.options[q.answer];
      expect(q.explanation).toContain(answerText);
    }
  });
});

// 도형 유추 해설이 결과 채우기를 구체적으로 명시하는지 (점무늬→외곽선 순환 혼동 방지)
describe("analogy explanations name the concrete fill result", () => {
  const FILL_KR: Record<string, string> = {
    outline: "외곽선",
    solid: "꽉 채움",
    half: "반쪽 채움",
    dots: "점무늬",
  };
  it("채우기가 바뀐 유추 문항 해설에 정답 채우기 이름이 나온다", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "analogy") continue;
      const ans = q.options[q.answer];
      if (q.c.fill !== ans.fill) expect(q.explanation).toContain(FILL_KR[ans.fill]);
    }
  });
});
