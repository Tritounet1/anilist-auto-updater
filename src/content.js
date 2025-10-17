// Charger le polyfill pour la compatibilité
if (typeof browser === 'undefined') {
  window.browser = chrome;
}

// Cache pour éviter de mettre à jour plusieurs fois le même épisode d'un anime
let lastSent = { title: null, episode: null };

function extractAndSend() {
  // v6.voiranime
  const p = document.querySelector("li.active")?.innerText;
  const match = p?.match(/^(.*?)\s*-\s*(\d+)/);
  if (match) {
    const title = match[1].trim();
    const episode = parseInt(match[2], 10);

    if (lastSent.title === title && lastSent.episode === episode) {
      return true;
    }

    console.log(title);
    console.log(episode);

    lastSent = { title, episode };
    browser.runtime.sendMessage({
      type: "PAGE_INFO",
      animeTitle: title,
      episode: episode
    });
    return true;
  }

  // Crunchyroll
  const h1 = document.querySelector("h1")?.innerText;
  const h4 = document.querySelector("h4")?.innerText;
  const animeTitle = document.querySelector('[data-t="series-title"]')?.innerText ||
    document.querySelector('a[href*="/series/"]')?.innerText ||
    document.querySelector('.series-title')?.innerText;
  const seriesTitle = animeTitle || h4;

  if (h1 && seriesTitle) {
    const [episodeNb, episodeTitle] = h1.split(" - ")
    const episode = parseInt(episodeNb.replace("E", ""), 10);

    if (lastSent.title === seriesTitle && lastSent.episode === episode) {
      return true;
    }

    lastSent = { title: seriesTitle, episode };
    browser.runtime.sendMessage({
      type: "PAGE_INFO",
      animeTitle: seriesTitle,
      episode: episode
    });
    return true;
  }

  return false;
}

extractAndSend();

let debounceTimer;
const DEBOUNCE_DELAY = 500; // EN MS

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    extractAndSend();
  }, DEBOUNCE_DELAY);

});

observer.observe(document.body, { childList: true, subtree: true });
