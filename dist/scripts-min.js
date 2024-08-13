let pokemonRepository = (function () {
  let e = new ColorThief(),
    t = 0,
    n = [],
    o = document.querySelector('#modal-container');
  function i() {
    document.getElementById('loading-message').style.display = 'block';
  }
  function l() {
    document.getElementById('loading-message').style.display = 'none';
  }
  function r(e) {
    'object' == typeof e && 'name' in e && 'detailsUrl' in e
      ? n.push(e)
      : console.error('Invalid. Please enter a valid Pokemon name');
  }
  function a() {
    return n;
  }
  function s(e) {
    i(),
      d(e)
        .then(function () {
          var t, n, o, i, r;
          let a, s, d, p, f;
          (t = e.name),
            (n =
              'Type(s): ' +
              e.types.map((e) => e.type.name).join(', ') +
              '\nHeight: ' +
              e.height +
              '\n'),
            (o = e.imageUrl),
            (i = e.dominantColor),
            (r = e.isBright),
            document.querySelector('.modal-body'),
            (a = document.querySelector('.modal-title')),
            (s = document.querySelector('#pokemonImg')),
            (d = document.querySelector('.pokemon-details')),
            (p = document.querySelector('.modal-header')),
            (f = document.querySelector('.modal-footer')),
            (a.innerText = t),
            (s.src = o),
            (d.innerText = n),
            (p.style.backgroundColor = i),
            (f.style.backgroundColor = i),
            r
              ? (p.classList.add('text-dark'),
                f.classList.add('text-dark'),
                p.classList.remove('text-light'),
                f.classList.remove('text-light'))
              : (p.classList.add('text-light'),
                f.classList.add('text-light'),
                p.classList.remove('text-dark'),
                f.classList.remove('text-dark')),
            document
              .querySelector('.modal-nav-left')
              .addEventListener('click', m),
            document
              .querySelector('.modal-nav-right')
              .addEventListener('click', u),
            document.addEventListener('keydown', c),
            (function e() {
              let t = document.querySelector('.modal-content');
              if (t) {
                let n = new Hammer(t);
                n.on('swipeleft', function () {
                  u();
                }),
                  n.on('swiperight', function () {
                    m();
                  });
              } else
                console.error(
                  'Modal content not found for swipe initialization.'
                );
            })(),
            $('#pokemonModal').modal('show'),
            l();
        })
        .catch(function () {
          l();
        });
  }
  function d(e) {
    let t = e.detailsUrl;
    return (
      i(),
      fetch(t)
        .then(function (e) {
          return e.json();
        })
        .then(function (t) {
          (e.imageUrl = t.sprites.front_default),
            (e.height = t.height),
            (e.types = t.types),
            l();
        })
        .catch(function (e) {
          console.error(e), l();
        })
    );
  }
  function c(e) {
    'ArrowLeft' === e.key ? m() : 'ArrowRight' === e.key && u();
  }
  function m() {
    t > 0 &&
      (t--, pokemonRepository.showDetails(pokemonRepository.getAll()[t]));
  }
  function u() {
    let e = pokemonRepository.getAll(),
      n = e.length;
    t < n - 1 && (t++, pokemonRepository.showDetails(e[t]));
  }
  return (
    window.addEventListener('keydown', (e) => {
      'Escape' === e.key &&
        o.classList.contains('is-visible') &&
        o.classList.remove('is-visible');
    }),
    {
      add: r,
      getAll: a,
      findByName: function e(t) {
        return n.filter(function (e) {
          return e.name === t;
        });
      },
      addListItem: function n(o, i) {
        let l = document.querySelector('#pokemon-list'),
          r = document.createElement('li'),
          a = document.createElement('button'),
          d = document.createElement('span');
        (d.innerText = o.name),
          d.classList.add('name'),
          a.appendChild(d),
          a.classList.add('pokemon-btn', 'btn'),
          r.classList.add('list-group-item');
        let c = document.createElement('img');
        c.classList.add('pokemon-image', 'card-img-top'),
          (c.src = o.imageUrl),
          (c.crossOrigin = 'anonymous'),
          a.insertBefore(c, a.firstChild),
          r.appendChild(a),
          l.appendChild(r),
          c.addEventListener('load', function () {
            o.dominantColor &&
              ((a.style.backgroundColor = o.dominantColor),
              o.isBright
                ? a.classList.add('text-dark')
                : a.classList.add('text-light'));
          }),
          a.addEventListener('click', function () {
            (t = i), s(o);
          }),
          c.addEventListener('load', function () {
            let t = e.getColor(c),
              n = `rgb(${t.join(',')})`;
            (a.style.backgroundColor = n), (o.dominantColor = n);
            let i = (299 * t[0] + 587 * t[1] + 114 * t[2]) / 1e3;
            (o.isBright = i > 125),
              o.isBright
                ? a.classList.add('text-dark')
                : a.classList.add('text-light');
          }),
          a.addEventListener('click', function () {
            s(o);
          });
      },
      loadList: function e() {
        return (
          i(),
          fetch('https://pokeapi.co/api/v2/pokemon/?limit=150')
            .then(function (e) {
              return e.json();
            })
            .then(function (e) {
              return Promise.all(
                e.results.map(function (e) {
                  let t = { name: e.name, detailsUrl: e.url };
                  return r(t), d(t);
                })
              );
            })
            .catch(function (e) {
              console.error(e);
            })
            .finally(function () {
              l();
            })
        );
      },
      loadDetails: d,
      showDetails: s,
    }
  );
})();
pokemonRepository.loadList().then(function () {
  pokemonRepository.getAll().forEach(function (e, t) {
    console.log(e.name, t), pokemonRepository.addListItem(e, t);
  }),
    new List('list-container', { valueNames: ['name'] });
});
