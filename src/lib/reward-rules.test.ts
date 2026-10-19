import { describe, expect, test } from "vitest";
import { canRedeemWelcomeReward } from "./reward-rules";

describe("first-action welcome reward", () => {
  test("includes rewards costing 150 points or less", () => {
    expect(canRedeemWelcomeReward(true, 60)).toBe(true);
    expect(canRedeemWelcomeReward(true, 150)).toBe(true);
  });
  test("excludes rewards above 150 points", () => {
    expect(canRedeemWelcomeReward(true, 151)).toBe(false);
    expect(canRedeemWelcomeReward(true, 220)).toBe(false);
    expect(canRedeemWelcomeReward(true, 300)).toBe(false);
  });
  test("requires the first action", () => {
    expect(canRedeemWelcomeReward(false, 100)).toBe(false);
  });
});