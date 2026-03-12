import { state, beers, resetStateForNewKeg } from './state.js';
import { saveState } from './storage.js';
import { renderAll, openKegSummaryModal, notifyLowBeer } from './ui.js';

function pushCompletedKegToHistory() {
  const served = state.history.filter((h) => !h.cancelled);
  const totalGlasses = served.length;

  const tally = {};
  served.forEach((h) => {
    const cl = Math.round((h.volume || 0) * 100);
    if (!tally[cl]) tally[cl] = 0;
    tally[cl] += 1;
  });

  const start = state.kegStartedAt ? new Date(state.kegStartedAt) : new Date();
  const end = state.kegFinishedAt ? new Date(state.kegFinishedAt) : new Date();
  const durationDays = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));

  state.kegHistory.push({
    beer: state.selectedBeer,
    glasses: totalGlasses,
    detail: Object.keys(tally).sort((a, b) => parseFloat(a) - parseFloat(b)).map((cl) => `${tally[cl]}×${cl} cL`).join(' • '),
    startedAt: state.kegStartedAt,
    finishedAt: state.kegFinishedAt,
    finishedDate: end.toLocaleDateString(),
    durationDays
  });
}

export function showKegSummary() {
  const served = state.history.filter((h) => !h.cancelled);
  const totalGlasses = served.length;

  const tally = {};
  served.forEach((h) => {
    const cl = Math.round((h.volume || 0) * 100);
    if (!tally[cl]) tally[cl] = 0;
    tally[cl] += 1;
  });

  const start = state.kegStartedAt ? new Date(state.kegStartedAt) : null;
  const end = state.kegFinishedAt ? new Date(state.kegFinishedAt) : new Date();
  let days = 0;
  if (start) {
    const ms = Math.max(0, end - start);
    days = ms / (1000 * 60 * 60 * 24);
  }

  const parts = Object.keys(tally)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .map((cl) => `${tally[cl]}×${cl} cL`);

  const beerName = document.getElementById('beerName')?.innerText || 'Bière';
  const startStr = start ? start.toLocaleDateString() : '--/--/----';
  const endStr = end ? end.toLocaleDateString() : '--/--/----';

  openKegSummaryModal({
    beerName,
    totalGlasses,
    detail: parts.length ? parts.join(' • ') : '—',
    days,
    startStr,
    endStr
  });
}

export function serveGlass(cl) {
  if (navigator.vibrate) {
  navigator.vibrate(10);
}
  if (state.remainingVolume <= 0) return;
  const oldRemaining = state.remainingVolume;
  const l = cl / 100;
  state.remainingVolume = Math.max(0, state.remainingVolume - l);

  if (state.remainingVolume <= 1 && !state.lowBeerNotified) {
    state.lowBeerNotified = true;
    notifyLowBeer();
  }

  if (oldRemaining > 0 && state.remainingVolume === 0) {
    state.kegFinishedAt = new Date().toISOString();
  }

  state.history.unshift({
    volume: l,
    cancelled: false,
    time: new Date().toLocaleTimeString()
  });

  renderAll();
  saveState();

  if (oldRemaining > 0 && state.remainingVolume === 0 && !state.summaryShown) {
    pushCompletedKegToHistory();
    state.summaryShown = true;
    saveState();
    showKegSummary();
  }
}

export function undoLast() {
  for (let i = 0; i < state.history.length; i++) {
    if (!state.history[i].cancelled) {
      state.remainingVolume = Math.min(state.totalVolume, state.remainingVolume + state.history[i].volume);
      state.history[i].cancelled = true;
      break;
    }
  }
  renderAll();
  saveState();
}

export function addCustomGlass() {
  if (state.remainingVolume <= 0) return;
  const cl = prompt('Entrez le volume du verre (cL) :', '40');
  if (cl !== null) {
    const numeric = parseFloat(cl);
    if (Number.isFinite(numeric) && numeric > 0) serveGlass(numeric);
  }
}

export function changeKeg(skipConfirm = false) {
  if (!skipConfirm && state.remainingVolume > 0 && state.remainingVolume < state.totalVolume) {
    const confirmReset = confirm(
      "Le fût actuel n'est pas vide (" + state.remainingVolume.toFixed(2) + " L restants). Voulez-vous vraiment le remplacer ?"
    );
    if (!confirmReset) {
      const select = document.getElementById('beerSelect');
      if (select) select.value = state.selectedBeer;
      return;
    }
  }

  const select = document.getElementById('beerSelect');
  const selectedName = select?.value || beers[0].name;
  state.selectedBeer = selectedName;

  resetStateForNewKeg(selectedName);
  renderAll();
  saveState();
}
