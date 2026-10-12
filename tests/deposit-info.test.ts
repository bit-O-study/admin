import { describe, expect, it } from "vitest";

import {
  EMPTY_DEPOSIT,
  depositLine,
  isDepositReady,
  parseDepositInfo,
} from "../src/features/health/billing/deposit-info";

const FULL = {
  bank: "국민은행",
  account: "123456-78-901234",
  holder: "홍길동",
  note: "입금자명을 상호로",
};

describe("입금 계좌 안내 파싱", () => {
  it("네 값을 그대로 읽는다", () => {
    expect(parseDepositInfo(FULL)).toEqual(FULL);
  });

  it("앞뒤 공백을 턴다", () => {
    expect(parseDepositInfo({ ...FULL, bank: "  국민은행  " }).bank).toBe("국민은행");
  });

  it("🔴 모양이 깨졌으면 빈 값 — 화면이 죽지 않게", () => {
    for (const bad of [null, undefined, "국민은행", 42, ["a"], true]) {
      expect(parseDepositInfo(bad)).toEqual(EMPTY_DEPOSIT);
    }
  });

  it("문자열이 아닌 필드는 버린다", () => {
    expect(parseDepositInfo({ bank: 1, account: null, holder: {}, note: [] })).toEqual(
      EMPTY_DEPOSIT,
    );
  });

  it("너무 긴 값은 자른다", () => {
    expect(parseDepositInfo({ ...FULL, note: "가".repeat(500) }).note.length).toBe(200);
  });
});

describe("띄울 준비가 됐나", () => {
  it("은행·계좌·예금주가 다 있어야 한다", () => {
    expect(isDepositReady(FULL)).toBe(true);
  });

  it("🔴 하나라도 비면 안 띄운다 — 반쯤 채운 안내는 없는 것보다 나쁘다", () => {
    // 예금주 없는 계좌번호는 입금할 때 확인할 방법이 없고,
    // 은행 없는 계좌번호는 아예 못 넣는다.
    for (const k of ["bank", "account", "holder"] as const) {
      expect(isDepositReady({ ...FULL, [k]: "" }), `${k} 가 비었는데 띄운다`).toBe(false);
    }
  });

  it("안내 문구는 없어도 된다", () => {
    expect(isDepositReady({ ...FULL, note: "" })).toBe(true);
  });

  it("한 줄 표기 — 준비 안 됐으면 빈 문자열", () => {
    expect(depositLine(FULL)).toBe("국민은행 123456-78-901234 (홍길동)");
    expect(depositLine({ ...FULL, holder: "" })).toBe("");
  });
});
