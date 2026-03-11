# BeerTracker V2 (modulaire)

Version techniquement refaite à partir de la version actuelle fonctionnelle, sans changer les fonctionnalités.

## Structure
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js` : point d'entrée
- `assets/js/state.js` : état de l'application
- `assets/js/storage.js` : persistance localStorage
- `assets/js/ui.js` : rendu DOM, jauge, modal, bulles
- `assets/js/keg.js` : logique métier (servir, annuler, nouveau fût)
- `assets/images/...`
- `manifest.json`
- `sw.js`

## Déploiement GitHub Pages
1. Push ce dossier à la racine du repo
2. Settings → Pages
3. Deploy from branch → `main` / `(root)`

## Important
Comme la PWA est versionnée en `beertracker-v3`, il est recommandé de :
- supprimer l'ancienne app de l'écran d'accueil
- rouvrir le site dans Safari
- réinstaller l'app
