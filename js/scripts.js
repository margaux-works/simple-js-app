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
    button.classList.add('pokemon-btn');

    //add image
    let imageElement = document.createElement('img');
    imageElement.classList.add('pokemon-image');
    imageElement.src = pokemon.imageUrl;
    button.insertBefore(imageElement, button.firstChild);

    listItem.appendChild(button);
    pokemonListElement.appendChild(listItem);
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
          item.imageUrl
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

  function showModal(title, text, img) {
    modalContainer.innerHTML = '';
    let modal = document.createElement('div');
    modal.classList.add('modal');

    let closeButtonElement = document.createElement('button');
    closeButtonElement.classList.add('modal-close');
    closeButtonElement.innerText = 'X';
    closeButtonElement.addEventListener('click', hideModal);

    let titleElement = document.createElement('h3');
    titleElement.innerText = title;

    let contentElement = document.createElement('p');
    contentElement.innerText = text;

    let imageElement = document.createElement('img');
    imageElement.setAttribute('src', img);
    imageElement.setAttribute('width', '100%');
    imageElement.setAttribute('height', '100%');
    imageElement.setAttribute('alt', 'Pokemon image');

    modal.appendChild(closeButtonElement);
    modal.appendChild(titleElement);
    modal.appendChild(contentElement);
    modal.appendChild(imageElement);
    modalContainer.appendChild(modal);

    modalContainer.classList.add('is-visible');

    modalContainer.addEventListener('click', (e) => {
      let target = e.target;
      if (target === modalContainer) {
        hideModal();
      }
    });
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
