const API_URL = "https://graphql.anilist.co";

// Charger les tokens depuis Chrome storage (auth-success)
async function loadTokens() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["anilist_access_token"], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error("❌ Erreur lors du chargement des tokens"));
      } else if (!result.anilist_access_token) {
        reject(
          new Error(
            "❌ Token d'accès introuvable. Connectez-vous d'abord via l'extension !",
          ),
        );
      } else {
        resolve({ access_token: result.anilist_access_token });
      }
    });
  });
}

// ANCIENNE VERSION - Charger les tokens depuis un fichier tokens.json
/*
async function loadTokens() {
  try {
    const response = await fetch(chrome.runtime.getURL("tokens.json"));
    const tokens = await response.json();
    if (!tokens.access_token) {
      throw new Error("❌ Token d'accès introuvable dans tokens.json");
    }
    return tokens;
  } catch (error) {
    throw new Error(
      "❌ Erreur lors du chargement des tokens depuis tokens.json: " +
        error.message,
    );
  }
}
*/

async function graphqlRequest(query, variables = {}) {
  const tokens = await loadTokens();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access_token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await res.json();
  return result.data;
}

async function getViewer() {
  const query = `
    query {
      Viewer {
        id
        name
        avatar {
          large
        }
        bannerImage
        about(asHtml: false)
        siteUrl
      }
    }
  `;
  const data = await graphqlRequest(query);
  return data.Viewer;
}

async function getAnimeList(userId) {
  const query = `
    query ($userId: Int) {
      MediaListCollection(userId: $userId, type: ANIME) {
        lists {
          name
          status
          entries {
            progress
            score
            updatedAt
            media {
              id
              title {
                romaji
                english
                native
              }
              episodes
              coverImage {
                large
              }
              siteUrl
            }
          }
        }
      }
    }
  `;
  const data = await graphqlRequest(query, { userId });
  return data.MediaListCollection.lists;
}

export async function getAnimeIdByName(name) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        episodes
        siteUrl
      }
    }
  `;

  const data = await graphqlRequest(query, { search: name });
  return data.Media;
}

export async function updateAnimeProgress(mediaId, progress) {
  const mutation = `
    mutation ($mediaId: Int, $progress: Int) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
        id
        status
        progress
        updatedAt
        media {
          title {
            romaji
            english
          }
          siteUrl
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, { mediaId, progress });
  return data.SaveMediaListEntry;
}
