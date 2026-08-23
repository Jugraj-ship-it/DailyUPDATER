import { describe, expect, it } from "vitest";
import { computeStreak, computeConsistency } from "./gamification";

describe("computeStreak", () => {
  it("is 0 with no entries", () => {
    expect(computeStreak([], "2026-08-10")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const dates = ["2026-08-08", "2026-08-09", "2026-08-10"];
    expect(computeStreak(dates, "2026-08-10")).toBe(3);
  });

  it("still counts the streak as alive if today isn't checked in yet", () => {
    const dates = ["2026-08-08", "2026-08-09"];
    expect(computeStreak(dates, "2026-08-10")).toBe(2);
  });

  it("resets to 0 once yesterday is missing and today isn't checked in", () => {
    const dates = ["2026-08-05", "2026-08-06"];
    expect(computeStreak(dates, "2026-08-10")).toBe(0);
  });

  it("stops counting at the first gap", () => {
    const dates = ["2026-08-01", "2026-08-08", "2026-08-09", "2026-08-10"];
    expect(computeStreak(dates, "2026-08-10")).toBe(3);
  });
});

describe("computeConsistency", () => {
  it("is 0 with no entries", () => {
    expect(computeConsistency([], "2026-08-10", 30)).toBe(0);
  });

  it("is 100 when every day in the window has an entry", () => {
    const dates = Array.from({ length: 10 }, (_, i) => {
      const d = new Date("2026-08-10T12:00:00");
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    expect(computeConsistency(dates, "2026-08-10", 10)).toBe(100);
  });

  it("rounds to the nearest percent for a partial window", () => {
    // 3 of 10 days = 30%
    const dates = ["2026-08-10", "2026-08-09", "2026-08-08"];
    expect(computeConsistency(dates, "2026-08-10", 10)).toBe(30);
  });
});
