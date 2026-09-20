// Pure client-side training logic (no network required)

export interface SetData {
  reps: number;
  weight: number;
  rpe: number;
}

export const trainingEngine = {
  /**
   * Analyzes a completed exercise and determines if the user has plateaued
   * or if they need a deload week.
   */
  analyzePerformance(previousSets: SetData[], currentSets: SetData[]) {
    if (!previousSets || previousSets.length === 0) return { status: 'progressing', suggestion: null };

    // Simple RPE and volume heuristic
    const currentVolume = currentSets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
    const prevVolume = previousSets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
    
    const avgCurrentRpe = currentSets.reduce((acc, set) => acc + set.rpe, 0) / currentSets.length;

    if (currentVolume <= prevVolume && avgCurrentRpe >= 9) {
      return {
        status: 'plateau',
        suggestion: 'RPE is high and volume stagnated. Consider dropping weight by 10% next session.'
      };
    }

    if (avgCurrentRpe >= 9.5) {
      return {
        status: 'fatigue_high',
        suggestion: 'You pushed very close to failure across all sets. Ensure adequate recovery.'
      };
    }

    return { status: 'progressing', suggestion: 'Great session, maintain current progression.' };
  }
};
