import { describe, expect, it } from "vitest";

import { seoulDayStartUtcIso } from "../src/lib/date";

describe("seoulDayStartUtcIso", () => {
  it("오전(KST) 시각 → 같은 날 한국 00:00 의 UTC(전날 15:00Z)", () => {
    // 2026-07-23 11:00 KST == 2026-07-23 02:00Z
    const now = new Date("2026-07-23T02:00:00Z");
    expect(seoulDayStartUtcIso(now)).toBe("2026-07-22T15:00:00.000Z");
  });

  it("UTC 자정 직후라도 한국은 이미 오전 9시 → 같은 한국 날짜 기준", () => {
    // 2026-07-23 00:30Z == 2026-07-23 09:30 KST
    const now = new Date("2026-07-23T00:30:00Z");
    expect(seoulDayStartUtcIso(now)).toBe("2026-07-22T15:00:00.000Z");
  });

  it("UTC 저녁이 한국에선 다음 날 새벽 → 다음 한국 날짜 기준", () => {
    // 2026-07-23 20:00Z == 2026-07-24 05:00 KST → 시작은 2026-07-23 15:00Z
    const now = new Date("2026-07-23T20:00:00Z");
    expect(seoulDayStartUtcIso(now)).toBe("2026-07-23T15:00:00.000Z");
  });

  it("한국 자정 경계(14:59Z=23:59 KST vs 15:00Z=익일 00:00 KST)", () => {
    expect(seoulDayStartUtcIso(new Date("2026-07-23T14:59:00Z"))).toBe(
      "2026-07-22T15:00:00.000Z",
    );
    expect(seoulDayStartUtcIso(new Date("2026-07-23T15:00:00Z"))).toBe(
      "2026-07-23T15:00:00.000Z",
    );
  });
});