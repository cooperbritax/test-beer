import { state, beers } from './state.js';
import { loadState, saveState } from './storage.js';
import {
  populateBeerSelect,
  renderAll,
  initGaugeBubbles,
  closeKegSummaryModal,
  openKegHistoryModal,
  closeKegHistoryModal,
  clearKegHistory,
  setCopyrightYear,
  requestNotificationPermissionIfNeeded
} from './ui.js';
import { serveGlass, undoLast, addCustomGlass, changeKeg } from './keg.js';

function bindEvents() {
  const select = document.getElementById('beerSelect');
  const btn25 = document.getElementById('btn25');
  const btn33 = document.getElementById('btn33');
  const btn50 = document.getElementById('btn50');
  const btnUndo = document.getElementById('btnUndo');
  const btnCustom = document.getElementById('btnCustom');
  const btnHistory = document.getElementById('btnHistory');
  const clearKegHistoryBtn = document.getElementById('clearKegHistoryBtn');

  if (select) select.addEventListener('change', () => changeKeg());
  if (btn25) btn25.addEventListener('click', () => serveGlass(25));
  if (btn33) btn33.addEventListener('click', () => serveGlass(33));
  if (btn50) btn50.addEventListener('click', () => serveGlass(50));
  if (btnUndo) btnUndo.addEventListener('click', undoLast);
  if (btnCustom) btnCustom.addEventListener('click', addCustomGlass);
  if (btnHistory) btnHistory.addEventListener('click', openKegHistoryModal);
  if (clearKegHistoryBtn) clearKegHistoryBtn.addEventListener('click', () => {
    const ok = confirm('Voulez-vous vraiment supprimer tout l\'historique des fûts ?');
    if (!ok) return;
    clearKegHistory();
    saveState();
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === 'kegSummaryBackdrop' || t.id === 'kegSummaryOk' || t.id === 'kegSummaryClose') {
      closeKegSummaryModal();
    }
    if (t.id === 'kegHistoryBackdrop' || t.id === 'kegHistoryOk' || t.id === 'kegHistoryClose') {
      closeKegHistoryModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeKegSummaryModal();
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateBeerSelect();
  bindEvents();
  initGaugeBubbles();
  setCopyrightYear();
  requestNotificationPermissionIfNeeded();

  if (!loadState()) {
    state.selectedBeer = beers[0].name;
    changeKeg(true);
  } else {
    renderAll();
  }

  saveState();
  registerServiceWorker();
});
