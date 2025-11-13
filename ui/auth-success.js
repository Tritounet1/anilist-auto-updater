// Charger le polyfill pour la compatibilité
if (typeof browser === 'undefined') {
  window.browser = chrome;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 auth-success.js chargé");
  console.log("📍 URL complète:", window.location.href);
  
  const statusDiv = document.getElementById("status");
  const closeBtn = document.getElementById("closeBtn");

  // Extraire le token de l'URL (fragment après #)
  const hash = window.location.hash;
  console.log("🔗 Hash de l'URL:", hash);
  
  const urlParams = new URLSearchParams(hash.substring(1)); // Retirer le #
  const token = urlParams.get("token");

  console.log("🎫 Token extrait:", token ? "Trouvé (longueur: " + token.length + ")" : "Non trouvé");

  if (!token) {
    console.error("❌ Aucun token dans l'URL");
    showError("Aucun token trouvé dans l'URL");
    return;
  }

  console.log("💾 Début de la sauvegarde du token...");
  // Sauvegarder le token dans le stockage de l'extension
  saveToken(token);
});

async function saveToken(token) {
  try {
    console.log("💾 Tentative de sauvegarde dans browser.storage...");
    
    // Sauvegarder dans browser.storage
    await browser.storage.local.set({
      anilist_access_token: token,
      auth_date: new Date().toISOString(),
    });

    console.log("✅ Token sauvegardé avec succès dans le storage");

    // Vérifier que la sauvegarde a fonctionné
    const result = await browser.storage.local.get(['anilist_access_token']);
    console.log("🔍 Vérification du storage:", result.anilist_access_token ? "Token présent" : "Token absent");

    // Tester le token en faisant une requête à l'API AniList
    console.log("🧪 Test de validation du token...");
    const isValid = await testToken(token);

    if (isValid) {
      console.log("✅ Token validé avec succès");
      showSuccess("Token sauvegardé et validé avec succès !");
    } else {
      console.log("❌ Échec de la validation du token");
      showError("Token sauvegardé mais validation échouée");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde:", error);
    showError("Erreur lors de la sauvegarde du token: " + error.message);
  }
}

async function testToken(token) {
  try {
    console.log("🌐 Envoi de la requête à AniList...");
    
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

    console.log("📡 Statut de la réponse:", response.status);
    
    const data = await response.json();
    console.log("📄 Données reçues:", data);

    if (data.data && data.data.Viewer) {
      console.log("✅ Token validé pour l'utilisateur:", data.data.Viewer.name);
      return true;
    } else {
      console.error("❌ Réponse invalide de l'API:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors du test du token:", error);
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
