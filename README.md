# Model Router for Claude

Extension Chrome qui analyse la complexité de vos requêtes en temps réel et suggère le modèle Claude optimal — **100% local, aucun appel externe**.

---

## Aperçu

Pendant que vous tapez dans claude.ai, un badge apparaît en haut de page avec une recommandation de modèle mise à jour à chaque frappe :

| Badge | Modèle | Cas d'usage |
|---|---|---|
| ⚡ **Haiku** | Simple et rapide | Traductions, résumés, définitions, corrections, reformulations |
| ✦ **Sonnet** | Équilibré | Code (Python, React, SQL…), rédaction, analyse technique |
| ◆ **Opus** | Raisonnement maximal | Recherche approfondie, droit, finance, stratégie, multi-étapes |

### ⚡ Haiku — requête simple

![Badge Haiku](screenshots/haiku.png)

### ✦ Sonnet — code et technique

![Badge Sonnet](screenshots/sonnet.png)

### ◆ Opus — analyse complexe

![Badge Opus](screenshots/opus.png)

### Après envoi — badge effacé

![Après envoi](screenshots/after-send.png)

---

## Installation

1. Cloner ou télécharger ce dépôt
2. Ouvrir `chrome://extensions`
3. Activer le **Mode développeur** (en haut à droite)
4. Cliquer **Charger l'extension non empaquetée**
5. Sélectionner le dossier `model-router-extension/`
6. Aller sur [claude.ai](https://claude.ai) et commencer à taper

---

## Algorithme heuristique

L'analyse repose sur **4 dimensions**, toutes calculées localement :

### 1. Dictionnaires enrichis

- **Haiku** — verbes impératifs simples en début de phrase : `traduis`, `résume`, `définis`, `liste`, `corrige`, `reformule`…
- **Sonnet** — langages et frameworks : `python`, `javascript`, `react`, `sql`, `docker`, `typescript`, `graphql`… (35+ entrées) → plancher Sonnet garanti
- **Opus** — domaines académiques, juridiques (`contrat`, `compliance`, `litige`), financiers (`due diligence`, `valuation`), scientifiques (`regression`, `clustering`) → 50+ termes

### 2. Structure de la phrase

- **Nombre de phrases** : 1 → signal Haiku, 2-3 → Sonnet, 4+ → Opus
- **Connecteurs multi-étapes** (`ensuite`, `également`, `d'abord`, `furthermore`, `additionally`…) : 2+ connecteurs → Opus forcé
- **Impératif simple + phrase unique** → pénalité renforcée

### 3. Contexte de conversation

Lecture silencieuse du DOM (non bloquante, try/catch) :

- 1-2 échanges → +3 pts, 3-4 → +8 pts, 5+ → +15 pts
- Code détecté dans l'historique (`<pre>`, `<code>`) → plancher Sonnet
- Conversation longue **et** technique → plancher Opus

### 4. Type de contenu

| Signal détecté | Effet |
|---|---|
| URL (`https://…`) | +15 pts, plancher Sonnet |
| Bloc de code \`\`\`…\`\`\` court | +18 pts, plancher Sonnet |
| Bloc de code long (>300 chars) | +25 pts, plancher Opus |
| 5+ valeurs numériques | +10 pts, plancher Sonnet |
| Référence fichier (`.pdf`, `.csv`, `.xlsx`…) | +15 pts, plancher Sonnet |

### Seuils de décision

```
Score  0–31  →  ⚡ Haiku
Score 32–63  →  ✦ Sonnet
Score 64–100 →  ◆ Opus
```

Les signaux forts (langages, connecteurs, URL, fichiers) imposent un **score plancher** (`minScore`) indépendamment des autres critères.

---

## Structure du projet

```
model-router-extension/
├── manifest.json   — Manifest V3, injecté sur claude.ai/*
├── content.js      — Algorithme heuristique + gestion du badge
├── styles.css      — Style du badge (glassmorphism, bordure colorée)
├── popup.html      — Interface on/off de l'extension
└── popup.js        — Logique du popup (chrome.storage)
```

---

## Confidentialité

- Aucune donnée envoyée à un serveur externe
- Aucun appel API
- Tout le traitement se fait dans le navigateur, en mémoire, à la frappe
- La seule permission réseau est `host_permissions: ["https://claude.ai/*"]` pour l'injection du script
