let pokemonRepository = (function () {
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

  function add(pokemon) {
    if (typeof pokemon === 'object' && 'name' in pokemon) {
      pokemonList.push(pokemon);
    } else {
      console.error('Invalid. Please enter a valid Pokemon name');
    }
  }

  function getAll() {
    return pokemonList;
  }

  function findByName(name) {
    return pokemonList.filter(function (pokemon) {
      return pokemon.name === name;
    });
  }

  function addListItem(pokemon) {
    let pokemonList = document.querySelector('.pokemon-list');
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    button.innerText = pokemon.name;
    button.classList.add('pokemon-btn');
    listItem.appendChild(button);
    pokemonList.appendChild(listItem);
    button.addEventListener('click', function () {
      showDetails(pokemon);
    });
  }

  function showDetails(pokemon) {
    console.log(pokemon);
  }

  return {
    add: add,
    getAll: getAll,
    findByName: findByName,
    addListItem: addListItem,
  };
})();

pokemonRepository.getAll().forEach(function (pokemon) {
  pokemonRepository.addListItem(pokemon);
  // let message;
  // if (pokemon.height >= 1.2) {
  //   message = "Wow, that's big!";
  // } else {
  //   message = 'Small, but deadly.';
  // }
  // document.write(
  //   `${pokemon.name} - (height:${pokemon.height}) - ${message} <br>`
  // );
});
