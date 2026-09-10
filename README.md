# Permutation de classes — Prototype

Prototype fonctionnel très simple pour permettre aux étudiants de publier et
consulter des demandes de permutation de classe (TD/TP), **sans base de
données réelle** : les données sont simulées avec un tableau JS (demandes
fictives) + `localStorage` (demandes ajoutées par l'utilisateur).

## Lancer le projet en local

Prérequis : [Node.js](https://nodejs.org/) (version 18 ou plus récente).

Depuis le dossier du projet, exécuter dans l'ordre :

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse affichée dans le terminal (en général
`http://localhost:5173`).

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

## Ce que vous pouvez tester

- Voir la liste des demandes fictives (12 exemples couvrant les 3 sections).
- Rechercher par nom, prénom, classe actuelle ou classe souhaitée.
- Filtrer par section / classe (TD) / groupe (TP), et réinitialiser les filtres.
- Cliquer sur **"+ Ajouter permutation"** pour publier une nouvelle demande :
  - le formulaire utilise des menus déroulants (jamais de saisie manuelle du
    type "3LMTD4TP1") ;
  - la section de destination est automatiquement verrouillée sur la même
    section que la classe actuelle (LM → LM, LT → LT, IoT → IoT) ;
  - au moins un moyen de contact (WhatsApp / Facebook / Autre) est requis.
- La nouvelle demande apparaît immédiatement en haut de la liste, et reste
  disponible après rechargement de la page (grâce à `localStorage`, sur le
  même navigateur).
- Les demandes de plus de 7 jours sont automatiquement masquées (simulation
  simple d'expiration).

## Structure du projet

```
src/
  data/
    classStructure.js   # sections/années/TD/TP + construction du code de classe
    mockRequests.js      # demandes fictives de démonstration
  utils/
    storage.js            # lecture/écriture localStorage (à remplacer par une vraie API plus tard)
    search.js             # logique de recherche
    filters.js             # logique des filtres
    expiration.js         # règle des 7 jours
    time.js                 # affichage "il y a X heures"
  components/
    Header.jsx
    SearchBar.jsx
    Filters.jsx
    RequestList.jsx
    RequestCard.jsx
    AddRequestForm.jsx
    Modal.jsx
  App.jsx                  # assemble tout
  index.css                # styles
```

Le code est volontairement séparé par responsabilité (données / logique /
affichage) pour que l'ajout d'une vraie base de données plus tard se limite
principalement à remplacer le contenu de `src/utils/storage.js` par des
appels API, sans réécrire le reste de l'application.

## Ce qui n'est PAS encore fait (volontairement, pour ce prototype)

- Vraie base de données (MySQL/PostgreSQL/Firebase/Supabase...).
- Compte étudiant / authentification.
- Lien secret pour modifier/supprimer une demande (la structure du code s'y
  prête déjà : chaque demande a un `id` unique, et `src/utils/storage.js`
  contient déjà des fonctions `updateStoredRequest` / `removeStoredRequest`
  prêtes à être branchées sur une vraie interface de gestion).
- Interface d'administration.
- Suppression automatique côté serveur après 7 jours (pour l'instant,
  l'expiration est simplement simulée à l'affichage, côté navigateur).

## Stack utilisée et pourquoi

- **React + Vite** : démarrage instantané en local (`npm run dev`), rechargement
  à chaud, et une base saine si vous voulez brancher une vraie base de données
  ou un backend plus tard sans tout réécrire. Pas de framework plus lourd
  (Next.js, etc.) car il n'y a pas besoin de rendu serveur pour ce prototype.
- **CSS simple (un seul fichier `index.css`)** : pas de librairie de design,
  conformément à la demande d'un rendu volontairement basique.
- **`localStorage`** : suffisant pour simuler une base de données côté
  prototype, sans backend à configurer.
