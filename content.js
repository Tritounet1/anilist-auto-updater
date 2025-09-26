function extractAndSend() {
  const h1 = document.querySelector("h1")?.innerText;
  const h4 = document.querySelector("h4")?.innerText;

  if (h1 && h4) {
    chrome.runtime.sendMessage({
      type: "PAGE_INFO",
      title: h1,
      subtitle: h4
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
