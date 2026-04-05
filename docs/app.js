const form = document.getElementById('check-form');
const resultCard = document.getElementById('result-card');
const resultContainer = document.getElementById('result');
const examplesContainer = document.getElementById('examples');

const EXAMPLES = [
  {
    name: 'Example Agent Tool',
    url: 'https://example.com/docs',
    category: 'tool',
    focus: '它宣传 AI 自动赚钱，而且说 guaranteed profit。',
  },
  {
    name: 'Open Source Research Agent',
    url: 'https://github.com/example/research-agent',
    category: 'project',
    focus: '我想知道它到底是 demo 还是真有可运行能力。',
  },
  {
    name: 'Token Insight Club',
    url: 'https://example.com/membership',
    category: 'token service',
    focus: '它想卖 token-gated 研究内容，我想知道风险高不高。',
  },
  {
    name: 'Protocol Analytics Dashboard',
    url: 'https://example.com/analytics',
    category: 'protocol',
    focus: '判断它是不是有真实数据价值，还是只会讲故事。',
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
  if (score >= 75) return '低到中';
  if (score >= 55) return '中';
  if (score >= 35) return '中到高';
  return '高';
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
    greenFlags.push('给了明确网址，可以继续核对公开信息。');
  } else {
    score -= 10;
    redFlags.push('没有提供网址，信息不足，容易只看到宣传层。');
    nextChecks.push('补一个官网或产品页链接。');
  }

  if (name.length >= 4) {
    score += 5;
    greenFlags.push('目标名称清楚，便于后续搜索和比对。');
  } else {
    score -= 4;
    redFlags.push('目标名称过短或模糊，后续研究容易偏。');
  }

  if (['project', 'tool', 'protocol', 'platform', 'token service'].includes(category)) {
    score += 4;
    greenFlags.push('分类明确，判断口径更稳定。');
  } else {
    redFlags.push('分类不清楚，结果会偏保守。');
    nextChecks.push('明确它到底是项目、工具、协议还是平台。');
  }

  if (hasKeyword(combined, ['guaranteed', '稳赚', 'guarantee', '100x', '暴富', 'risk free', '无风险'])) {
    score -= 25;
    redFlags.push('出现明显夸大收益或无风险表述，宣传风险高。');
  }

  if (hasKeyword(combined, ['token', 'airdrop', 'futures', 'leverage', '期货', '杠杆'])) {
    score -= 8;
    redFlags.push('涉及高波动或投机语境，需要更强验证。');
    nextChecks.push('先确认它的商业模式，不要只看代币叙事。');
  }

  if (hasKeyword(combined, ['github', 'docs', 'documentation', 'open source', 'whitepaper'])) {
    score += 10;
    greenFlags.push('有文档/仓库线索，透明度相对更高。');
  }

  if (hasKeyword(combined, ['agent', 'ai', 'research', 'analysis'])) {
    nextChecks.push('核对是否真有可运行能力，不只是一段 demo 文案。');
  }

  if (hasKeyword(combined, ['anonymous team', 'anonymous', '匿名团队'])) {
    score -= 12;
    redFlags.push('团队身份不透明，会放大执行与信任风险。');
  }

  score = Math.max(5, Math.min(95, score));

  let verdict = '信息不足，先补材料再判断。';
  let confidence = '低';
  let recommendation = '先补链接、团队、定价和真实用户反馈，再决定要不要继续。';

  if (score >= 70) {
    verdict = '初步看相对正常，但还需要做更深验证。';
    confidence = '中';
    recommendation = '可以继续跟，但暂时只适合小成本观察，不适合重投入。';
  } else if (score >= 50) {
    verdict = '信号混合，建议谨慎，不要直接投入。';
    confidence = '中';
    recommendation = '先做二次核对，只有关键疑点被解释清楚后再考虑继续。';
  } else if (score >= 30) {
    verdict = '风险偏高，当前更像需要强验证的目标。';
    confidence = '中';
    recommendation = '优先把它当高风险标的处理，除非出现更硬的证据。';
  } else {
    verdict = '高风险/高噪音信号明显，先不要轻信。';
    confidence = '高';
    recommendation = '现在更像该直接避开，而不是继续投入时间和钱。';
  }

  if (greenFlags.length === 0) {
    greenFlags.push('目前没有看到足够强的正向信号。');
  }

  if (redFlags.length === 0) {
    redFlags.push('目前没有发现特别明显的红旗，但仍需补验证。');
  }

  if (nextChecks.length === 0) {
    nextChecks.push('继续核对团队、文档、价格、真实用户反馈。');
  }

  const summary = `${verdict} 当前风险带为 ${getRiskBand(score)}，最重要的是先确认公开材料与真实使用情况是否一致。`;

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
  resultContainer.innerHTML = '分析中...';

  const payload = Object.fromEntries(new FormData(form).entries());
  const data = analyzeNanaCheck(payload);

  resultContainer.innerHTML = `
    <section class="result-block hero">
      <h3>${data.target.name || '未命名目标'}</h3>
      <p><strong>结论：</strong>${data.verdict}</p>
      <p><strong>置信度：</strong>${data.confidence}</p>
      <p><strong>风险分：</strong>${data.score}/100</p>
      <p><strong>风险带：</strong>${data.riskBand}</p>
      <p><strong>摘要：</strong>${data.summary}</p>
      <p><strong>建议：</strong>${data.recommendation}</p>
    </section>
    ${renderList('正向信号', data.greenFlags)}
    ${renderList('风险信号', data.redFlags)}
    ${renderList('下一步核对', data.nextChecks)}
  `;

  resultCard.hidden = false;
});

renderExamples();
