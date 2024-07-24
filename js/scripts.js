let pokemonList = [
  {
    name: 'Bulbasaur',
    height: 0.7,
    types: ['grass', 'poison'],
  },
  {
    name: 'Pidgey',
    height: 0.3,
    types: ['flying', 'normal'],
  },
  {
    name: 'Rapidash',
    height: 1.7,
    types: ['fire'],
  },
];

// list all Pokemon name and their height, incl. a message about height

for (let i = 0; i < pokemonList.length; i++) {
  let pokemonName = pokemonList[i].name;
  let pokemonHeight = pokemonList[i].height;

  let message = '';
  if (pokemonHeight >= 1.2) {
    message = "- Wow, that's big!";
  } else {
    message = '- Small, but deadly.';
  }

  document.write(`${pokemonName} (height:${pokemonHeight}) ${message}<br>`);
}
