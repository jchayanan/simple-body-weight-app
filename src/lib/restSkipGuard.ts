export function createRestSkipGuard() {
  let isSkippingRest = false;

  return {
    beginSkip: () => {
      if (isSkippingRest) return false;
      isSkippingRest = true;
      return true;
    },
    canContinueWorkout: () => !isSkippingRest,
    release: () => {
      isSkippingRest = false;
    },
  };
}
