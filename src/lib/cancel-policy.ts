export const MAX_STRIKES = 3;
export const MIN_REASON_LENGTH = 10;

/** A reason is valid when it has enough real text to explain the cancellation. */
export function isValidCancelReason(reason: string) {
  return reason.trim().length >= MIN_REASON_LENGTH;
}

/** Strikes only come from cancellations the charity rejected. */
export function countStrikes(statuses: string[]) {
  return statuses.filter((s) => s === "rejected").length;
}

export function strikesLeft(strikes: number) {
  return Math.max(0, MAX_STRIKES - strikes);
}

export const RELIANCE_NOTE =
  "People are counting on you. A no-show can leave a charity short-handed. If something comes up, that's okay: just cancel here and tell us why.";
