# Anilist Updater

Extension Chrome qui met à jour automatiquement liste Anilist avec les animés regardés sur Crunchyroll.

## Fonctionnalités

- **Détection automatique** des épisodes regardés sur Crunchyroll et V6 Voiranime
- **Mise à jour Anilist** : ajoute automatiquement les épisodes à votre liste
- **Options personnalisables** : mode automatique ou avec confirmation
- **Notifications** : feedback visuel des mises à jour
- **Interface intuitive** : popup de confirmation élégante

## Installation

### 1. Télécharger l'extension

Clonez ou téléchargez ce repository sur votre ordinateur.

### 2. Installer sur Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le **"Mode développeur"** (toggle en haut à droite)
3. Cliquez sur **"Charger l'extension non empaquetée"** (ou **"Load unpacked"**)
4. Sélectionnez le dossier de l'extension
5. L'extension apparaît dans votre liste d'extensions apèrs quelque instants

### 3. Configuration des tokens Anilist

1. Placez vos tokens d'authentification Anilist dans le fichier `script/tokens.json`
2. Format requis :

```json
{
  "token_type": "Bearer",
  "expires_in": "vote_date_expiration_du_token",
  "access_token": "votre_access_token_ici",
  "refresh_token": "votre_refresh_token_ici"
}
```

## Configuration

### Accéder aux options

- **Méthode 1** : Clic droit sur l'icône de l'extension → "Options"
- **Méthode 2** : Aller dans `chrome://extensions/` → Détails de l'extension → "Options d'extension"

### Options disponibles

#### Mise à jour automatique

- **Activé** : Met à jour Anilist automatiquement sans demander confirmation
- **Désactivé** _(par défaut)_ : Affiche une popup pour confirmer chaque mise à jour

#### Notifications

- **Activé** _(par défaut)_ : Affiche des notifications de succès/erreur
- **Désactivé** : Fonctionnement silencieux

## Utilisation

1. **Naviguez** sur Crunchyroll
2. **Regardez** un épisode d'animé
3. L'extension **détecte automatiquement** l'épisode
4. Selon vos paramètres :
   - **Mode automatique** : Mise à jour immédiate sur Anilist
   - **Mode confirmation** : Popup pour valider la mise à jour

## Structure du projet

```
  anilist-updater/
  ├── 📄 manifest.json          # Configuration principale
  ├── 📄 README.md
  ├── 📄 .gitignore
  │
  ├── 📁 src/                   # Code source principal
  │   ├── 📄 background.js      # Service worker
  │   ├── 📄 content.js         # Script injecté
  │   └── 📄 anilist-fetch.js   # API Anilist
  │
  ├── 📁 ui/                    # Interfaces utilisateur
  │   ├── 📄 popup.html         # Popup principale
  │   ├── 📄 popup.js
  │   ├── 📄 options.html       # Page d'options
  │   ├── 📄 options.js
  │   ├── 📄 confirm.html       # Popup de confirmation
  │   └── 📄 confirm.js
  │
  └── 📁 assets/                # Ressources statiques
      └── 📁 icons/
          ├── 📄 icon-16.png    # 16x16px
          ├── 📄 icon-48.png    # 48x48px
          ├── 📄 icon-128.png   # 128x128px
          └── 📄 icon-512.png   # 512x512px (store)
```

## Permissions requises

L'extension demande les permissions suivantes :

- `tabs` : Accès aux onglets pour détecter les pages visitées
- `storage` : Sauvegarde des paramètres et données temporaires
- `webNavigation` : Détection de navigation sur les sites supportés
- `notifications` : Affichage des notifications
- `scripting` : Injection de scripts dans les pages

## Roadmap

- [ ] Rajouter une vérification si on modifie un anime déjà vue et si on baisse le compteur d'épisodes (on annule)
- [ ] Modifier les commentaires dans le code (les faires en anglais + les améliorés et en rajouter)
- [ ] Modifié l'icon de l'extension (et la mettre partout pour tout les emplacements d'icones, exemple : dans la liste des extensions)
- [ ] Interface d'authentification Anilist intégrée (Enlever le dossir script quand la page d'authentifcation est intégrer)
- [ ] Statistiques de visionnage (avoir directement dans les options de l'extension les infos de son compte anylist)
- [ ] Rendre l'extension compatible firefox
