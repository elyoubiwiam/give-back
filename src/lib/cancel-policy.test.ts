import { describe, expect, it } from "vitest";
import { MAX_STRIKES, countStrikes, isValidCancelReason, strikesLeft } from "./cancel-policy";

describe("cancellation policy", () => {
  it("allows three strikes", () => expect(MAX_STRIKES).toBe(3));
  it("requires a reason", () => {
    expect(isValidCancelReason("   ")).toBe(false);
    expect(isValidCancelReason("I'm ill today")).toBe(true);
  });
  it("only rejected reasons count as strikes", () => {
    expect(countStrikes(["approved", "pending", "rejected", "rejected"])).toBe(2);
  });
  it("never goes below zero strikes left", () => expect(strikesLeft(5)).toBe(0));
});
