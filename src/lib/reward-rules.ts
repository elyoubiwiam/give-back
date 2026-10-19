export const WELCOME_REWARD_MAX_POINTS = 150;

export function canRedeemWelcomeReward(hasFirstAction: boolean, cost: number) {
  return hasFirstAction && cost <= WELCOME_REWARD_MAX_POINTS;
}