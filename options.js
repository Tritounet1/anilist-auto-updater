// Valeurs par défaut des paramètres
const DEFAULT_SETTINGS = {
    autoUpdate: false,
    showNotifications: true
};

// Charger les paramètres au démarrage
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    initializeToggles();
});

// Charger les paramètres depuis le storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);

        // Mettre à jour l'interface
        updateToggle('autoUpdateToggle', 'autoUpdateLabel', result.autoUpdate, 'Activé', 'Désactivé');
        updateToggle('notificationsToggle', 'notificationsLabel', result.showNotifications, 'Activé', 'Désactivé');

    } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
    }
}

// Mettre à jour l'apparence d'un toggle
function updateToggle(toggleId, labelId, isActive, activeText, inactiveText) {
    const toggle = document.getElementById(toggleId);
    const label = document.getElementById(labelId);

    if (isActive) {
        toggle.classList.add('active');
        label.textContent = activeText;
    } else {
        toggle.classList.remove('active');
        label.textContent = inactiveText;
    }
}

// Initialiser les événements des toggles
function initializeToggles() {
    // Toggle mise à jour automatique
    document.getElementById('autoUpdateToggle').addEventListener('click', async () => {
        const toggle = document.getElementById('autoUpdateToggle');
        const label = document.getElementById('autoUpdateLabel');

        const isActive = !toggle.classList.contains('active');
        updateToggle('autoUpdateToggle', 'autoUpdateLabel', isActive, 'Activé', 'Désactivé');

        await saveSetting('autoUpdate', isActive);
    });

    // Toggle notifications
    document.getElementById('notificationsToggle').addEventListener('click', async () => {
        const toggle = document.getElementById('notificationsToggle');
        const label = document.getElementById('notificationsLabel');

        const isActive = !toggle.classList.contains('active');
        updateToggle('notificationsToggle', 'notificationsLabel', isActive, 'Activé', 'Désactivé');

        await saveSetting('showNotifications', isActive);
    });
}

// Sauvegarder un paramètre
async function saveSetting(key, value) {
    try {
        await chrome.storage.sync.set({ [key]: value });
        showStatus('Paramètres sauvegardés !', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showStatus('Erreur lors de la sauvegarde', 'error');
    }
}

// Afficher un message de statut
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');

    // Cacher le message après 3 secondes
    setTimeout(() => {
        status.classList.add('hidden');
    }, 3000);
}