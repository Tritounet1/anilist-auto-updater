// Charger le polyfill pour la compatibilité
if (typeof browser === 'undefined') {
  window.browser = chrome;
}

document.addEventListener("DOMContentLoaded", function () {
  const statusDiv = document.getElementById("status");
  const closeBtn = document.getElementById("closeBtn");

  // Extraire le token de l'URL (fragment après #)
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.substring(1)); // Retirer le #
  const token = urlParams.get("token");

  // console.log('Token reçu:', token);

  if (!token) {
    showError("Aucun token trouvé dans l'URL");
    return;
  }

  // Sauvegarder le token dans le stockage de l'extension
  saveToken(token);
});

async function saveToken(token) {
  try {
    // Sauvegarder dans browser.storage
    await browser.storage.local.set({
      anilist_access_token: token,
      auth_date: new Date().toISOString(),
    });

    console.log("Token sauvegardé avec succès");

    // Tester le token en faisant une requête à l'API AniList
    const isValid = await testToken(token);

    if (isValid) {
      showSuccess("Token sauvegardé et validé avec succès !");
    } else {
      showError("Token sauvegardé mais validation échouée");
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    showError("Erreur lors de la sauvegarde du token");
  }
}

async function testToken(token) {
  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
                    query {
                        Viewer {
                            id
                            name
                        }
                    }
                `,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.Viewer) {
      console.log("Token validé pour l'utilisateur:", data.data.Viewer.name);
      return true;
    } else {
      console.error("Réponse invalide de l'API:", data);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors du test du token:", error);
    return false;
  }
}

function showSuccess(message) {
  const statusDiv = document.getElementById("status");
  const closeBtn = document.getElementById("closeBtn");

  statusDiv.className = "status success";
  statusDiv.innerHTML = `✓ ${message}`;

  closeBtn.style.display = "inline-block";

  // Auto-fermeture après 3 secondes
  setTimeout(() => {
    window.close();
  }, 3000);
}

function showError(message) {
  const statusDiv = document.getElementById("status");
  const closeBtn = document.getElementById("closeBtn");

  statusDiv.className = "status error";
  statusDiv.innerHTML = `✗ ${message}`;

  closeBtn.style.display = "inline-block";
}
