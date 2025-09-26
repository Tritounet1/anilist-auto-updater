chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      const url = tab.url;

      if (url.includes("v6.voiranime.com") || url.includes("www.crunchyroll.com")) {
        // Injecter le content script
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: ["content.js"]
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "PAGE_INFO") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Update ✨",
      message: `Anilist mis à jour !\n${message.title} - ${message.subtitle}`
    });
  }
});

/*
Créer une extension chrome :

qui vérifie que site sont visités. 

si c'est crunchyroll, voiranime on regarde quel page on est.

Si c'est la page d'un épisode on met à jour anilist.	
*/