(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DICTIONNAIRES ENRICHIS
  // ══════════════════════════════════════════════════════════════════════════

  // Haiku : verbes impératifs simples → requête directe et courte (FR + EN)
  const HAIKU_COMMANDS = [
    // Traduction / Translation
    'traduis', 'translate',
    // Résumé / Summary
    'résume', 'summarize', 'résumer', 'sum up',
    // Définition / Definition
    'définis', 'define', 'définir', 'what does', 'what is',
    // Liste / List
    'liste', 'list', 'lister', 'enumerate',
    // Correction / Fix
    'corrige', 'correct', 'corriger', 'fix', 'proofread',
    // Reformulation / Rephrase
    'reformule', 'rephrase', 'reformuler', 'reword', 'paraphrase',
    // Commandes directes / Direct commands
    'donne-moi', 'donne moi', 'give me', 'montre', 'show me', 'show',
    'convertis', 'convert', 'calcule', 'calculate', 'compte', 'count',
    'épelle', 'spell', 'vérifie', 'check', 'cherche', 'find', 'lookup',
    'explique', 'explain', 'décris', 'describe', 'clarify',
    'formate', 'format', 'clean up', 'simplify', 'simplifie',
  ];

  // Sonnet : langages de programmation et frameworks
  const SONNET_LANGUAGES = [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'rust',
    'golang', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'bash',
    'shell', 'powershell', 'sql', 'mysql', 'postgresql', 'sqlite',
    'mongodb', 'redis', 'elasticsearch', 'graphql', 'html', 'css',
    'sass', 'scss', 'react', 'vue', 'angular', 'svelte', 'next.js',
    'nuxt', 'astro', 'django', 'flask', 'fastapi', 'spring', 'express',
    'nestjs', 'laravel', 'rails', 'nodejs', 'node.js', 'deno', 'bun',
    'docker', 'kubernetes', 'terraform', 'ansible', 'webpack', 'vite',
    'babel', 'jest', 'pytest', 'junit', 'rest api', 'websocket', 'grpc',
    'oauth', 'jwt', 'api', 'sdk', 'git', 'github', 'ci/cd', 'devops',
    'regex', 'recursion', 'async', 'await', 'promise', 'callback',
  ];

  // Opus : domaines académiques, juridiques, financiers, scientifiques (FR + EN)
  const OPUS_DOMAINS = [
    // Analyse approfondie / In-depth analysis
    'analyse approfondie', 'analyse détaillée', 'in-depth analysis',
    'comprehensive analysis', 'deep dive', 'étude approfondie',
    'detailed analysis', 'thorough analysis', 'critical analysis',
    'comprehensive review', 'systematic analysis', 'analyze in detail',
    'explain in depth', 'in depth', 'en profondeur',
    // Académique / Academic
    'recherche', 'research', 'théorème', 'theorem', 'démontrer', 'prove',
    'hypothèse', 'hypothesis', 'méthodologie', 'methodology', 'paradigme',
    'épistémologie', 'dissertation', 'mémoire', 'thèse', 'thesis',
    'peer review', 'publication scientifique', 'littérature académique',
    'academic', 'scholarly', 'peer-reviewed', 'literature review',
    // Juridique / Legal
    'juridique', 'légal', 'legal', 'contrat', 'contract', 'clause',
    'réglementation', 'compliance', 'gdpr', 'rgpd', 'tribunal',
    'litigation', 'litige', 'jurisprudence', 'legislation',
    'article de loi', 'droit ', 'droit du', 'regulatory', 'liability',
    // Financier / Financial
    'financier', 'financial', 'investissement', 'investment', 'portefeuille',
    'portfolio', 'rendement', 'return on investment', 'valorisation',
    'valuation', 'bilan', 'comptabilité', 'accounting', 'audit financier',
    "taux d'intérêt", 'interest rate', 'derivatives', 'risk assessment',
    'due diligence', 'fusion-acquisition', 'ipo', 'revenue model',
    'profit margin', 'cash flow', 'forecasting', 'budget analysis',
    // Scientifique / Scientific
    'scientifique', 'expérience', 'experiment', 'statistiques', 'statistics',
    'corrélation', 'régression', 'regression', 'modélisation', 'simulation',
    'machine learning', 'deep learning', 'neural network', 'llm',
    'embedding', 'clustering', 'classification', 'data science',
    // Stratégie / Architecture / Strategy
    'stratégie', 'strategy', 'plan stratégique', 'transformation',
    'architecture système', 'system architecture', 'disruption',
    'innovation', 'business model', 'go-to-market', 'raisonnement complexe',
    'strategic plan', 'roadmap', 'vision', 'competitive analysis',
    // Autres complexités / Other complexities
    'compare', 'comparer', 'contrast', 'evaluate', 'évaluer',
    'pros and cons', 'avantages et inconvénients', 'tradeoff', 'trade-off',
    'optimize', 'optimiser', 'refactor', 'architecture', 'scalability',
    'scalabilité', 'security', 'sécurité', 'migration', 'intégration',
  ];

  // ── 2. STRUCTURE DE PHRASE : connecteurs multi-étapes (FR + EN) ──────────
  const MULTI_STEP_CONNECTORS = [
    // Français
    'et puis', 'ensuite', 'également', 'en plus', 'de plus', 'par ailleurs',
    "d'abord", 'puis', 'enfin', 'finalement', 'au final',
    'premièrement', 'deuxièmement', 'troisièmement',
    // English
    'furthermore', 'additionally', 'moreover', 'besides', 'also',
    'first of all', 'secondly', 'thirdly', 'lastly', 'in addition',
    'not only', 'as well as', 'on top of that', 'then', 'next',
    'after that', 'afterward', 'following that', 'subsequently',
  ];

  // ── 3. NORMALISATION ET REDONDANCE ──────────────────────────────────────

  // Supprime les espaces excessifs et sauts de ligne multiples avant analyse
  function normalizeText(text) {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Calcule la diversité lexicale : ratio mots-uniques / total
  // ratio = 1.0 → aucune répétition · ratio → 0 → très redondant
  function computeRedundancy(lower) {
    const words = lower.split(/\s+/).filter(w => w.length > 1);
    const total  = words.length;
    if (total === 0) return { total: 0, unique: 0, ratio: 1 };
    const unique = new Set(words).size;
    return { total, unique, ratio: unique / total };
  }

  // ── 4. DÉTECTION DE LANGUE ───────────────────────────────────────────────
  // Retourne 'fr', 'en', ou 'mixed' — informatif, n'affecte pas le scoring
  // (les deux dictionnaires sont toujours analysés simultanément)
  function detectLanguage(lower) {
    const frMarkers = (lower.match(/[éèêëàâùûôîçœ]|(\ble\b|\bla\b|\bles\b|\bde\b|\bdu\b|\bes\b|\bun\b|\bune\b|\bdes\b|\bpour\b|\bavec\b|\bsur\b|\bdans\b|\bque\b|\bqui\b)/g) || []).length;
    const enMarkers = (lower.match(/\b(the|is|are|was|were|have|has|be|to|of|and|for|with|on|in|that|this|it|an|at)\b/g) || []).length;
    if (frMarkers > enMarkers * 1.5) return 'fr';
    if (enMarkers > frMarkers * 1.5) return 'en';
    return 'mixed';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. CONTEXTE DE CONVERSATION (lecture DOM silencieuse)
  // ══════════════════════════════════════════════════════════════════════════

  function analyzeConversationContext() {
    let bonus = 0;
    let hasCode = false;
    let isTechnicalAndLong = false;

    try {
      // Compter les tours utilisateur (chaque tour = 1 échange)
      let exchanges = 0;
      const turnSelectors = [
        '[data-testid="human-turn"]',
        '[data-testid="user-turn"]',
        '[class*="human-turn"]',
        '[class*="HumanTurn"]',
        '[class*="user-message"]',
        '[class*="UserMessage"]',
      ];
      for (const sel of turnSelectors) {
        const found = document.querySelectorAll(sel).length;
        if (found > 0) { exchanges = found; break; }
      }

      // Détecter du code dans les messages affichés (pas dans notre badge ni le textarea)
      const codeEls = document.querySelectorAll('pre, code');
      for (const el of codeEls) {
        if (el.closest('#mr-badge')) continue;
        if (el.closest('[contenteditable]')) continue;
        if ((el.textContent || '').trim().length > 15) { hasCode = true; break; }
      }

      // Bonus selon longueur de conversation
      if (exchanges >= 5) {
        bonus += 15;
        if (hasCode) { bonus += 10; isTechnicalAndLong = true; }
      } else if (exchanges >= 3) {
        bonus += 8;
        if (hasCode) bonus += 5;
      } else if (exchanges >= 1) {
        bonus += 3;
        if (hasCode) bonus += 4;
      }
    } catch (_) { /* lecture DOM non bloquante */ }

    return { bonus, hasCode, isTechnicalAndLong };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ALGORITHME DE SCORING — 4 dimensions
  // ══════════════════════════════════════════════════════════════════════════

  function analyzeComplexity(text) {
    if (!text || text.trim().length < 3) return null;

    // Normaliser avant tout : espaces excessifs, sauts de ligne multiples
    const trimmed    = normalizeText(text);
    const lower      = trimmed.toLowerCase();
    const charCount  = trimmed.length;
    const redundancy = computeRedundancy(lower);
    const wordCount  = redundancy.total;

    // Longueur effective : si 80%+ de duplication, scorer sur la portion unique
    // Un prompt de 1000 mots avec 50 mots uniques répétés → score comme 50 mots
    const effectiveChars = redundancy.ratio < 0.20
      ? Math.round(charCount * redundancy.ratio)
      : charCount;

    let score    = 0;
    let minScore = 0; // plancher imposé par mots-clés forts (prime sur la longueur)

    // ── A. LONGUEUR EFFECTIVE (mots uniques, pas le total brut) ─────────────
    // Un prompt de 200 mots avec 150 uniques score plus haut qu'un de
    // 1000 mots avec 50 uniques répétés.
    if      (effectiveChars < 60)  score += 8;
    else if (effectiveChars < 150) score += 20;
    else if (effectiveChars < 350) score += 36;
    else if (effectiveChars < 650) score += 50;
    else                           score += 62;

    // Pénalité de redondance : contenu peu varié, même long, reste simple
    if      (redundancy.ratio < 0.20) score -= 16;
    else if (redundancy.ratio < 0.40) score -= 8;

    // ── B. DICTIONNAIRE HAIKU (commandes simples) ────────────────────────────
    // Impératif en début de phrase : signe de requête courte et directe
    let haikuStartHit = false;
    for (const kw of HAIKU_COMMANDS) {
      if (lower.startsWith(kw + ' ') || lower === kw || lower.startsWith(kw + '\n')) {
        haikuStartHit = true;
        score -= 14;
        break;
      }
    }
    // Mot-clé Haiku présent n'importe où (moins pénalisant)
    if (!haikuStartHit) {
      let haikuHits = 0;
      for (const kw of HAIKU_COMMANDS) {
        if (lower.includes(' ' + kw + ' ') || lower.includes(' ' + kw + ':')) haikuHits++;
      }
      score -= Math.min(haikuHits * 6, 18);
    }

    // ── C. DICTIONNAIRE SONNET (langages / frameworks) ───────────────────────
    // Mots courts (≤ 4 chars) : word-boundary pour éviter les faux positifs
    // (ex. "api" dans "capital", "sql" dans "casual", "git" dans "digital")
    let sonnetHits = 0;
    for (const kw of SONNET_LANGUAGES) {
      const matched = kw.length <= 4
        ? new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(lower)
        : lower.includes(kw);
      if (matched) sonnetHits++;
    }
    score += Math.min(sonnetHits * 6, 22);
    if (sonnetHits >= 1) minScore = Math.max(minScore, 32); // au moins Sonnet

    // ── D. DICTIONNAIRE OPUS (académique / juridique / financier / scientifique)
    let opusHits = 0;
    for (const kw of OPUS_DOMAINS) {
      if (lower.includes(kw)) opusHits++;
    }
    score += Math.min(opusHits * 10, 32);
    if (opusHits >= 2) minScore = Math.max(minScore, 64); // au moins Opus

    // ── E. STRUCTURE DE PHRASE ───────────────────────────────────────────────
    const sentences     = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const sentenceCount = sentences.length;

    // E1. Nombre de phrases : 1 → Haiku, 2-3 → Sonnet, 4+ → Opus
    if      (sentenceCount === 1) score -= 8;
    else if (sentenceCount <= 3)  score += 6;
    else                          score += 16;

    // E2. Connecteurs multi-étapes → Opus
    let connectorHits = 0;
    for (const c of MULTI_STEP_CONNECTORS) {
      if (lower.includes(c)) connectorHits++;
    }
    if      (connectorHits >= 2) { score += 18; minScore = Math.max(minScore, 64); }
    else if (connectorHits === 1) score += 8;

    // E3. Impératif simple + phrase unique → Haiku renforcé
    if (haikuStartHit && sentenceCount <= 1) score -= 10;

    // E4. Phrases denses ET lexicalement variées (mots/phrase élevé + diversité)
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    if (avgWordsPerSentence > 20 && redundancy.ratio > 0.40) score += 8;

    // E5. Listes numérotées ou à puces
    const numberedItems = (trimmed.match(/^\s*\d+[.)]/gm) || []).length;
    const bulletItems   = (trimmed.match(/^\s*[-•*]/gm) || []).length;
    if (numberedItems >= 2 || bulletItems >= 2) score += 12;

    // E6. Questions multiples
    const qCount = (trimmed.match(/\?/g) || []).length;
    if (qCount > 1) score += (qCount - 1) * 6;

    // ── F. TYPE DE CONTENU DÉTECTÉ ───────────────────────────────────────────

    // F1. URL dans la requête → Sonnet minimum (analyse de lien)
    const hasURL = /https?:\/\/[^\s]+/.test(trimmed) ||
                   /www\.[a-z0-9-]+\.[a-z]{2,}/i.test(trimmed);
    if (hasURL) { score += 15; minScore = Math.max(minScore, 32); }

    // F2. Blocs de code collés (backticks ou indentation significative)
    const codeBlocks  = trimmed.match(/```[\s\S]*?```/g) || [];
    const inlineCode  = (trimmed.match(/`[^`\n]+`/g) || []).length;
    const indentLines = (trimmed.match(/^(\s{4}|\t)\S/gm) || []).length;

    if (codeBlocks.length > 0) {
      const codeLen = codeBlocks.reduce((a, b) => a + b.length, 0);
      if (codeLen > 300) { score += 25; minScore = Math.max(minScore, 64); }
      else               { score += 18; minScore = Math.max(minScore, 32); }
    } else if (inlineCode > 0 || indentLines >= 3) {
      score += 12;
      minScore = Math.max(minScore, 32);
    }

    // F3. Données numériques abondantes (tableaux, stats, métriques)
    const numberCount = (trimmed.match(/\b\d+([.,]\d+)?(%|€|\$|k|M|G)?\b/g) || []).length;
    if (numberCount >= 5) { score += 10; minScore = Math.max(minScore, 32); }

    // F4. Référence à un fichier uploadé → Sonnet minimum
    const hasFileRef = /\.(pdf|docx?|xlsx?|csv|json|xml|txt|png|jpe?g|svg|zip|py|js|ts)\b/i
      .test(trimmed);
    if (hasFileRef) { score += 15; minScore = Math.max(minScore, 32); }

    // ── G. CONTEXTE DE CONVERSATION ─────────────────────────────────────────
    const ctx = analyzeConversationContext();
    score += ctx.bonus;
    if (ctx.hasCode)             minScore = Math.max(minScore, 32);
    if (ctx.isTechnicalAndLong)  minScore = Math.max(minScore, 64);

    // ── RÉSULTAT FINAL ────────────────────────────────────────────────────────
    // minScore (posé par les mots-clés) prime toujours sur la longueur :
    // des mots-clés Opus dans un texte court → Opus garanti malgré le faible score brut.
    score = Math.max(minScore, Math.min(score, 100));
    score = Math.max(0, score);

    const lang = detectLanguage(lower);

    if (score < 32) {
      return { model: 'Haiku',  score, lang, color: '#34d399', emoji: '⚡', reason: 'Simple request — fast & efficient' };
    } else if (score < 64) {
      return { model: 'Sonnet', score, lang, color: '#818cf8', emoji: '✦', reason: 'Moderate complexity — balanced performance' };
    } else {
      return { model: 'Opus',   score, lang, color: '#fbbf24', emoji: '◆', reason: 'High complexity — maximum reasoning' };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DU BADGE
  // ══════════════════════════════════════════════════════════════════════════

  let badge      = null;
  let rafPending = false;
  let isEnabled  = true;

  function ensureBadge() {
    if (badge) return badge;
    badge = document.createElement('div');
    badge.id = 'mr-badge';
    badge.className = 'mr-hidden';
    document.body.appendChild(badge);
    return badge;
  }

  function positionBadge() {
    if (!badge) return;
    badge.style.top    = '20px';
    badge.style.left   = '50%';
    badge.style.right  = 'auto';
    badge.style.bottom = 'auto';
  }

  function showBadge(result) {
    const b = ensureBadge();
    b.setAttribute('data-model', result.model.toLowerCase());
    b.innerHTML =
      `<span class="mr-icon">${result.emoji}</span>` +
      `<strong class="mr-model">${result.model}</strong>` +
      `<span class="mr-dot">·</span>` +
      `<span class="mr-reason">${result.reason}</span>`;
    requestAnimationFrame(() => {
      positionBadge();
      b.className = 'mr-visible';
    });
  }

  function hideBadge() {
    if (badge) badge.className = 'mr-hidden';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DE L'ÉDITEUR & ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════

  function getEditorText(el) {
    return el.innerText || el.textContent || el.value || '';
  }

  // Vérifie si un élément est le champ de saisie principal de claude.ai.
  // Utilisé à chaque événement : aucun élément DOM n'est stocké durablement,
  // ce qui rend l'extension immune à toute recréation de l'éditeur.
  function isMainEditor(el) {
    if (!el || el.getAttribute('contenteditable') !== 'true') return false;
    const r = el.getBoundingClientRect();
    return r.width > 200 && r.height > 20 && r.bottom > window.innerHeight * 0.35;
  }

  function handleEditorInput(el) {
    if (!isEnabled || rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const text = getEditorText(el);
      if (text.trim().length < 5) { hideBadge(); return; }
      const result = analyzeComplexity(text);
      if (result) showBadge(result);
      else hideBadge();
    });
  }

  function handleSend() {
    hideBadge();
    rafPending = false;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════

  function init() {
    chrome.storage.local.get(['mrEnabled'], res => {
      isEnabled = res.mrEnabled !== false;
    });

    ensureBadge();

    // Event delegation en phase de capture : un unique listener sur document
    // intercepte les input events sur tout éditeur, qu'il ait été créé au
    // chargement ou recréé par claude.ai après chaque message envoyé.
    document.addEventListener('input', e => {
      if (isMainEditor(e.target)) handleEditorInput(e.target);
    }, true);

    // MutationObserver : repositionne le badge si le layout change
    // (ouverture d'un nouveau fil, redimensionnement de la zone de saisie…)
    new MutationObserver(() => {
      if (badge && badge.className === 'mr-visible') positionBadge();
    }).observe(document.body, { childList: true, subtree: true });

    // Envoi : touche Entrée — vérifie l'élément actif au moment de l'appui,
    // sans dépendre d'une référence DOM stockée qui pourrait être périmée.
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        if (isMainEditor(document.activeElement)) {
          setTimeout(handleSend, 60);
        }
      }
    }, true);

    // Envoi : clic sur le bouton d'envoi
    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const lbl  = (btn.getAttribute('aria-label') || '').toLowerCase();
      const type = btn.getAttribute('type') || '';
      if (lbl.includes('send') || lbl.includes('envoyer') || type === 'submit') {
        setTimeout(handleSend, 60);
      }
    }, true);

    window.addEventListener('resize', () => {
      if (badge && badge.className === 'mr-visible') positionBadge();
    }, { passive: true });
  }

  chrome.storage.onChanged.addListener(changes => {
    if ('mrEnabled' in changes) {
      isEnabled = changes.mrEnabled.newValue !== false;
      if (!isEnabled) hideBadge();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
