// Configuration Anilist OAuth
const CLIENT_ID = '11424'; // ID public d'Anilist
const REDIRECT_URI = chrome.identity.getRedirectURL();

document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('login');
  const testBtn = document.getElementById('test');
  const status = document.getElementById('status');

  // Vérifier si on a déjà un token au chargement
  checkTokenStatus();

  loginBtn.addEventListener('click', function() {
    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token`;
    
    chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    }, function(redirectUrl) {
      if (chrome.runtime.lastError) {
        showStatus('Erreur lors de la connexion', 'error');
        return;
      }
      
      // Extraire le token de l'URL de redirection
      const urlParams = new URL(redirectUrl.replace('#', '?'));
      const accessToken = urlParams.searchParams.get('access_token');
      
      if (accessToken) {
        // Sauvegarder le token
        chrome.storage.local.set({
          'access_token': accessToken
        }, function() {
          showStatus('Connexion réussie !', 'success');
          loginBtn.textContent = 'Connecté ✓';
          loginBtn.disabled = true;
        });
      } else {
        showStatus('Impossible de récupérer le token', 'error');
      }
    });
  });

  testBtn.addEventListener('click', function() {
    chrome.storage.local.get(['access_token'], function(result) {
      if (!result.access_token) {
        showStatus('Aucun token trouvé. Connectez-vous d\'abord.', 'error');
        return;
      }
      
      // Test simple de l'API
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.access_token}`
        },
        body: JSON.stringify({
          query: `
            query {
              Viewer {
                name
              }
            }
          `
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.data && data.data.Viewer) {
          showStatus(`Connecté en tant que: ${data.data.Viewer.name}`, 'success');
        } else {
          showStatus('Erreur lors du test de connexion', 'error');
        }
      })
      .catch(error => {
        showStatus('Erreur de réseau', 'error');
      });
    });
  });

  function checkTokenStatus() {
    chrome.storage.local.get(['access_token'], function(result) {
      if (result.access_token) {
        loginBtn.textContent = 'Connecté ✓';
        loginBtn.disabled = true;
        showStatus('Token trouvé', 'success');
      } else {
        showStatus('Non connecté', 'error');
      }
    });
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = type;
  }
});