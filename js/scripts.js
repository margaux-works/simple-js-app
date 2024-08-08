let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
  let modalContainer = document.querySelector('#modal-container');

  function showLoadingMessage() {
    let loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'block';
  }

  function hideLoadingMessage() {
    let loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'none';
  }

  function add(pokemon) {
    if (
      typeof pokemon === 'object' &&
      'name' in pokemon &&
      'detailsUrl' in pokemon
    ) {
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
    let pokemonListElement = document.querySelector('#pokemon-list');
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    button.innerText = pokemon.name;
    button.classList.add('pokemon-btn', 'btn');
    listItem.classList.add('list-group-item');

    let imageElement = document.createElement('img');
    imageElement.classList.add('pokemon-image', 'card-img-top');
    imageElement.src = pokemon.imageUrl;

    imageElement.crossOrigin = 'anonymous';

    button.insertBefore(imageElement, button.firstChild);

    listItem.appendChild(button);
    pokemonListElement.appendChild(listItem);

    // color extraction logic
    imageElement.addEventListener('load', function () {
      let colorThief = new ColorThief();
      let dominantColor = colorThief.getColor(imageElement);
      let rgbColor = `rgb(${dominantColor.join(',')})`;
      button.style.backgroundColor = rgbColor;

      // store dominant color
      pokemon.dominantColor = rgbColor;

      // Calculate brightness to set text color
      let brightness =
        (dominantColor[0] * 299 +
          dominantColor[1] * 587 +
          dominantColor[2] * 114) /
        1000;
      pokemon.isBright = brightness > 125; // Store brightness in the pokemon object
      if (pokemon.isBright) {
        button.classList.add('text-dark');
      } else {
        button.classList.add('text-light');
      }
    });

    button.addEventListener('click', function () {
      showDetails(pokemon);
    });
  }

  function showDetails(item) {
    showLoadingMessage();
    loadDetails(item)
      .then(function () {
        showModal(
          item.name,
          'Type(s): ' +
            item.types.map((typeInfo) => typeInfo.type.name).join(', ') +
            '\n' +
            'Height: ' +
            item.height +
            '\n',
          item.imageUrl,
          item.dominantColor,
          item.isBright
        );
        console.log(item);
        hideLoadingMessage();
      })
      .catch(function () {
        hideLoadingMessage();
      });
  }
  function loadList() {
    showLoadingMessage();
    return fetch(apiUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        json.results.forEach(function (item) {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url,
          };
          add(pokemon);
          loadDetails(pokemon);
        });
        hideLoadingMessage();
      })
      .catch(function (e) {
        console.error(e);
        hideLoadingMessage();
      });
  }

  function loadDetails(item) {
    let url = item.detailsUrl;
    showLoadingMessage();
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        item.imageUrl = details.sprites.front_default;
        item.height = details.height;
        item.types = details.types;
        hideLoadingMessage();
        addListItem(item);
      })
      .catch(function (e) {
        console.error(e);
        hideLoadingMessage();
      });
  }

  // Modal Bootstrap

  function showModal(title, text, img, color, isBright) {
    let modalBody = document.querySelector('.modal-body');
    let modalTitle = document.querySelector('.modal-title');
    let modalImage = document.querySelector('#pokemonImg');
    let modalDetails = document.querySelector('.pokemon-details');
    let modalHeader = document.querySelector('.modal-header');
    let modalFooter = document.querySelector('.modal-footer');

    modalTitle.innerText = title;
    modalImage.src = img;
    modalDetails.innerText = text;

    modalHeader.style.backgroundColor = color;
    modalFooter.style.backgroundColor = color;

    // Apply the text color class based on brightness
    if (isBright) {
      modalHeader.classList.add('text-dark');
      modalFooter.classList.add('text-dark');
      modalHeader.classList.remove('text-light');
      modalFooter.classList.remove('text-light');
    } else {
      modalHeader.classList.add('text-light');
      modalFooter.classList.add('text-light');
      modalHeader.classList.remove('text-dark');
      modalFooter.classList.remove('text-dark');
    }

    // left & right navigation
    document
      .querySelector('.modal-nav-left')
      .addEventListener('click', showPreviousPokemon);
    document
      .querySelector('.modal-nav-right')
      .addEventListener('click', showNextPokemon);

    // keydown event
    document.addEventListener('keydown', handleArrowKeys);

    // swipe right & left
    document.addEventListener('DOMContentLoaded', function () {
      // Initialize Hammer.js on the modal
      let modalElement = document.querySelector('.modal-content');
      let hammer = new Hammer(modalElement);
      hammer.on('swipeleft', showNextPokemon);
      hammer.on('swiperight', showPreviousPokemon);

      // Define swipe actions
      hammer.on('swipeleft', function () {
        showNextPokemon();
      });

      hammer.on('swiperight', function () {
        showPreviousPokemon();
      });
    });

    $('#pokemonModal').modal('show');
  }

  function handleArrowKeys(e) {
    if (e.key === 'ArrowLeft') {
      showPreviousPokemon();
    } else if (e.key === 'ArrowRight') {
      showNextPokemon();
    }
  }

  function showPreviousPokemon() {
    let currentPokemonIndex = pokemonRepository
      .getAll()
      .findIndex(
        (p) => p.name === document.querySelector('.modal-title').innerText
      );
    if (currentPokemonIndex > 0) {
      pokemonRepository.showDetails(
        pokemonRepository.getAll()[currentPokemonIndex - 1]
      );
    }
  }

  function showNextPokemon() {
    let currentPokemonIndex = pokemonRepository
      .getAll()
      .findIndex(
        (p) => p.name === document.querySelector('.modal-title').innerText
      );
    if (currentPokemonIndex < pokemonRepository.getAll().length - 1) {
      pokemonRepository.showDetails(
        pokemonRepository.getAll()[currentPokemonIndex + 1]
      );
    }
  }

  function hideModal() {
    modalContainer.classList.remove('is-visible');
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
      hideModal();
    }
  });

  return {
    add: add,
    getAll: getAll,
    findByName: findByName,
    addListItem: addListItem,
    loadList: loadList,
    loadDetails: loadDetails,
    showDetails: showDetails,
  };
})();

pokemonRepository.loadList();

// ListJS //
//Option 1
// let options = {
//   valueNames: ['name'],
//   fuzzySearch: {
//     searchClass: 'fuzzy-search',
//     location: 0,
//     distance: 100,
//     threshold: 0.4,
//     multiSearch: true,
//   },
// };

// let pokeDex = new List('pokemon-list', options);
// pokeDex.fuzzySearch('my search');

//Option 2

// function initializeListJs() {
//   let options = {
//     valueNames: ['name'],
//     listClass: 'pokemon-list',
//   };

//   let pokeDex = new List('pokemon-list', options);

//   document
//     .querySelector('.search')
//     .addEventListener('input', function (event) {
//       pokeDex.search(event.target.value);
//     });
// }
