import { describe, expect, it } from "vitest";
import { buildFriendVisibleEntry, type EntryForPrivacyFilter } from "./privacy";

const baseEntry: EntryForPrivacyFilter = {
  date: "2026-08-01",
  priorities: [{ done: true, text: "Ship the backend" }],
  completed: ["Wrote the schema"],
  pending: [],
  nextSteps: ["Deploy"],
  reflection: "SECRET reflection",
  wentWell: "SECRET went well",
  challenges: "SECRET challenges",
  gratitude: ["Grateful for coffee"],
  lifeForcePhysical: "SECRET physical",
  lifeForceHuman: "SECRET human",
  lifeForceSelf: "SECRET self",
  improve: "SECRET improve",
  shareReflection: false,
  shareGratitude: true,
  shareLifeForce: false,
  shareImprove: false,
};

describe("buildFriendVisibleEntry", () => {
  it("always includes the accountability sections", () => {
    const visible = buildFriendVisibleEntry(baseEntry);
    expect(visible.priorities).toEqual(baseEntry.priorities);
    expect(visible.completed).toEqual(baseEntry.completed);
    expect(visible.pending).toEqual(baseEntry.pending);
    expect(visible.nextSteps).toEqual(baseEntry.nextSteps);
  });

  it("never includes an unshared private section, not even as a key", () => {
    const visible = buildFriendVisibleEntry(baseEntry);
    expect("reflection" in visible).toBe(false);
    expect("wentWell" in visible).toBe(false);
    expect("challenges" in visible).toBe(false);
    expect("lifeForcePhysical" in visible).toBe(false);
    expect("lifeForceHuman" in visible).toBe(false);
    expect("lifeForceSelf" in visible).toBe(false);
    expect("improve" in visible).toBe(false);
  });

  it("never lets unshared private text reach the serialized output", () => {
    const visible = buildFriendVisibleEntry(baseEntry);
    expect(JSON.stringify(visible)).not.toContain("SECRET");
  });

  it("includes a section once the owner has shared it", () => {
    const visible = buildFriendVisibleEntry(baseEntry);
    expect(visible.gratitude).toEqual(baseEntry.gratitude);
  });

  it("includes every private section when all are shared", () => {
    const visible = buildFriendVisibleEntry({
      ...baseEntry,
      shareReflection: true,
      shareLifeForce: true,
      shareImprove: true,
    });
    expect(visible.reflection).toBe(baseEntry.reflection);
    expect(visible.wentWell).toBe(baseEntry.wentWell);
    expect(visible.challenges).toBe(baseEntry.challenges);
    expect(visible.lifeForcePhysical).toBe(baseEntry.lifeForcePhysical);
    expect(visible.lifeForceHuman).toBe(baseEntry.lifeForceHuman);
    expect(visible.lifeForceSelf).toBe(baseEntry.lifeForceSelf);
    expect(visible.improve).toBe(baseEntry.improve);
  });

  it("shares reflection sub-fields as a group, not independently", () => {
    const visible = buildFriendVisibleEntry({
      ...baseEntry,
      shareReflection: true,
      shareGratitude: false,
    });
    expect(visible.reflection).toBe(baseEntry.reflection);
    expect(visible.wentWell).toBe(baseEntry.wentWell);
    expect(visible.challenges).toBe(baseEntry.challenges);
    // other private sections stay untouched by this toggle
    expect("gratitude" in visible).toBe(false);
    expect("improve" in visible).toBe(false);
  });
});
