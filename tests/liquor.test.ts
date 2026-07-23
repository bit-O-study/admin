import { describe, expect, it } from "vitest";

import {
  discountRate,
  formatKrw,
  isHttpUrl,
  normalizeSearch,
  pickLatestPrice,
  sanitizeLikeTerm,
  validateLiquorPatch,
  validatePriceInput,
  type LiquorPrice,
} from "../src/features/liquor/liquor";

function price(partial: Partial<LiquorPrice> & { id: number; crawledAt: string }): LiquorPrice {
  return {
    liquorId: 1,
    source: "test",
    currentPrice: 10000,
    originalPrice: null,
    ...partial,
  };
}

describe("normalizeSearch", () => {
  it("trims and lowercases", () => {
    expect(normalizeSearch("  Macallan 12  ")).toBe("macallan 12");
  });
});

describe("sanitizeLikeTerm", () => {
  it("strips PostgREST filter-breaking chars", () => {
    expect(sanitizeLikeTerm("glen(fiddich),12%*")).toBe("glen fiddich 12");
  });
  it("collapses whitespace", () => {
    expect(sanitizeLikeTerm("  a   b  ")).toBe("a b");
  });
});

describe("pickLatestPrice", () => {
  it("returns null for empty", () => {
    expect(pickLatestPrice([])).toBeNull();
  });
  it("picks the max crawledAt", () => {
    const latest = pickLatestPrice([
      price({ id: 1, crawledAt: "2026-01-01T00:00:00Z" }),
      price({ id: 2, crawledAt: "2026-03-01T00:00:00Z" }),
      price({ id: 3, crawledAt: "2026-02-01T00:00:00Z" }),
    ]);
    expect(latest?.id).toBe(2);
  });
});

describe("formatKrw", () => {
  it("formats with thousands separators", () => {
    expect(formatKrw(1234000)).toBe("₩1,234,000");
  });
  it("returns - for null/negative/NaN", () => {
    expect(formatKrw(null)).toBe("-");
    expect(formatKrw(-5)).toBe("-");
    expect(formatKrw(Number.NaN)).toBe("-");
  });
});

describe("discountRate", () => {
  it("computes rounded percentage", () => {
    expect(discountRate(8000, 10000)).toBe(20);
    expect(discountRate(6667, 10000)).toBe(33);
  });
  it("returns null when not a discount", () => {
    expect(discountRate(10000, 10000)).toBeNull();
    expect(discountRate(12000, 10000)).toBeNull();
    expect(discountRate(8000, null)).toBeNull();
    expect(discountRate(null, 10000)).toBeNull();
  });
});

describe("isHttpUrl", () => {
  it("accepts http/https", () => {
    expect(isHttpUrl("https://a.com/x.jpg")).toBe(true);
    expect(isHttpUrl("http://a.com")).toBe(true);
  });
  it("rejects other schemes / garbage", () => {
    expect(isHttpUrl("ftp://a.com")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});

describe("validateLiquorPatch", () => {
  it("accepts a full valid patch and normalizes empties to null", () => {
    const res = validateLiquorPatch({
      productName: "Macallan 12 Double Cask",
      normalizedName: "macallan 12",
      brand: "Macallan",
      category: "Single Malt",
      country: "Scotland",
      volumeMl: "700",
      alcoholPercent: "40",
      productUrl: "https://shop.example.com/macallan12",
      imageUrl: "  ",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.patch.volumeMl).toBe(700);
      expect(res.patch.alcoholPercent).toBe(40);
      expect(res.patch.imageUrl).toBeNull();
      expect(res.patch.productName).toBe("Macallan 12 Double Cask");
    }
  });

  it("requires normalizedName", () => {
    const res = validateLiquorPatch({ normalizedName: "   " });
    expect(res.ok).toBe(false);
  });

  it("rejects non-integer volume", () => {
    const res = validateLiquorPatch({ normalizedName: "x", volumeMl: "70.5" });
    expect(res.ok).toBe(false);
  });

  it("rejects out-of-range alcohol percent", () => {
    const res = validateLiquorPatch({ normalizedName: "x", alcoholPercent: "150" });
    expect(res.ok).toBe(false);
  });

  it("rejects non-http urls", () => {
    const res = validateLiquorPatch({
      normalizedName: "x",
      imageUrl: "javascript:alert(1)",
    });
    expect(res.ok).toBe(false);
  });

  it("allows empty optional numeric fields as null", () => {
    const res = validateLiquorPatch({
      normalizedName: "x",
      volumeMl: "",
      alcoholPercent: "",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.patch.volumeMl).toBeNull();
      expect(res.patch.alcoholPercent).toBeNull();
    }
  });
});
describe("validateLiquorPatch — 향 프로필/class", () => {
  it("향 점수(0~10)와 class 를 받는다", () => {
    const res = validateLiquorPatch({
      normalizedName: "x",
      clazz: "싱글몰트",
      sweet: "7",
      smoky: "3.5",
      body: "0",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.patch.clazz).toBe("싱글몰트");
      expect(res.patch.sweet).toBe(7);
      expect(res.patch.smoky).toBe(3.5);
      expect(res.patch.body).toBe(0);
      expect(res.patch.fruity).toBeNull();
    }
  });
  it("향 점수 범위(0~10) 밖은 거부", () => {
    expect(validateLiquorPatch({ normalizedName: "x", woody: "11" }).ok).toBe(false);
    expect(validateLiquorPatch({ normalizedName: "x", spicy: "-1" }).ok).toBe(false);
  });
});

describe("validatePriceInput", () => {
  it("정상 입력 — 콤마 제거하고 정상가 생략시 현재가로 채움", () => {
    const res = validatePriceInput({
      source: "emart_traders",
      currentPrice: "39,900",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.patch.source).toBe("EMART_TRADERS");
      expect(res.patch.currentPrice).toBe(39900);
      expect(res.patch.originalPrice).toBe(39900);
      expect(res.patch.productUrl).toBeNull();
    }
  });

  it("정상가 ≥ 현재가 이면 할인으로 저장", () => {
    const res = validatePriceInput({
      source: "EMART",
      currentPrice: "39900",
      originalPrice: "45000",
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.patch.originalPrice).toBe(45000);
  });

  it("지원하지 않는 판매처는 거부", () => {
    expect(validatePriceInput({ source: "GMARKET", currentPrice: "1000" }).ok).toBe(
      false,
    );
  });

  it("현재가 0/음수/빈값은 거부", () => {
    expect(validatePriceInput({ source: "EMART", currentPrice: "0" }).ok).toBe(false);
    expect(validatePriceInput({ source: "EMART", currentPrice: "" }).ok).toBe(false);
  });

  it("정상가가 현재가보다 작으면 거부", () => {
    expect(
      validatePriceInput({
        source: "EMART",
        currentPrice: "40000",
        originalPrice: "30000",
      }).ok,
    ).toBe(false);
  });

  it("잘못된 상품 URL 은 거부", () => {
    expect(
      validatePriceInput({
        source: "EMART",
        currentPrice: "1000",
        productUrl: "javascript:alert(1)",
      }).ok,
    ).toBe(false);
  });
});
