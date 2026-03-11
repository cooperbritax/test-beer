import { state, beers } from './state.js';

export const STORAGE_KEY = 'beerTracker.preview6.v2';

export function saveState() {
  try {
    const payload = {
      totalVolume: state.totalVolume,
      remainingVolume: state.remainingVolume,
      history: state.history,
      selectedBeer: state.selectedBeer,
      kegStartedAt: state.kegStartedAt,
      kegFinishedAt: state.kegFinishedAt,
      summaryShown: state.summaryShown,
      kegDateText: document.getElementById('kegDate')?.innerText || ''
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Ignore storage failures
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);

    if (typeof data.totalVolume === 'number') state.totalVolume = data.totalVolume;
    if (typeof data.remainingVolume === 'number') state.remainingVolume = data.remainingVolume;
    if (Array.isArray(data.history)) state.history = data.history;
    if (typeof data.selectedBeer === 'string' && beers.some(b => b.name === data.selectedBeer)) {
      state.selectedBeer = data.selectedBeer;
    }
    if (typeof data.kegStartedAt === 'string') state.kegStartedAt = data.kegStartedAt;
    if (typeof data.kegFinishedAt === 'string' || data.kegFinishedAt === null) state.kegFinishedAt = data.kegFinishedAt;
    if (typeof data.summaryShown === 'boolean') state.summaryShown = data.summaryShown;
    return true;
  } catch (e) {
    return false;
  }
}
