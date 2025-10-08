import { getAnimeIdByName, updateAnimeProgress } from "./anilist-fetch.js";

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      const url = tab.url;
      console.log("url : ", url);
    });
  }
});

chrome.runtime.onMessage.addListener(async(message, sender) => {
  console.log("📨 Message reçu:", message.type, message);

  if (message.type === "PAGE_INFO") {

    const animeTitle = message.animeTitle;
    const episode = message.episode;

    // Vérifier que les données ne sont pas null/undefined/vides
    if (!animeTitle || !episode) {
      console.log("❌ Données manquantes - Title:", animeTitle, "Episode:", episode);
      return;
    }

    const anime = await getAnimeIdByName(animeTitle);
    console.log("Anime found :", anime);

    // Vérifier que l'anime a été trouvé
    if (!anime || !anime.id) {
      console.log("❌ Anime non trouvé sur Anilist:", animeTitle);
      return;
    }

    // Charger les paramètres utilisateur
    const settings = await chrome.storage.sync.get({
      autoUpdate: false,
      showNotifications: true
    });

    console.log("⚙️ Paramètres actuels:", settings);

    if (settings.autoUpdate) {
      // Mise à jour automatique sans confirmation
      try {
        const entry = await updateAnimeProgress(anime.id, episode);
        console.log(`✅ Progression mise à jour automatiquement : ${entry.media.title.romaji} → ${entry.progress} épisodes`);

        if (settings.showNotifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "../assets/icons/icon.png",
            title: "Update ✨",
            message: `Anilist mis à jour automatiquement !\n${animeTitle} - ${episode} / ${anime.episodes}`
          });
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour automatique :", error);
        if (settings.showNotifications) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "../assets/icons/icon.png",
            title: "Erreur ❌",
            message: "Impossible de mettre à jour Anilist automatiquement"
          });
        }
      }
    } else {
      // Mode confirmation - stocker les données pour la popup
      await chrome.storage.local.set({
        pendingUpdate: {
          animeId: anime.id,
          episode: episode,
          animeTitle: animeTitle,
          totalEpisodes: anime.episodes
        }
      });

      // Ouvrir une popup de confirmation
      chrome.windows.create({
        url: chrome.runtime.getURL('ui/confirm.html'),
        type: 'popup',
        width: 450,
        height: 280,
        focused: true
      });
    }
  }

  // Gérer les réponses de la popup de confirmation
  else if (message.type === "CONFIRM_UPDATE") {
    try {
      // Récupérer les données stockées
      const result = await chrome.storage.local.get(['pendingUpdate']);
      const pendingData = result.pendingUpdate;

      if (pendingData) {
        if (message.action === "confirm") {
          console.log("🔄 Tentative de mise à jour:", pendingData);

          // Charger les paramètres pour les notifications
          const settings = await chrome.storage.sync.get({ showNotifications: true });

          // Mettre à jour la progression sur Anilist
          const entry = await updateAnimeProgress(pendingData.animeId, pendingData.episode);
          console.log(`✅ Progression mise à jour : ${entry.media.title.romaji} → ${entry.progress} épisodes`);

          // Afficher une notification de confirmation si activé
          if (settings.showNotifications) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "../assets/icons/icon.png",
              title: "Update ✨",
              message: `Anilist mis à jour !\n${pendingData.animeTitle} - ${pendingData.episode} / ${pendingData.totalEpisodes}`
            });
          }
        }

        // Nettoyer le storage dans tous les cas
        chrome.storage.local.remove(['pendingUpdate']);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "../assets/icons/icon.png",
        title: "Erreur ❌",
        message: "Impossible de mettre à jour Anilist"
      });
    }
  }
});