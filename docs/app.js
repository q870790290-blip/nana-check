const form = document.getElementById('check-form');
const resultCard = document.getElementById('result-card');
const resultContainer = document.getElementById('result');
const examplesContainer = document.getElementById('examples');

const EXAMPLES = [
  {
    name: 'Example Agent Tool',
    url: 'https://example.com/docs',
    category: 'tool',
    focus: 'It claims guaranteed profit with AI agent automation.',
  },
  {
    name: 'Open Source Research Agent',
    url: 'https://github.com/example/research-agent',
    category: 'project',
    focus: 'I want to know whether it is only a demo or a real usable system.',
  },
  {
    name: 'Token Insight Club',
    url: 'https://example.com/membership',
    category: 'token service',
    focus: 'It sells token-gated research content. I want to know how risky it is.',
  },
  {
    name: 'Protocol Analytics Dashboard',
    url: 'https://example.com/analytics',
    category: 'protocol',
    focus: 'Judge whether it has real data value or only good storytelling.',
  },
];

function normalizeText(value) {
  return String(value || '').trim();
}

function hasKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function getRiskBand(score) {
  if (score >= 75) return 'Low to Medium';
  if (score >= 55) return 'Medium';
  if (score >= 35) return 'Medium to High';
  return 'High';
}

function analyzeNanaCheck(input) {
  const name = normalizeText(input.name);
  const targetUrl = normalizeText(input.url);
  const category = normalizeText(input.category || 'unspecified');
  const focus = normalizeText(input.focus);
  const combined = `${name} ${targetUrl} ${category} ${focus}`.toLowerCase();

  const greenFlags = [];
  const redFlags = [];
  const nextChecks = [];
  let score = 50;

  if (targetUrl) {
    score += 8;
    greenFlags.push('A specific URL was provided, so public signals can be checked.');
  } else {
    score -= 10;
    redFlags.push('No URL was provided, so the judgment is limited and easier to skew by narrative.');
    nextChecks.push('Add an official site, docs page, or product link.');
  }

  if (name.length >= 4) {
    score += 5;
    greenFlags.push('The target name is clear enough for follow-up verification.');
  } else {
    score -= 4;
    redFlags.push('The target name is too short or unclear, which weakens follow-up research.');
  }

  if (['project', 'tool', 'protocol', 'platform', 'token service'].includes(category)) {
    score += 4;
    greenFlags.push('The category is clear, so the judgment frame is more stable.');
  } else {
    redFlags.push('The category is unclear, so the result has to stay conservative.');
    nextChecks.push('Clarify whether this is a project, tool, protocol, platform, or token service.');
  }

  if (hasKeyword(combined, ['guaranteed', 'guarantee', '100x', 'risk free'])) {
    score -= 25;
    redFlags.push('The pitch contains exaggerated return or no-risk language.');
  }

  if (hasKeyword(combined, ['token', 'airdrop', 'futures', 'leverage'])) {
    score -= 8;
    redFlags.push('The target sits close to speculation-heavy language and needs stronger verification.');
    nextChecks.push('Check the business model before following the token narrative.');
  }

  if (hasKeyword(combined, ['github', 'docs', 'documentation', 'open source', 'whitepaper'])) {
    score += 10;
    greenFlags.push('Documentation or repository signals increase transparency.');
  }

  if (hasKeyword(combined, ['agent', 'ai', 'research', 'analysis'])) {
    nextChecks.push('Verify whether it has a real usable capability, not only a demo story.');
  }

  if (hasKeyword(combined, ['anonymous team', 'anonymous'])) {
    score -= 12;
    redFlags.push('Opaque team identity increases execution and trust risk.');
  }

  score = Math.max(5, Math.min(95, score));

  let verdict = 'Not enough evidence yet. Collect more signals before trusting it.';
  let confidence = 'Low';
  let recommendation = 'Gather more links, pricing info, team details, and real user feedback first.';

  if (score >= 70) {
    verdict = 'Looks relatively normal so far, but still needs deeper verification.';
    confidence = 'Medium';
    recommendation = 'Reasonable to keep watching, but still not something to trust blindly or size up hard.';
  } else if (score >= 50) {
    verdict = 'Signals are mixed. Stay cautious and do not commit too early.';
    confidence = 'Medium';
    recommendation = 'Do a second pass and only continue if the key doubts get resolved.';
  } else if (score >= 30) {
    verdict = 'Risk looks elevated. Treat this as a high-verification target.';
    confidence = 'Medium';
    recommendation = 'Handle it as high risk unless stronger evidence shows up.';
  } else {
    verdict = 'High-risk / high-noise signals are obvious. Do not trust it right now.';
    confidence = 'High';
    recommendation = 'This looks more like something to avoid than something to chase.';
  }

  if (greenFlags.length === 0) {
    greenFlags.push('No strong positive signals are visible yet.');
  }

  if (redFlags.length === 0) {
    redFlags.push('No major red flags are obvious yet, but verification is still required.');
  }

  if (nextChecks.length === 0) {
    nextChecks.push('Keep checking team, docs, pricing, and real usage.');
  }

  const summary = `${verdict} Current risk band: ${getRiskBand(score)}. The key question is whether public materials match real capability.`;

  return {
    target: { name, url: targetUrl, category, focus },
    verdict,
    confidence,
    score,
    riskBand: getRiskBand(score),
    summary,
    recommendation,
    greenFlags,
    redFlags,
    nextChecks,
    generatedAt: new Date().toISOString(),
  };
}

