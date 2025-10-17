// Polyfill pour compatibilité Chrome/Firefox
// Permet d'utiliser l'API 'browser' sur les deux navigateurs

(function() {
  if (typeof browser === 'undefined') {
    // Chrome utilise 'chrome', on crée un alias 'browser'
    window.browser = chrome;
  }
})();
