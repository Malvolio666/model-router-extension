(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DICTIONNAIRES ENRICHIS
  // ══════════════════════════════════════════════════════════════════════════

  // Haiku : verbes impératifs simples → requête directe et courte
  const HAIKU_COMMANDS = [
    'traduis', 'translate', 'résume', 'summarize', 'résumer',
    'définis', 'define', 'liste', 'list', 'lister',
    'corrige', 'correct', 'corriger', 'reformule', 'rephrase', 'reformuler',
    'donne-moi', 'donne moi', 'give me', 'montre', 'show me',
    'convertis', 'convert', 'calcule', 'calculate', 'compte', 'count',
    'épelle', 'spell', 'vérifie', 'check', 'cherche', 'find',
    'explique', 'explain', 'décris', 'describe',
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

  // Opus : domaines académiques, juridiques, financiers, scientifiques
  const OPUS_DOMAINS = [
    // Analyse approfondie
    'analyse approfondie', 'analyse détaillée', 'in-depth analysis',
    'comprehensive analysis', 'deep dive', 'étude approfondie',
    // Académique
    'recherche', 'research', 'théorème', 'theorem', 'démontrer', 'prove',
    'hypothèse', 'hypothesis', 'méthodologie', 'methodology', 'paradigme',
    'épistémologie', 'dissertation', 'mémoire', 'thèse', 'thesis',
    'peer review', 'publication scientifique', 'littérature académique',
    // Juridique
    'juridique', 'légal', 'legal', 'contrat', 'contract', 'clause',
    'réglementation', 'compliance', 'gdpr', 'rgpd', 'tribunal',
    'litigation', 'litige', 'jurisprudence', 'legislation',
    'article de loi', 'droit ', 'droit du',
    // Financier
    'financier', 'financial', 'investissement', 'investment', 'portefeuille',
    'portfolio', 'rendement', 'return on investment', 'valorisation',
    'valuation', 'bilan', 'comptabilité', 'accounting', 'audit financier',
    "taux d'intérêt", 'interest rate', 'derivatives', 'risk assessment',
    'due diligence', 'fusion-acquisition', 'ipo',
    // Scientifique
    'scientifique', 'expérience', 'experiment', 'statistiques', 'statistics',
    'corrélation', 'régression', 'regression', 'modélisation', 'simulation',
    'machine learning', 'deep learning', 'neural network', 'llm',
    'embedding', 'clustering', 'classification',
    // Stratégie / Architecture
    'stratégie', 'strategy', 'plan stratégique', 'transformation',
    'architecture système', 'system architecture', 'disruption',
    'innovation', 'business model', 'go-to-market', 'raisonnement complexe',
    // Autres complexités
    'compare', 'comparer', 'contrast', 'evaluate', 'évaluer',
    'pros and cons', 'avantages et inconvénients', 'tradeoff', 'trade-off',
    'optimize', 'optimiser', 'refactor', 'architecture', 'scalability',
    'scalabilité', 'security', 'sécurité', 'migration', 'intégration',
  ];

  // ── 2. STRUCTURE DE PHRASE : connecteurs multi-étapes ────────────────────
  const MULTI_STEP_CONNECTORS = [
    'et puis', 'ensuite', 'également', 'en plus', 'de plus', 'par ailleurs',
    "d'abord", 'puis', 'enfin', 'finalement', 'au final',
    'premièrement', 'deuxièmement', 'troisièmement',
    'furthermore', 'additionally', 'moreover', 'besides',
    'first of all', 'secondly', 'thirdly', 'lastly', 'in addition',
    'not only', 'as well as', 'on top of that',
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 3. CONTEXTE DE CONVERSATION (lecture DOM silencieuse)
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

    const trimmed   = text.trim();
    const lower     = trimmed.toLowerCase();
    const words     = trimmed.split(/\s+/);
    const wordCount = words.length;
    const charCount = trimmed.length;

    let score    = 0;
    let minScore = 0; // plancher imposé par signaux forts

    // ── A. LONGUEUR BRUTE ────────────────────────────────────────────────────
    if      (charCount < 60)  score += 8;
    else if (charCount < 150) score += 20;
    else if (charCount < 350) score += 36;
    else if (charCount < 650) score += 50;
    else                      score += 62;

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
    let sonnetHits = 0;
    for (const kw of SONNET_LANGUAGES) {
      if (lower.includes(kw)) sonnetHits++;
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

    // E4. Phrases denses (mots/phrase élevé)
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    if (avgWordsPerSentence > 20) score += 8;

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
    score = Math.max(minScore, Math.min(score, 100));
    score = Math.max(0, score);

    if (score < 32) {
      return { model: 'Haiku',  score, color: '#34d399', emoji: '⚡', reason: 'Requête simple — rapide et efficace' };
    } else if (score < 64) {
      return { model: 'Sonnet', score, color: '#818cf8', emoji: '✦', reason: 'Complexité modérée — performance équilibrée' };
    } else {
      return { model: 'Opus',   score, color: '#fbbf24', emoji: '◆', reason: 'Complexité élevée — raisonnement maximal' };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DU BADGE
  // ══════════════════════════════════════════════════════════════════════════

  let badge         = null;
  let currentEditor = null;
  let rafPending    = false;
  let isEnabled     = true;

  function ensureBadge() {
    if (badge) return badge;
    badge = document.createElement('div');
    badge.id = 'mr-badge';
    badge.className = 'mr-hidden';
    document.body.appendChild(badge);
    return badge;
  }

  function findSendButton() {
    const ariaSelectors = [
      'button[aria-label="Send message"]',
      'button[aria-label="Send Message"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="Envoyer"]',
      'button[data-testid*="send"]',
    ];
    for (const sel of ariaSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        const r = btn.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return btn;
      }
    }
    if (!currentEditor) return null;
    let parent = currentEditor.parentElement;
    for (let i = 0; i < 6 && parent; i++, parent = parent.parentElement) {
      const candidate = Array.from(parent.querySelectorAll('button')).find(btn => {
        if (!btn.querySelector('svg')) return false;
        const r = btn.getBoundingClientRect();
        return r.width > 0 && r.right > window.innerWidth * 0.65;
      });
      if (candidate) return candidate;
    }
    return null;
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

  function findEditor() {
    const candidates = Array.from(
      document.querySelectorAll('div[contenteditable="true"]')
    );
    return candidates.find(el => {
      const r = el.getBoundingClientRect();
      return r.width > 200 && r.height > 20 && r.bottom > window.innerHeight * 0.35;
    }) || null;
  }

  function getEditorText(el) {
    return el.innerText || el.textContent || el.value || '';
  }

  function handleInput(e) {
    if (!isEnabled || rafPending) return;
    const editor = e.currentTarget;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const text = getEditorText(editor);
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

  function attachEditor(editor) {
    if (currentEditor === editor) return;
    if (currentEditor) currentEditor.removeEventListener('input', handleInput);
    currentEditor = editor;
    editor.addEventListener('input', handleInput);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════

  function init() {
    chrome.storage.local.get(['mrEnabled'], res => {
      isEnabled = res.mrEnabled !== false;
    });

    ensureBadge();

    const obs = new MutationObserver(() => {
      const ed = findEditor();
      if (ed) attachEditor(ed);
      if (badge && badge.className === 'mr-visible') positionBadge();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    const ed = findEditor();
    if (ed) attachEditor(ed);

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        if (currentEditor &&
            (document.activeElement === currentEditor ||
             currentEditor.contains(document.activeElement))) {
          setTimeout(handleSend, 60);
        }
      }
    }, true);

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
