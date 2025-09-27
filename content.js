console.log("Content script loaded on:", window.location.href);

function extractAndSend() {
  // si c'est crunchyroll
  const h1 = document.querySelector("h1")?.innerText;
  const h4 = document.querySelector("h4")?.innerText;
  const animeTitle = document.querySelector('[data-t="series-title"]')?.innerText ||
    document.querySelector('a[href*="/series/"]')?.innerText ||
    document.querySelector('.series-title')?.innerText;

  // si c'est voiranime
  // a faire

  console.log("Debug - h1:", h1, "animeTitle:", animeTitle);

  const episodeTitle = h1;
  const seriesTitle = animeTitle || h4;

  if (episodeTitle && seriesTitle) {
    chrome.runtime.sendMessage({
      type: "PAGE_INFO",
      title: episodeTitle,
      subtitle: seriesTitle
    });
    return true; // trouvé
  }
  return false;
}

// Essayer direct au cas où
if (!extractAndSend()) {
  // Sinon observer les changements
  const observer = new MutationObserver(() => {
    if (extractAndSend()) {
      observer.disconnect(); // arrêter une fois trouvé
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