function renderList(title, items) {
  return `
    <section class="result-block">
      <h3>${title}</h3>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    </section>
  `;
}

function renderCaseStudies() {
  return [
    {
      title: 'Case A · AI Agent Tool credibility check',
      brief: 'Question: is this an actual tool or just a demo wrapped in hype?',
      takeaway: 'Best when the buyer wants a fast yes/no/caution direction before spending more time.',
    },
    {
      title: 'Case B · Token-gated research product risk check',
      brief: 'Question: is this selling real value or mostly narrative and access psychology?',
      takeaway: 'Best when the buyer is deciding whether a gated information product is worth paying for.',
    },
    {
      title: 'Case C · Protocol / analytics platform follow-or-ignore check',
      brief: 'Question: does this target look like it has a real path or only strong packaging?',
      takeaway: 'Best when the buyer needs a first-pass triage before deeper research or payment.',
    },
  ];
}

function fillForm(example) {
  for (const [key, value] of Object.entries(example)) {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  }
}

function renderExamples() {
  examplesContainer.innerHTML = EXAMPLES.map((example, index) => `
    <button class="example-card" type="button" data-index="${index}">
      <strong>${example.name}</strong>
      <span>${example.category}</span>
      <small>${example.focus}</small>
    </button>
  `).join('');

  examplesContainer.querySelectorAll('[data-index]').forEach(button => {
    button.addEventListener('click', () => {
      fillForm(EXAMPLES[Number(button.dataset.index)]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  resultCard.hidden = true;
  resultContainer.innerHTML = 'Analyzing...';

  const payload = Object.fromEntries(new FormData(form).entries());
  const data = analyzeNanaCheck(payload);

  resultContainer.innerHTML = `
    <section class="result-block hero">
      <h3>${data.target.name || 'Unnamed target'}</h3>
      <p><strong>Verdict:</strong> ${data.verdict}</p>
      <p><strong>Confidence:</strong> ${data.confidence}</p>
      <p><strong>Risk score:</strong> ${data.score}/100</p>
      <p><strong>Risk band:</strong> ${data.riskBand}</p>
      <p><strong>Action:</strong> ${data.actionLabel}</p>
      <p><strong>Summary:</strong> ${data.summary}</p>
      <p><strong>Recommendation:</strong> ${data.recommendation}</p>
    </section>
    ${renderList('Evidence checklist', data.evidenceChecklist)}
    ${renderList('Green flags', data.greenFlags)}
    ${renderList('Red flags', data.redFlags)}
    ${renderList('Next checks', data.nextChecks)}
  `;

  resultCard.hidden = false;
});

renderExamples();

const caseStudiesContainer = document.getElementById('case-studies');
if (caseStudiesContainer) {
  caseStudiesContainer.innerHTML = renderCaseStudies().map(item => `
    <article class="case-study-card">
      <h3>${item.title}</h3>
      <p><strong>Use case:</strong> ${item.brief}</p>
      <p><strong>Why it matters:</strong> ${item.takeaway}</p>
    </article>
  `).join('');
}
