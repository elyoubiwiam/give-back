import { describe, expect, test } from "vitest";
import { computeKpis, isValidTaskMinutes, MAX_TASK_MINUTES, taskPhase } from "./charity-stats";

const task = (id: string, spots: number, minutes = 60) => ({ id, spots, minutes, starts_at: null, created_at: "2026-10-01T00:00:00Z", cause: "Health" });
const b = (task_id: string, volunteer_id: string, kind = "booked") => ({ kind, task_id, volunteer_id, created_at: "2026-10-02T00:00:00Z" });

describe("task duration", () => {
  test("half a day (240 min) is the maximum", () => {
    expect(MAX_TASK_MINUTES).toBe(240);
    expect(isValidTaskMinutes(240)).toBe(true);
    expect(isValidTaskMinutes(241)).toBe(false);
  });
});

describe("charity KPIs", () => {
  test("returning volunteers are those who came to 2+ tasks", () => {
    const k = computeKpis([task("a", 2), task("b", 2)], [b("a", "u1"), b("b", "u1"), b("a", "u2")]);
    expect(k.volunteers).toBe(2);
    expect(k.returningPct).toBe(50);
  });
  test("fill rate is bookings over spots offered", () => {
    expect(computeKpis([task("a", 4)], [b("a", "u1")]).fillPct).toBe(25);
  });
  test("cancellation rate counts cancellations among all bookings", () => {
    expect(computeKpis([task("a", 4)], [b("a", "u1"), b("a", "u2", "cancelled")]).cancelPct).toBe(50);
  });
  test("ongoing means happening today in UK time", () => {
    const now = new Date("2026-10-21T12:00:00Z");
    expect(taskPhase({ starts_at: "2026-10-21T18:00:00Z" }, now)).toBe("ongoing");
    expect(taskPhase({ starts_at: "2026-10-25T10:00:00Z" }, now)).toBe("upcoming");
    expect(taskPhase({ starts_at: "2026-10-01T10:00:00Z" }, now)).toBe("past");
  });
});
