# Correctif UX/UI — septembre 2026

## Ce qui change

### 1. Les captures sont enfin lisibles

- `.mock-frame` passe de `clamp(130px, 20vw, 190px)` à `100%` avec un plafond
  de `340px`. Sur mobile (< 640 px) les deux cadres s'empilent au lieu de
  cohabiter à 150 px chacun.
- Chaque cadre est devenu un `<button data-zoom>` : un clic ouvre la capture
  en plein écran, avec navigation gauche/droite entre les captures du projet.
- La visionneuse est un `<dialog>` natif ouvert par `showModal()`, ce qui
  fournit le piège de focus, la touche Échap et l'inertisation de
  l'arrière-plan sans code supplémentaire.
- Les rotations décoratives (`rotate(-3deg)`) ne s'appliquent plus qu'aux
  maquettes Kadaster. À 340 px, une capture inclinée se lit mal.

> **À faire de ton côté :** tes captures font 400 px de large et s'affichent
> désormais à 340 px. C'est net sur un écran classique, flou sur un écran
> Retina. Ré-exporte-les à 800–900 px de large et remplace les fichiers dans
> `assets/img/` (mêmes noms), la mise en page ne bougera pas.

### 2. Le poids

| | avant | après |
|---|---|---|
| Document HTML (gzip) | 441 Ko | 6,5 Ko |
| Premier rendu (doc + CSS + JS + photo) | 441 Ko | ~26 Ko |
| Images | dans le HTML, jamais mises en cache | 305 Ko en WebP, différées, cache 1 an |

- Les 15 images `data:` sont sorties dans `assets/img/*.webp` (−36 % vs JPEG).
- `loading="lazy"` fonctionne réellement maintenant : sur un data-URI il ne
  servait à rien, l'image était déjà téléchargée avec le document.
- `width` et `height` sur chaque `<img>` pour réserver la place et éviter le
  décalage de mise en page au chargement.
- La photo du hero est préchargée (`rel="preload"` + `fetchpriority="high"`),
  c'est l'élément LCP.
- Le CSS et le JS sont désormais partagés entre `index.html` et `en.html`.
  Une correction de style ne se fait plus en double.

### 3. Onglets de rôles : motif ARIA complet

`role="tab"` était annoncé sans le comportement correspondant. Ajouté :
`aria-controls`, `aria-labelledby` sur les panneaux, `tabindex` glissant
(seul l'onglet actif est atteignable par Tab), navigation aux flèches
gauche/droite et aux touches Origine/Fin.

### 4. Autres corrections

- **Menu mobile** : fermé, il restait atteignable au clavier hors écran.
  Il est maintenant `inert` + `visibility:hidden`, se ferme avec Échap et
  rend le focus au bouton.
- **Contraste** : `--text-dimmer` passe de `#7c7a74` à `#8d8b85`. Les
  libellés de contact tombaient à 4,22:1 sur `--surface` (seuil AA : 4,5).
  Minimum désormais : 5,05:1.
- **Fausse barre d'URL** : 0,56 rem (≈ 9 px) → 0,7 rem, et couleur plus lisible.
- **Icônes** : `aria-hidden="true"` sur les 32 `<i>` décoratifs.
- **Sans JavaScript** : `.reveal` était en `opacity:0`, la page apparaissait
  vide. Un `<noscript>` rétablit la visibilité.
- **Notification de copie** : « Email copié ! » s'affichait aussi quand la
  copie échouait (`catch(showToast)`). Message d'échec distinct désormais.
- **Lien d'évitement** en premier élément focusable.
- **Bloc CMB** : la description passe avant les captures (contexte d'abord),
  et le second bouton de démo, doublon du premier à un écran d'intervalle,
  est supprimé.
- `min-height:100svh` sur le hero, pour la barre d'URL mobile.
- `twitter:card` passe en `summary_large_image`.
- Compteurs animés désactivés si `prefers-reduced-motion`.
- Les deux écouteurs de `scroll` sont fusionnés dans un seul
  `requestAnimationFrame`.
- Esperluettes nues échappées : les deux pages passent la validation HTML5
  stricte.

## Ce qui n'est pas traité

- **La plateforme scolaire n'a toujours aucun visuel.** C'est le projet que
  tu décris comme le plus abouti et c'est un pavé de texte entre deux projets
  illustrés. Deux ou trois captures du module CFP rééquilibreraient la page.
- **Font Awesome** est chargé en entier (~110 Ko de CSS + polices) pour une
  vingtaine d'icônes. Les remplacer par des SVG en ligne économiserait
  l'essentiel de ce qui reste.
- **Les métriques** (« 38 modèles, 100 endpoints REST ») parlent à un profil
  technique. Si ta cible est le client final, il faut des chiffres métier.
- **Pas de CV dans la navigation.** Le bouton est en bas de page uniquement.

## Déploiement

```bash
npm i -g vercel        # une seule fois
vercel login
vercel                 # aperçu
vercel --prod          # production
```

Si tu passes par Git, un simple `git push` sur la branche de production
suffit, Vercel redéploie automatiquement.

**Attention au cache :** `assets/img/*` est servi avec
`max-age=31536000, immutable`. Si tu remplaces une capture sans changer son
nom de fichier, les visiteurs déjà venus garderont l'ancienne version
pendant un an. Change le nom du fichier (`cmb-client-menu-v2.webp`) ou
retire cette règle de `vercel.json`.
