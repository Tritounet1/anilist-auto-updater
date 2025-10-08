// Récupérer les données depuis l'URL ou le storage
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Récupérer les données stockées
        const result = await chrome.storage.local.get(['pendingUpdate']);
        const data = result.pendingUpdate;

        if (data) {
            document.getElementById('animeTitle').textContent = data.animeTitle;
            document.getElementById('episodeInfo').textContent = `Épisode ${data.episode} / ${data.totalEpisodes}`;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Gestion du bouton Confirmer
document.getElementById('confirmBtn').addEventListener('click', async () => {
    console.log("🔥 Bouton confirmer cliqué - envoi du message");
    try {
        // Envoyer le message de confirmation au background script
        await chrome.runtime.sendMessage({
            type: "CONFIRM_UPDATE",
            action: "confirm"
        });
        console.log("✅ Message envoyé avec succès");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message:", error);
    }
    window.close();
});

// Gestion du bouton Annuler
document.getElementById('cancelBtn').addEventListener('click', () => {
    // Envoyer le message d'annulation au background script
    chrome.runtime.sendMessage({
        type: "CONFIRM_UPDATE",
        action: "cancel"
    });
    window.close();
});