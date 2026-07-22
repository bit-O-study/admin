import { describe, expect, it } from "vitest";

import {
  discountRate,
  formatKrw,
  isHttpUrl,
  normalizeSearch,
  pickLatestPrice,
  sanitizeLikeTerm,
  validateLiquorPatch,
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