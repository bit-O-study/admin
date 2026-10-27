import { describe, expect, it } from "vitest";

import { judgeAppErrors, judgeCron, judgeLatency, judgeProject, summarize, worstLevel, type StatusItem } from "../src/features/admin/status-model";

const item = (level: StatusItem["level"]): StatusItem => ({ key: level + Math.random(), label: "x", scope: "health", level, detail: "", href: "/admin" });

describe("worstLevel / summarize", () => {
  it("장애 > 주의 > 확인 불가 > 정상", () => {
    expect(worstLevel([item("ok"), item("unknown")])).toBe("unknown");
    expect(worstLevel([item("unknown"), item("warn")])).toBe("warn");
    expect(worstLevel([item("warn"), item("down"), item("ok")])).toBe("down");
    expect(worstLevel([])).toBe("ok");
  });

  it("알약 문구는 가장 나쁜 단계의 건수를 말한다", () => {
    expect(summarize([item("ok"), item("ok")]).label).toBe("모두 정상");
    expect(summarize([item("ok"), item("warn"), item("warn")]).label).toBe("2건 확인 필요");
    expect(summarize([item("warn"), item("down")]).label).toBe("장애 1건");
    expect(summarize([item("ok"), item("unknown")]).label).toBe("1건 확인 불가");
  });
});

describe("judge", () => {
  it("응답: 실패는 장애, 느리면 주의", () => {
    expect(judgeLatency(false, 10).level).toBe("down");
    expect(judgeLatency(true, 2000).level).toBe("warn");
    expect(judgeLatency(true, 120)).toEqual({ level: "ok", detail: "응답 120ms" });
  });

  it("크론: 기록 없음·마지막 실패는 주의, 건너뜀은 정상", () => {
    expect(judgeCron({ lastRunAt: null, lastStatus: null, lastFailure: null }).level).toBe("warn");
    expect(judgeCron({ lastRunAt: "2026-10-27T00:00:00Z", lastStatus: "error", lastFailure: { reason: "timeout" } })).toEqual({ level: "warn", detail: "마지막 실행 실패 · timeout" });
    expect(judgeCron({ lastRunAt: "2026-10-27T00:00:00Z", lastStatus: "skipped", lastFailure: null }).level).toBe("ok");
  });

  it("앱 오류: 하나라도 있으면 주의", () => {
    expect(judgeAppErrors(0, 14).level).toBe("ok");
    expect(judgeAppErrors(7, 14)).toEqual({ level: "warn", detail: "오류 7건 / 14일" });
  });

  it("서버 앱: 응답 없음·의도치 않은 멈춤은 장애, 꺼 둔 것은 정상, 배포 전은 확인 불가", () => {
    const sha = "a".repeat(40);
    expect(judgeProject({ state: "unhealthy", desired: "on", sha }).level).toBe("down");
    expect(judgeProject({ state: "stopped", desired: "on", sha }).level).toBe("down");
    expect(judgeProject({ state: "stopped", desired: "off", sha })).toEqual({ level: "ok", detail: "꺼 둠" });
    expect(judgeProject({ state: "not-deployed", desired: "on", sha: null }).level).toBe("unknown");
    expect(judgeProject({ state: "running", desired: "on", sha, deployment: { ci: { state: "failure" } } })).toEqual({ level: "warn", detail: "CI 실패 · aaaaaaa" });
    expect(judgeProject({ state: "running", desired: "on", sha }).detail).toBe("실행 중 · aaaaaaa");
  });
});
