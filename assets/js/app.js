'use strict';

// Liste des bières avec images + liens Beerwulf
let beers = [
   {name:"Pelican Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-pelican.png?v=1771510637&width=712"},
  {name:"Heineken", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-heineken-FR.png?v=1761058206&width=712"},
  {name:"Desperados", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Desperados-FR.png?v=1761057970&width=712"},
  {name:"Affligem Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Affligem-Blonde.png?v=1761057921&width=712"},
  {name:"Lagunitas IPA", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Lagunitas-FR.png?v=1761058046&width=712"},
  {name:"Gallia Champ Libre", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Gallia-FR.png?v=1761058252&width=712"},
  {name:"Pelforth Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Pelforth-FR.png?v=1761058147&width=712"}
];

// Remplissage du menu
let select = document.getElementById("beerSelect");
beers.forEach(b => {
    let option = document.createElement("option");
    option.value = b.name;
    option.text = b.name;
    select.appendChild(option);
});

  
let totalVolume = 5.0;
let remainingVolume = 5.0;
let history = [];
let kegStartedAt = new Date().toISOString();
let kegFinishedAt = null;
let summaryShown = false;

function updateGauge(){
    let percent = Math.round((remainingVolume/totalVolume)*100);
    document.getElementById('percent').innerText = percent+"%";
    document.getElementById('volume').innerText = remainingVolume.toFixed(2)+" L / "+totalVolume.toFixed(2)+" L";

    
    // Décompte de verres restants (approx) pour les tailles rapides
    const remainingCl = Math.max(0, Math.floor(remainingVolume * 100)); // 1L = 100cL
    const n25 = Math.floor(remainingCl / 25);
    const n33 = Math.floor(remainingCl / 33);
    const n50 = Math.floor(remainingCl / 50);
    const gc = document.getElementById('glassCount');
    if(gc){
        gc.innerText = `≈ ${n25}×25cL  •  ${n33}×33cL  •  ${n50}×50cL`;
    }
let circle = document.querySelector('.circle');
    let circumference = 2 * Math.PI * 100;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference*(1 - remainingVolume/totalVolume));

    let remainingRounded = parseFloat(remainingVolume.toFixed(2));
    if(remainingRounded <= 0.33) circle.setAttribute('stroke','#e74c3c'); // rouge
    else if(remainingRounded <= 1.0) circle.setAttribute('stroke','#e67e22'); // orange
    else circle.setAttribute('stroke','#1abc9c'); // vert

    disableButtonsIfEmpty();
}



function openKegSummaryModal({beerName, totalGlasses, detail, days, startStr, endStr}){
    const modal = document.getElementById('kegSummaryModal');
    const backdrop = document.getElementById('kegSummaryBackdrop');
    if(!modal || !backdrop) return;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if(el) el.textContent = value;
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
    if(ok) ok.focus();
}
function closeKegSummaryModal(){
    const modal = document.getElementById('kegSummaryModal');
    const backdrop = document.getElementById('kegSummaryBackdrop');
    if(!modal || !backdrop) return;

    backdrop.classList.remove('is-open');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
}
document.addEventListener('click', (e) => {
    const t = e.target;
    if(!t) return;
    if(t.id === 'kegSummaryBackdrop' || t.id === 'kegSummaryOk' || t.id === 'kegSummaryClose'){
        closeKegSummaryModal();
    }
});
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
        closeKegSummaryModal();
    }
});

function showKegSummary(){
    // Compte uniquement les verres non annulés
    const served = history.filter(h => !h.cancelled);
    const totalGlasses = served.length;

    // Tally par volume (en cL) pour un récap simple
    const tally = {};
    served.forEach(h => {
        const cl = Math.round((h.volume || 0) * 100);
        if(!tally[cl]) tally[cl] = 0;
        tally[cl] += 1;
    });

    const start = kegStartedAt ? new Date(kegStartedAt) : null;
    const end = kegFinishedAt ? new Date(kegFinishedAt) : new Date();

    let days = 0;
    if(start){
        const ms = Math.max(0, end - start);
        days = ms / (1000*60*60*24);
    }

    const parts = Object.keys(tally)
      .sort((a,b)=>parseFloat(a)-parseFloat(b))
      .map(cl => `${tally[cl]}×${cl} cL`);

    const beerName = document.getElementById("beerName")?.innerText || "Bière";
    const startStr = start ? start.toLocaleDateString() : "--/--/----";
    const endStr = end ? end.toLocaleDateString() : "--/--/----";

    openKegSummaryModal({beerName, totalGlasses, detail: (parts.length ? parts.join(" • ") : "—"), days, startStr, endStr});}

