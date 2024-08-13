let pokemonRepository = (function () {
  let colorThief = new ColorThief();
  let activeIndex = 0;

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

  function addListItem(pokemon, index) {
    let pokemonListElement = document.querySelector('#pokemon-list');
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    // button.innerText = pokemon.name;
    let span = document.createElement('span');
    span.innerText = pokemon.name;
    span.classList.add('name');
    button.appendChild(span);
    button.classList.add('pokemon-btn', 'btn');
    listItem.classList.add('list-group-item');

    let imageElement = document.createElement('img');
    imageElement.classList.add('pokemon-image', 'card-img-top');
    imageElement.src = pokemon.imageUrl;

    imageElement.crossOrigin = 'anonymous';
    // button.innerText = pokemon.name;
    button.insertBefore(imageElement, button.firstChild);

    listItem.appendChild(button);
    pokemonListElement.appendChild(listItem);

    imageElement.addEventListener('load', function () {
      if (pokemon.dominantColor) {
        button.style.backgroundColor = pokemon.dominantColor;
        if (pokemon.isBright) {
          button.classList.add('text-dark');
        } else {
          button.classList.add('text-light');
        }
      }
    });

    button.addEventListener('click', function () {
      // here i need to save the index of the pokemon i clicked on
      activeIndex = index;
      showDetails(pokemon);
    });

    // color extraction logic
    imageElement.addEventListener('load', function () {
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
      pokemon.isBright = brightness > 125;
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
        return Promise.all(
          json.results.map(function (item) {
            let pokemon = {
              name: item.name,
              detailsUrl: item.url,
            };
            add(pokemon);
            return loadDetails(pokemon); // Load details before adding to list
          })
        );
      })
      .catch(function (e) {
        console.error(e);
      })
      .finally(function () {
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

    // Initialize swipe functionality
    initializeSwipe();

    $('#pokemonModal').modal('show');
  }

  function initializeSwipe() {
    let modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      let hammer = new Hammer(modalElement);

      hammer.on('swipeleft', function () {
        showNextPokemon();
      });

      hammer.on('swiperight', function () {
        showPreviousPokemon();
      });
    } else {
      console.error('Modal content not found for swipe initialization.');
    }
  }

  function handleArrowKeys(e) {
    if (e.key === 'ArrowLeft') {
      showPreviousPokemon();
    } else if (e.key === 'ArrowRight') {
      showNextPokemon();
    }
  }

  function showPreviousPokemon() {
    if (activeIndex > 0) {
      activeIndex--;
      pokemonRepository.showDetails(pokemonRepository.getAll()[activeIndex]);
    }
  }

  function showNextPokemon() {
    const pokemons = pokemonRepository.getAll();
    const length = pokemons.length;
    if (activeIndex < length - 1) {
      activeIndex++;
      pokemonRepository.showDetails(pokemons[activeIndex]);
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

pokemonRepository.loadList().then(function () {
  pokemonRepository.getAll().forEach(function (pokemon, index) {
    console.log(pokemon.name, index);
    pokemonRepository.addListItem(pokemon, index);
  });
  new List('list-container', {
    valueNames: ['name'],
  });
});
