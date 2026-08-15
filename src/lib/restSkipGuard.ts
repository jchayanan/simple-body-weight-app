export function createRestSkipGuard() {
  let isActionInProgress = false;
  const beginAction = () => {
    if (isActionInProgress) return false;
    isActionInProgress = true;
    return true;
  };

  return {
    beginAction,
    canBeginAction: () => !isActionInProgress,
    beginSkip: beginAction,
    canContinueWorkout: () => !isActionInProgress,
    release: () => {
      isActionInProgress = false;
    },
  };
}
