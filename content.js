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

  function normalizeText(text) {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function computeRedundancy(lower) {
    const words = lower.split(/\s+/).filter(w => w.length > 1);
    const total  = words.length;
    if (total === 0) return { total: 0, unique: 0, ratio: 1 };
    const unique = new Set(words).size;
    return { total, unique, ratio: unique / total };
  }

  // ── 4. DÉTECTION DE LANGUE ───────────────────────────────────────────────
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

      const codeEls = document.querySelectorAll('pre, code');
      for (const el of codeEls) {
        if (el.closest('#mr-badge')) continue;
        if (el.closest('#bd-badge')) continue;
        if (el.closest('[contenteditable]')) continue;
        if ((el.textContent || '').trim().length > 15) { hasCode = true; break; }
      }

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

    const trimmed    = normalizeText(text);
    const lower      = trimmed.toLowerCase();
    const charCount  = trimmed.length;
    const redundancy = computeRedundancy(lower);
    const wordCount  = redundancy.total;

    const effectiveChars = redundancy.ratio < 0.20
      ? Math.round(charCount * redundancy.ratio)
      : charCount;

    let score    = 0;
    let minScore = 0;

    // ── A. LONGUEUR EFFECTIVE ────────────────────────────────────────────────
    if      (effectiveChars < 60)  score += 8;
    else if (effectiveChars < 150) score += 20;
    else if (effectiveChars < 350) score += 36;
    else if (effectiveChars < 650) score += 50;
    else                           score += 62;

    if      (redundancy.ratio < 0.20) score -= 16;
    else if (redundancy.ratio < 0.40) score -= 8;

    // ── B. DICTIONNAIRE HAIKU ────────────────────────────────────────────────
    let haikuStartHit = false;
    for (const kw of HAIKU_COMMANDS) {
      if (lower.startsWith(kw + ' ') || lower === kw || lower.startsWith(kw + '\n')) {
        haikuStartHit = true;
        score -= 14;
        break;
      }
    }
    if (!haikuStartHit) {
      let haikuHits = 0;
      for (const kw of HAIKU_COMMANDS) {
        if (lower.includes(' ' + kw + ' ') || lower.includes(' ' + kw + ':')) haikuHits++;
      }
      score -= Math.min(haikuHits * 6, 18);
    }

    // ── C. DICTIONNAIRE SONNET ───────────────────────────────────────────────
    let sonnetHits = 0;
    for (const kw of SONNET_LANGUAGES) {
      const matched = kw.length <= 4
        ? new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(lower)
        : lower.includes(kw);
      if (matched) sonnetHits++;
    }
    score += Math.min(sonnetHits * 6, 22);
    if (sonnetHits >= 1) minScore = Math.max(minScore, 32);

    // ── D. DICTIONNAIRE OPUS ─────────────────────────────────────────────────
    let opusHits = 0;
    for (const kw of OPUS_DOMAINS) {
      if (lower.includes(kw)) opusHits++;
    }
    score += Math.min(opusHits * 10, 32);
    if (opusHits >= 2) minScore = Math.max(minScore, 64);

    // ── E. STRUCTURE DE PHRASE ───────────────────────────────────────────────
    const sentences     = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const sentenceCount = sentences.length;

    if      (sentenceCount === 1) score -= 8;
    else if (sentenceCount <= 3)  score += 6;
    else                          score += 16;

    let connectorHits = 0;
    for (const c of MULTI_STEP_CONNECTORS) {
      if (lower.includes(c)) connectorHits++;
    }
    if      (connectorHits >= 2) { score += 18; minScore = Math.max(minScore, 64); }
    else if (connectorHits === 1) score += 8;

    if (haikuStartHit && sentenceCount <= 1) score -= 10;

    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    if (avgWordsPerSentence > 20 && redundancy.ratio > 0.40) score += 8;

    const numberedItems = (trimmed.match(/^\s*\d+[.)]/gm) || []).length;
    const bulletItems   = (trimmed.match(/^\s*[-•*]/gm) || []).length;
    if (numberedItems >= 2 || bulletItems >= 2) score += 12;

    const qCount = (trimmed.match(/\?/g) || []).length;
    if (qCount > 1) score += (qCount - 1) * 6;

    // ── F. TYPE DE CONTENU DÉTECTÉ ───────────────────────────────────────────
    const hasURL = /https?:\/\/[^\s]+/.test(trimmed) ||
                   /www\.[a-z0-9-]+\.[a-z]{2,}/i.test(trimmed);
    if (hasURL) { score += 15; minScore = Math.max(minScore, 32); }

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

    const numberCount = (trimmed.match(/\b\d+([.,]\d+)?(%|€|\$|k|M|G)?\b/g) || []).length;
    if (numberCount >= 5) { score += 10; minScore = Math.max(minScore, 32); }

    const hasFileRef = /\.(pdf|docx?|xlsx?|csv|json|xml|txt|png|jpe?g|svg|zip|py|js|ts)\b/i
      .test(trimmed);
    if (hasFileRef) { score += 15; minScore = Math.max(minScore, 32); }

    // ── G. CONTEXTE DE CONVERSATION ─────────────────────────────────────────
    const ctx = analyzeConversationContext();
    score += ctx.bonus;
    if (ctx.hasCode)             minScore = Math.max(minScore, 32);
    if (ctx.isTechnicalAndLong)  minScore = Math.max(minScore, 64);

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
  // GESTION DU BADGE MODEL ROUTER
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
      if (batchBadge && batchBadge.className === 'bd-visible') positionBatchBadge();
      if (newChatBadge && newChatBadge.className === 'nc-visible') positionNewChatBadge();
    });
  }

  function hideBadge() {
    if (badge) badge.className = 'mr-hidden';
    if (batchBadge && batchBadge.className === 'bd-visible') positionBatchBadge();
    if (newChatBadge && newChatBadge.className === 'nc-visible') positionNewChatBadge();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BATCH DETECTOR
  // ══════════════════════════════════════════════════════════════════════════

  const BATCH_WORD_THRESHOLD = 15;       // prompt considered "short" below this
  const BATCH_MIN_HISTORY    = 2;        // short messages needed in session
  const BATCH_COOLDOWN_MS    = 5 * 60 * 1000; // 5 min between badge shows

  let batchBadge         = null;
  let batchCooldownUntil = 0;
  let shortMsgHistory    = [];           // timestamps of sent short messages this session
  let batchTooltipOpen   = false;

  function countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  function ensureBatchBadge() {
    if (batchBadge) return batchBadge;
    batchBadge = document.createElement('div');
    batchBadge.id = 'bd-badge';
    batchBadge.className = 'bd-hidden';
    batchBadge.innerHTML =
      '<div class="bd-main-row">' +
        '<span class="bd-icon">⊕</span>' +
        '<span class="bd-msg">Batch opportunity — combine your tasks into one prompt for better results</span>' +
        '<button class="bd-btn" type="button">Show me how</button>' +
      '</div>' +
      '<div class="bd-tooltip" hidden>' +
        '<div class="bd-tooltip-section">' +
          '<span class="bd-tooltip-label">Instead of sending separately:</span>' +
          '<div class="bd-tooltip-items">' +
            '<span>→ Summarize this</span>' +
            '<span>→ Pull key insights</span>' +
            '<span>→ Write a headline</span>' +
          '</div>' +
        '</div>' +
        '<div class="bd-tooltip-section">' +
          '<span class="bd-tooltip-label">Send once:</span>' +
          '<div class="bd-tooltip-combined">“Summarize this, pull the 3 key insights, and write a headline.”</div>' +
        '</div>' +
      '</div>';

    batchBadge.querySelector('.bd-btn').addEventListener('click', e => {
      e.stopPropagation();
      batchTooltipOpen = !batchTooltipOpen;
      const tt  = batchBadge.querySelector('.bd-tooltip');
      const btn = batchBadge.querySelector('.bd-btn');
      if (batchTooltipOpen) {
        tt.removeAttribute('hidden');
        btn.textContent = 'Got it ✕';
      } else {
        tt.setAttribute('hidden', '');
        btn.textContent = 'Show me how';
      }
      positionBatchBadge();
    });

    document.body.appendChild(batchBadge);
    return batchBadge;
  }

  function positionBatchBadge() {
    if (!batchBadge) return;
    const modelVisible = badge && badge.className === 'mr-visible';
    if (modelVisible) {
      const rect = badge.getBoundingClientRect();
      batchBadge.style.top = (rect.bottom + 8) + 'px';
    } else {
      batchBadge.style.top = '20px';
    }
    batchBadge.style.left   = '50%';
    batchBadge.style.right  = 'auto';
    batchBadge.style.bottom = 'auto';
  }

  function showBatchBadge() {
    const b = ensureBatchBadge();
    batchCooldownUntil = Date.now() + BATCH_COOLDOWN_MS;
    requestAnimationFrame(() => {
      positionBatchBadge();
      b.className = 'bd-visible';
    });
  }

  function hideBatchBadge() {
    if (!batchBadge) return;
    batchBadge.className = 'bd-hidden';
    batchTooltipOpen = false;
    const tt  = batchBadge.querySelector('.bd-tooltip');
    const btn = batchBadge.querySelector('.bd-btn');
    if (tt)  tt.setAttribute('hidden', '');
    if (btn) btn.textContent = 'Show me how';
    if (newChatBadge && newChatBadge.className === 'nc-visible') positionNewChatBadge();
  }

  function checkBatchOpportunity(text) {
    if (!isEnabled) return false;
    if (countWords(text) >= BATCH_WORD_THRESHOLD) return false;
    if (shortMsgHistory.length < BATCH_MIN_HISTORY) return false;
    if (Date.now() < batchCooldownUntil) return false;
    return true;
  }

  function recordSentMessage(text) {
    if (!text) return;
    if (countWords(text) < BATCH_WORD_THRESHOLD) {
      shortMsgHistory.push(Date.now());
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NEW CHAT SUGGESTION
  // ══════════════════════════════════════════════════════════════════════════

  const NC_MIN_MESSAGES      = 6;
  const NC_OVERLAP_THRESHOLD = 0.20;

  const NC_STOP_WORDS = new Set([
    // English
    'the','a','an','is','are','was','were','be','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might',
    'shall','can','to','of','in','for','on','with','at','by','from','up',
    'about','into','this','that','these','those','i','me','my','we','our',
    'you','your','he','she','it','its','they','their','what','which','who',
    'how','when','where','why','all','more','also','just','than','then',
    'so','but','and','or','not','no','if','as','get','make','use','like',
    'want','need','know','think','see','go','here','now','okay','yes',
    // French
    'le','la','les','un','une','des','de','du','en','et','ou','est','sont',
    'que','qui','dans','pour','sur','avec','par','au','aux','pas','ne','se',
    'ce','je','tu','il','elle','nous','vous','ils','elles','me','te','lui',
    'leur','mon','ma','mes','ton','ta','tes','son','sa','ses','mais','donc',
    'car','ni','si','très','plus','bien','tout','cette','aussi','comme',
  ]);

  let newChatBadge   = null;
  let newChatShown   = false;    // at most once per conversation
  let lastUrl        = '';
  let ncCheckTimeout = null;

  function extractKeywords(text) {
    return new Set(
      text.toLowerCase()
        .replace(/[^a-zàâäéèêëîïôùûüÿœç0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !NC_STOP_WORDS.has(w))
    );
  }

  function getConversationMessages() {
    const selectors = [
      '[data-testid="human-turn"]',
      '[data-testid="user-turn"]',
      '[class*="human-turn"]',
      '[class*="HumanTurn"]',
      '[class*="user-message"]',
      '[class*="UserMessage"]',
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) return Array.from(els).map(el => (el.textContent || '').trim());
    }
    return [];
  }

  function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;
    let common = 0;
    for (const w of setA) { if (setB.has(w)) common++; }
    return common / (setA.size + setB.size - common);
  }

  function detectTopicChange(currentText) {
    try {
      const messages = getConversationMessages();
      if (messages.length < NC_MIN_MESSAGES) return false;

      const firstThird = Math.max(1, Math.floor(messages.length / 3));
      const earlyText  = messages.slice(0, firstThird).join(' ');
      const recentMsgs = messages.slice(-3);
      const recentText = currentText
        ? [...recentMsgs, currentText].join(' ')
        : recentMsgs.join(' ');

      const earlyKw  = extractKeywords(earlyText);
      const recentKw = extractKeywords(recentText);

      return jaccardSimilarity(earlyKw, recentKw) < NC_OVERLAP_THRESHOLD;
    } catch (_) {
      return false;
    }
  }

  function ensureNewChatBadge() {
    if (newChatBadge) return newChatBadge;
    newChatBadge = document.createElement('div');
    newChatBadge.id = 'nc-badge';
    newChatBadge.className = 'nc-hidden';
    newChatBadge.innerHTML =
      '<span class="nc-icon">⊙</span>' +
      '<span class="nc-msg">Topic change detected — a new chat gives Claude a cleaner context</span>' +
      '<button class="nc-btn" type="button">New chat</button>';

    newChatBadge.querySelector('.nc-btn').addEventListener('click', e => {
      e.stopPropagation();
      window.location.href = 'https://claude.ai/new';
    });

    document.body.appendChild(newChatBadge);
    return newChatBadge;
  }

  function positionNewChatBadge() {
    if (!newChatBadge) return;
    let top = 20;
    if (badge && badge.className === 'mr-visible') {
      const r = badge.getBoundingClientRect();
      top = Math.max(top, r.bottom + 8);
    }
    if (batchBadge && batchBadge.className === 'bd-visible') {
      const r = batchBadge.getBoundingClientRect();
      top = Math.max(top, r.bottom + 8);
    }
    newChatBadge.style.top    = top + 'px';
    newChatBadge.style.left   = '50%';
    newChatBadge.style.right  = 'auto';
    newChatBadge.style.bottom = 'auto';
  }

  function showNewChatBadge() {
    const b = ensureNewChatBadge();
    newChatShown = true;
    requestAnimationFrame(() => {
      positionNewChatBadge();
      b.className = 'nc-visible';
    });
  }

  function hideNewChatBadge() {
    if (newChatBadge) newChatBadge.className = 'nc-hidden';
  }

  function scheduleTopicCheck() {
    if (ncCheckTimeout) clearTimeout(ncCheckTimeout);
    ncCheckTimeout = setTimeout(() => {
      ncCheckTimeout = null;
      if (!isEnabled || newChatShown) return;
      if (detectTopicChange('')) showNewChatBadge();
    }, 600);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DÉTECTION DE L'ÉDITEUR & ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════

  function getEditorText(el) {
    return el.innerText || el.textContent || el.value || '';
  }

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
      if (text.trim().length < 5) {
        hideBadge();
        hideBatchBadge();
        return;
      }

      // Model Router badge
      const result = analyzeComplexity(text);
      if (result) showBadge(result);
      else hideBadge();

      // Batch Detector badge
      if (countWords(text) >= BATCH_WORD_THRESHOLD) {
        hideBatchBadge();
      } else if (checkBatchOpportunity(text)) {
        showBatchBadge();
      }

      // New Chat Suggestion: hide when the user types something on-topic
      if (newChatShown && newChatBadge && newChatBadge.className === 'nc-visible') {
        if (!detectTopicChange(text)) hideNewChatBadge();
      }
    });
  }

  function handleSend(text) {
    recordSentMessage(text);
    hideBadge();
    hideBatchBadge();
    hideNewChatBadge();
    rafPending = false;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════

  function init() {
    chrome.storage.local.get(['mrEnabled'], res => {
      isEnabled = res.mrEnabled !== false;
    });

    lastUrl = window.location.href;
    ensureBadge();
    ensureBatchBadge();
    ensureNewChatBadge();

    document.addEventListener('input', e => {
      if (isMainEditor(e.target)) handleEditorInput(e.target);
    }, true);

    new MutationObserver(() => {
      if (badge && badge.className === 'mr-visible') positionBadge();
      if (batchBadge && batchBadge.className === 'bd-visible') positionBatchBadge();
      if (newChatBadge && newChatBadge.className === 'nc-visible') positionNewChatBadge();

      // Detect conversation navigation (SPA URL change)
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        newChatShown = false;
        hideNewChatBadge();
        shortMsgHistory = [];
      }

      // Schedule topic drift check after DOM settles
      if (isEnabled && !newChatShown) scheduleTopicCheck();
    }).observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        if (isMainEditor(document.activeElement)) {
          const text = getEditorText(document.activeElement);
          setTimeout(() => handleSend(text), 60);
        }
      }
    }, true);

    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      // Ignore clicks inside our own badges
      if (btn.closest('#bd-badge') || btn.closest('#nc-badge')) return;
      const lbl  = (btn.getAttribute('aria-label') || '').toLowerCase();
      const type = btn.getAttribute('type') || '';
      if (lbl.includes('send') || lbl.includes('envoyer') || type === 'submit') {
        const editors = Array.from(document.querySelectorAll('[contenteditable="true"]'));
        const mainEditor = editors.find(el => isMainEditor(el));
        const text = mainEditor ? getEditorText(mainEditor) : '';
        setTimeout(() => handleSend(text), 60);
      }
    }, true);

    window.addEventListener('resize', () => {
      if (badge && badge.className === 'mr-visible') positionBadge();
      if (batchBadge && batchBadge.className === 'bd-visible') positionBatchBadge();
      if (newChatBadge && newChatBadge.className === 'nc-visible') positionNewChatBadge();
    }, { passive: true });
  }

  chrome.storage.onChanged.addListener(changes => {
    if ('mrEnabled' in changes) {
      isEnabled = changes.mrEnabled.newValue !== false;
      if (!isEnabled) {
        hideBadge();
        hideBatchBadge();
        hideNewChatBadge();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
