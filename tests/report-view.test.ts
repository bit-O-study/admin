import { describe, expect, it } from "vitest";

import {
  banBadgeLabel,
  formatReportTime,
  reportActionState,
  suspendButtonLabel,
} from "../src/features/health/report-view";

const NOW = new Date("2026-07-28T00:00:00Z");
const FUTURE = "2026-08-04T00:00:00Z";
const PAST = "2026-07-01T00:00:00Z";

describe("reportActionState — 조치가 서로를 막지 않는다", () => {
  it("정지된 작성자라도 콘텐츠가 남아 있으면 삭제 가능", () => {
    const s = reportActionState(
      {
        status: "open",
        contentExists: true,
        targetUserId: "u1",
        suspendedUntil: FUTURE,
      },
      NOW,
    );
    expect(s.banState).toBe("suspended");
    expect(s.canDelete).toBe(true);
    expect(s.canSuspend).toBe(true);
  });

  it("처리완료된 신고여도 삭제·정지 버튼은 살아있다", () => {
    const s = reportActionState(
      { status: "resolved", contentExists: true, targetUserId: "u1" },
      NOW,
    );
    expect(s.resolved).toBe(true);
    expect(s.canDelete).toBe(true);
    expect(s.canSuspend).toBe(true);
  });

  it("이미 삭제된 콘텐츠는 삭제 불가, 정지는 여전히 가능", () => {
    const s = reportActionState(
      { status: "open", contentExists: false, targetUserId: "u1" },
      NOW,
    );
    expect(s.contentDeleted).toBe(true);
    expect(s.canDelete).toBe(false);
    expect(s.canSuspend).toBe(true);
  });

  it("작성자를 모르면 정지 불가", () => {
    const s = reportActionState(
      { status: "open", contentExists: true, targetUserId: null },
      NOW,
    );
    expect(s.canSuspend).toBe(false);
  });

  it("정지 만료가 지났으면 active / 영구정지는 banned", () => {
    expect(
      reportActionState(
        {
          status: "open",
          contentExists: true,
          targetUserId: "u1",
          suspendedUntil: PAST,
        },
        NOW,
      ).banState,
    ).toBe("active");
    expect(
      reportActionState(
        {
          status: "open",
          contentExists: true,
          targetUserId: "u1",
          bannedAt: PAST,
        },
        NOW,
      ).banState,
    ).toBe("banned");
  });
});

describe("정지 버튼/뱃지 문구", () => {
  it("정지 중이면 '기간 변경'", () => {
    expect(suspendButtonLabel("active")).toBe("작성자 정지");
    expect(suspendButtonLabel("suspended")).toBe("정지 기간 변경");
  });

  it("정상 회원은 뱃지 없음", () => {
    expect(banBadgeLabel("active", null)).toBeNull();
    expect(banBadgeLabel("banned", null)).toBe("영구정지");
    expect(banBadgeLabel("suspended", FUTURE)).toBe("정지 중 · ~2026. 8. 4.");
  });
});

// 서버/브라우저 로케일 차이로 "오전" vs "AM" 하이드레이션 미스매치가 났었다.
describe("formatReportTime — 로케일 무관 한국시간 고정", () => {
  it("UTC 를 KST(+9)로 바꿔 표기", () => {
    expect(formatReportTime("2026-07-28T01:44:19Z")).toBe(
      "2026. 7. 28. 오전 10:44",
    );
    expect(formatReportTime("2026-07-28T05:30:00Z")).toBe(
      "2026. 7. 28. 오후 2:30",
    );
    expect(formatReportTime("nope")).toBe("");
  });
});