function serveGlass(cl){
    if(remainingVolume<=0) return;
    const oldRemaining = remainingVolume;
    let l = cl/100;
    remainingVolume = Math.max(0, remainingVolume - l);
    if(oldRemaining > 0 && remainingVolume === 0){
        kegFinishedAt = new Date().toISOString();
    }
    history.unshift({volume:l, cancelled:false, time:new Date().toLocaleTimeString()});
    renderHistory();
    updateGauge();
    saveData();
    if(oldRemaining > 0 && remainingVolume === 0 && !summaryShown){
        summaryShown = true;
        saveData();
        showKegSummary();
    }
}

function undoLast(){
    for(let i=0;i<history.length;i++){
        if(!history[i].cancelled){
            remainingVolume = Math.min(totalVolume, remainingVolume + history[i].volume);
            history[i].cancelled = true;
            break;
        }
    }
    renderHistory();
    updateGauge();
    saveData();
}

function renderHistory(){
    let histDiv = document.getElementById('history');
    histDiv.innerHTML = "";
    history.forEach(entry=>{
        let div = document.createElement('div');
        div.className="history-item";
        div.innerHTML="<span>"+entry.time+"</span><span>"+(entry.volume*100)+" cL</span><span>"+(entry.cancelled?"✖":"✔")+"</span>";
        histDiv.appendChild(div);
    });
}

function addCustomGlass(){
    if(remainingVolume<=0) return;
    let cl = prompt("Entrez le volume du verre (cL) :","40");
    if(cl!==null) serveGlass(parseFloat(cl));
}

function changeKeg(skipConfirm=false){
    if(!skipConfirm && remainingVolume>0 && remainingVolume<totalVolume){
        let confirmReset = confirm("Le fût actuel n'est pas vide (" + remainingVolume.toFixed(2) + " L restants). Voulez-vous vraiment le remplacer ?");
        if(!confirmReset) return;
    }

    let selectedName = select.value;
    let beer = beers.find(b=>b.name===selectedName);
    if(beer){
        document.getElementById("beerName").innerText = beer.name;
        document.getElementById("kegImage").src = beer.img;
        document.getElementById("kegDate").innerText = "Date de mise en service : " + new Date().toLocaleDateString();
        totalVolume = 5.0;
        remainingVolume = 5.0;
        kegStartedAt = new Date().toISOString();
        kegFinishedAt = null;
        summaryShown = false;
        history = [];
        renderHistory();
        updateGauge();
        saveData();
    }
}


// ===== Persistance (localStorage) =====
const STORAGE_KEY = "beerTracker.preview6.v1";

function saveData(){
    try{
        const data = {
            totalVolume,
            remainingVolume,
            history,
            selectedBeer: select.value,
            kegDateText: document.getElementById("kegDate").innerText,
            kegStartedAt,
            kegFinishedAt,
            summaryShown
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }catch(e){
        // ignore (private mode etc.)
    }
}

function loadData(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return false;
        const data = JSON.parse(raw);

        if(typeof data.totalVolume === "number") totalVolume = data.totalVolume;
        if(typeof data.remainingVolume === "number") remainingVolume = data.remainingVolume;
        if(Array.isArray(data.history)) history = data.history;

        if(typeof data.kegStartedAt === "string") kegStartedAt = data.kegStartedAt;
        if(typeof data.kegFinishedAt === "string" || data.kegFinishedAt === null) kegFinishedAt = data.kegFinishedAt;
        if(typeof data.summaryShown === "boolean") summaryShown = data.summaryShown;

        if(typeof data.selectedBeer === "string"){
            select.value = data.selectedBeer;
            const beer = beers.find(b=>b.name===data.selectedBeer);
            if(beer){
                document.getElementById("beerName").innerText = beer.name;
                document.getElementById("kegImage").src = beer.img;
            }
        }

        if(typeof data.kegDateText === "string"){
            document.getElementById("kegDate").innerText = data.kegDateText;
        }

        renderHistory();
        updateGauge();
        return true;
    }catch(e){
        return false;
    }
}

function disableButtonsIfEmpty(){
    let disabled = remainingVolume <=0;
    ['btn25','btn33','btn50','btnCustom'].forEach(id=>{
        document.getElementById(id).disabled = disabled;
        document.getElementById(id).style.opacity = disabled?0.5:1;
    });
}


// Init
if(!loadData()){
    // Première ouverture : initialise sans popup
    changeKeg(true);
}


function initGaugeBubbles(){
    const layer = document.getElementById('bubbleLayer');
    if(!layer) return;
    layer.innerHTML = '';
    const count = 18;
    for(let i=0;i<count;i++){
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = 4 + Math.random()*5;
        b.style.width = size + 'px';
        b.style.height = size + 'px';
        b.style.left = (10 + Math.random()*80) + '%';
        b.style.animationDuration = (2.5 + Math.random()*2.8) + 's';
        b.style.animationDelay = (Math.random()*4) + 's';
        layer.appendChild(b);
    }
}

document.addEventListener('DOMContentLoaded', initGaugeBubbles);
