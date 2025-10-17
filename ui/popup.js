// Charger le polyfill pour la compatibilité
if (typeof browser === 'undefined') {
  window.browser = chrome;
}

const CLIENT_ID = "31331";
// const REDIRECT_URI = "http://localhost:3000/callback"; // For Test Server in Local
const REDIRECT_URI = "https://anilist-api.tritounet.fr/callback"; // For Production

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("login");
  const testBtn = document.getElementById("test");
  const logoutBtn = document.getElementById("logout");
  const status = document.getElementById("status");
  const userInfo = document.getElementById("userInfo");

  // Vérifier si on a déjà un token au chargement
  checkTokenStatus();

  loginBtn.addEventListener("click", function () {
    // Récupérer l'ID de l'extension pour le passer à l'API
    const extensionId = browser.runtime.id;
    const isFirefox = typeof InstallTrigger !== 'undefined';
    const browserType = isFirefox ? 'firefox' : 'chrome';

    // Encoder les infos de l'extension dans le state parameter (Base64 pour éviter les problèmes d'URL)
    const stateData = JSON.stringify({
      extensionId: extensionId,
      browser: browserType
    });
    const state = btoa(stateData); // Base64 encode

    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;

    // Ouvrir dans une nouvelle fenêtre (meilleure compatibilité Firefox)
    browser.windows.create({
      url: authUrl,
      type: "popup",
      width: 600,
      height: 700
    });

    showStatus(
      "Redirection vers AniList pour l'authentification...",
      "success",
    );
  });

  logoutBtn.addEventListener("click", function () {
    browser.storage.local.remove(
      ["anilist_access_token", "auth_date"],
      function () {
        showStatus("Déconnecté avec succès", "success");
        updateUI(false);
      },
    );
  });

  testBtn.addEventListener("click", function () {
    browser.storage.local.get(["anilist_access_token"], function (result) {
      if (!result.anilist_access_token) {
        showStatus("Aucun token trouvé. Connectez-vous d'abord.", "error");
        return;
      }

      showStatus("Test de connexion en cours...", "success");

      // Test de l'API avec plus d'informations
      fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${result.anilist_access_token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              Viewer {
                id
                name
                avatar {
                  medium
                }
                statistics {
                  anime {
                    count
                    episodesWatched
                  }
                }
              }
            }
          `,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.data && data.data.Viewer) {
            const user = data.data.Viewer;
            showStatus("✅ Connexion active", "success");
            showUserInfo(user);
          } else {
            showStatus("❌ Token invalide ou expiré", "error");
            updateUI(false);
          }
        })
        .catch((error) => {
          console.error("Erreur lors du test:", error);
          showStatus("❌ Erreur de réseau", "error");
        });
    });
  });

  function checkTokenStatus() {
    browser.storage.local.get(
      ["anilist_access_token", "auth_date"],
      function (result) {
        if (result.anilist_access_token) {
          updateUI(true);
          const authDate = new Date(result.auth_date);
          showStatus(
            `✅ Connecté depuis le ${authDate.toLocaleDateString()}`,
            "success",
          );
        } else {
          updateUI(false);
          showStatus("❌ Non connecté à AniList", "error");
        }
      },
    );
  }

  function updateUI(isConnected) {
    if (isConnected) {
      loginBtn.textContent = "✓ Connecté";
      loginBtn.disabled = true;
      loginBtn.className = "btn-primary";
      logoutBtn.style.display = "block";
    } else {
      loginBtn.textContent = "Se connecter à AniList";
      loginBtn.disabled = false;
      loginBtn.className = "btn-primary";
      logoutBtn.style.display = "none";
      userInfo.style.display = "none";
    }
  }

  function showUserInfo(user) {
    const stats = user.statistics?.anime;
    userInfo.innerHTML = `
      <strong>👤 ${user.name}</strong><br>
      📺 ${stats?.count || 0} animes<br>
      🎬 ${stats?.episodesWatched || 0} épisodes vus
    `;
    userInfo.style.display = "block";
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = type;
  }
});
