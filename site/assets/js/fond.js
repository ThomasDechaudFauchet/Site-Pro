/* Fond vivant : le fond de la page prend les couleurs de l'œuvre regardée.
   - Accueil : les visuels défilent lentement (data-cycle sur <body>).
   - Survol ou focus d'un élément [data-fond] : le fond passe à son image.
   - Écran tactile : c'est l'élément au milieu de l'écran qui donne le fond.
   - Mouvement réduit demandé : pas de défilement automatique. */
(function () {
  var fond = document.querySelector('.fond');
  if (!fond) return;
  var calques = fond.querySelectorAll('.calque');
  if (calques.length < 2) return;
  var devant = calques[0], derriere = calques[1];
  var actuel = devant.getAttribute('data-src') || null;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var corps = document.body;
  var fondPage = corps.getAttribute('data-fond-page') || null;

  function montrer(src) {
    src = src || null;
    if (src === actuel) return;
    actuel = src;
    if (!src) { devant.classList.remove('on'); return; }
    var img = new Image();
    img.onload = function () {
      if (actuel !== src) return;
      derriere.style.backgroundImage = 'url("' + src + '")';
      derriere.classList.add('on');
      devant.classList.remove('on');
      var t = devant; devant = derriere; derriere = t;
    };
    img.src = src;
  }

  var cycle = (corps.getAttribute('data-cycle') || '').split('|').filter(Boolean);
  var minuterie = null, i = 0;
  function lancer() {
    if (calme || cycle.length < 2 || minuterie) return;
    minuterie = setInterval(function () { i = (i + 1) % cycle.length; montrer(cycle[i]); }, 7000);
  }
  function arreter() { clearInterval(minuterie); minuterie = null; }
  function revenir() {
    if (cycle.length) { montrer(cycle[i]); lancer(); } else { montrer(fondPage); }
  }
  lancer();

  var cibles = document.querySelectorAll('[data-fond]');
  Array.prototype.forEach.call(cibles, function (el) {
    function viser() { arreter(); montrer(el.getAttribute('data-fond')); }
    el.addEventListener('pointerenter', viser);
    el.addEventListener('focusin', viser);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-fond-zone]'), function (zone) {
    zone.addEventListener('pointerleave', revenir);
  });

  if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window && cibles.length) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (e.isIntersecting) { arreter(); montrer(e.target.getAttribute('data-fond')); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Array.prototype.forEach.call(cibles, function (el) { io.observe(el); });
  }

  document.addEventListener('visibilitychange', function () { if (document.hidden) arreter(); else lancer(); });
})();
