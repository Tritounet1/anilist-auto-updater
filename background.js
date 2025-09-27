chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      const url = tab.url;
      console.log("url : ", url);
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

Si c'est la page d'un épisode on met à jour anilist.	
*/