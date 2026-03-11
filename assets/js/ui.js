import { state, beers } from './state.js';

export function populateBeerSelect() {
  const select = document.getElementById('beerSelect');
  if (!select) return;
  select.innerHTML = '';
  beers.forEach((beer) => {
    const option = document.createElement('option');
    option.value = beer.name;
    option.text = beer.name;
    select.appendChild(option);
  });
  select.value = state.selectedBeer;
}

export function renderBeerInfo() {
  const beer = beers.find((b) => b.name === state.selectedBeer) || beers[0];
  const select = document.getElementById('beerSelect');
  const beerName = document.getElementById('beerName');
  const kegImage = document.getElementById('kegImage');
  const kegDate = document.getElementById('kegDate');

  if (select) select.value = beer.name;
  if (beerName) beerName.innerText = beer.name;
  if (kegImage) kegImage.src = beer.img;
  if (kegDate) kegDate.innerText = 'Date de mise en service : ' + new Date(state.kegStartedAt).toLocaleDateString();
}

export function renderHistory() {
  const histDiv = document.getElementById('history');
  if (!histDiv) return;
  histDiv.innerHTML = '';
  state.history.forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = '<span>' + entry.time + '</span><span>' + (entry.volume * 100) + ' cL</span><span>' + (entry.cancelled ? '✖' : '✔') + '</span>';
    histDiv.appendChild(div);
  });
}

export function renderLowBeerWarning() {
  const el = document.getElementById('lowBeerWarning');
  if (!el) return;
  const show = state.remainingVolume <= 1 && state.remainingVolume > 0;
  el.hidden = !show;
}

export function clearKegHistory() {
  state.kegHistory = [];
  renderKegHistory();
}

export function updateGauge() {
  const percent = Math.round((state.remainingVolume / state.totalVolume) * 100);
  const percentEl = document.getElementById('percent');
  const volumeEl = document.getElementById('volume');
  const gc = document.getElementById('glassCount');
  const circle = document.querySelector('.circle');

  if (percentEl) percentEl.innerText = percent + '%';
  if (volumeEl) volumeEl.innerText = state.remainingVolume.toFixed(2) + ' L / ' + state.totalVolume.toFixed(2) + ' L';

  const remainingCl = Math.max(0, Math.floor(state.remainingVolume * 100));
  const n25 = Math.floor(remainingCl / 25);
  const n33 = Math.floor(remainingCl / 33);
  const n50 = Math.floor(remainingCl / 50);
  if (gc) gc.innerText = `≈ ${n25}×25cL  •  ${n33}×33cL  •  ${n50}×50cL`;

  if (circle) {
    const circumference = 2 * Math.PI * 100;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - state.remainingVolume / state.totalVolume));

    const remainingRounded = parseFloat(state.remainingVolume.toFixed(2));
    if (remainingRounded <= 0.33) circle.setAttribute('stroke', '#e74c3c');
    else if (remainingRounded <= 1.0) circle.setAttribute('stroke', '#e67e22');
    else circle.setAttribute('stroke', '#f2c200');
  }

  disableButtonsIfEmpty();
}

export function disableButtonsIfEmpty() {
  const disabled = state.remainingVolume <= 0;
  ['btn25', 'btn33', 'btn50', 'btnCustom'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = disabled;
    el.style.opacity = disabled ? 0.5 : 1;
  });
}

export function initGaugeBubbles() {
  const layer = document.getElementById('bubbleLayer');
  if (!layer || layer.childElementCount) return;
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.left = Math.random() * 100 + '%';
    b.style.animationDuration = 2 + Math.random() * 3 + 's';
    b.style.animationDelay = Math.random() * 3 + 's';
    layer.appendChild(b);
  }
}

export function openKegSummaryModal({ beerName, totalGlasses, detail, days, startStr, endStr }) {
  const modal = document.getElementById('kegSummaryModal');
  const backdrop = document.getElementById('kegSummaryBackdrop');
  if (!modal || !backdrop) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('kegSummaryBeer', beerName);
  setText('kegSummaryGlasses', String(totalGlasses));
  setText('kegSummaryDetail', detail || '—');
  setText('kegSummaryDuration', `${days.toFixed(1)} jour(s)`);
  setText('kegSummaryDates', `Du ${startStr} au ${endStr}`);

  backdrop.classList.add('is-open');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');

  const ok = document.getElementById('kegSummaryOk');
  if (ok) ok.focus();
}

export function renderKegHistory() {
  const list = document.getElementById('kegHistoryList');
  if (!list) return;
  list.innerHTML = '';

  if (!state.kegHistory.length) {
    const empty = document.createElement('div');
    empty.className = 'history-item';
    empty.innerHTML = '<span>Aucun fût terminé</span><span>—</span><span>—</span>';
    list.appendChild(empty);
    return;
  }

  state.kegHistory.slice().reverse().forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = '<span><strong>' + item.beer + '</strong><br><small>' + item.finishedDate + '</small></span><span>' + item.glasses + ' verres</span><span>' + item.durationDays.toFixed(1) + ' j</span>';
    list.appendChild(div);
  });
}

export function openKegHistoryModal() {
  renderKegHistory();
  const modal = document.getElementById('kegHistoryModal');
  const backdrop = document.getElementById('kegHistoryBackdrop');
  if (!modal || !backdrop) return;
  backdrop.classList.add('is-open');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');
}

export function closeKegHistoryModal() {
  const modal = document.getElementById('kegHistoryModal');
  const backdrop = document.getElementById('kegHistoryBackdrop');
  if (!modal || !backdrop) return;
  backdrop.classList.remove('is-open');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
}

export function notifyLowBeer() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('BeerTracker', {
      body: '⚠️ Il reste moins de 1 litre dans le fût',
      icon: 'assets/images/icon-192.png'
    });
  }
}

export async function requestNotificationPermissionIfNeeded() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch(e) {}
  }
}

export function closeKegSummaryModal() {
  const modal = document.getElementById('kegSummaryModal');
  const backdrop = document.getElementById('kegSummaryBackdrop');
  if (!modal || !backdrop) return;

  backdrop.classList.remove('is-open');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
}

export function setCopyrightYear() {
  const y = document.getElementById('copyrightYear');
  if (y) y.textContent = new Date().getFullYear();
}

export function renderAll() {
  renderBeerInfo();
  renderHistory();
  updateGauge();
  renderLowBeerWarning();
}
