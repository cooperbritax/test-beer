export const beers = [
  {name:"Pelican Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-pelican.png?v=1771510637&width=712"},
  {name:"Heineken", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-heineken-FR.png?v=1761058206&width=712"},
  {name:"Desperados", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Desperados-FR.png?v=1761057970&width=712"},
  {name:"Affligem Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Affligem-Blonde.png?v=1761057921&width=712"},
  {name:"Lagunitas IPA", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Lagunitas-FR.png?v=1761058046&width=712"},
  {name:"Gallia Champ Libre", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Gallia-FR.png?v=1761058252&width=712"},
  {name:"Pelforth Blonde", img:"https://eu.beerwulf.com/cdn/shop/files/Beertender-5l-keg-Pelforth-FR.png?v=1761058147&width=712"}
];

export const state = {
  totalVolume: 5.0,
  remainingVolume: 5.0,
  history: [],
  kegStartedAt: new Date().toISOString(),
  kegFinishedAt: null,
  summaryShown: false,
  selectedBeer: beers[0].name
};

export function resetStateForNewKeg(selectedBeer) {
  state.selectedBeer = selectedBeer;
  state.totalVolume = 5.0;
  state.remainingVolume = 5.0;
  state.history = [];
  state.kegStartedAt = new Date().toISOString();
  state.kegFinishedAt = null;
  state.summaryShown = false;
}
