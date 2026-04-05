const form = document.getElementById('check-form');
const resultCard = document.getElementById('result-card');
const resultContainer = document.getElementById('result');
const examplesContainer = document.getElementById('examples');

const EXAMPLES = [
  {
    name: 'Example Agent Tool',
    url: 'https://example.com/docs',
    category: 'tool',
    focus: '瀹冨浼?AI 鑷姩璧氶挶锛岃€屼笖璇?guaranteed profit銆?,
  },
  {
    name: 'Open Source Research Agent',
    url: 'https://github.com/example/research-agent',
    category: 'project',
    focus: '鎴戞兂鐭ラ亾瀹冨埌搴曟槸 demo 杩樻槸鐪熸湁鍙繍琛岃兘鍔涖€?,
  },
  {
    name: 'Token Insight Club',
    url: 'https://example.com/membership',
    category: 'token service',
    focus: '瀹冩兂鍗?token-gated 鐮旂┒鍐呭锛屾垜鎯崇煡閬撻闄╅珮涓嶉珮銆?,
  },
  {
    name: 'Protocol Analytics Dashboard',
    url: 'https://example.com/analytics',
    category: 'protocol',
    focus: '鍒ゆ柇瀹冩槸涓嶆槸鏈夌湡瀹炴暟鎹环鍊硷紝杩樻槸鍙細璁叉晠浜嬨€?,
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
  if (score >= 75) return '浣庡埌涓?;
  if (score >= 55) return '涓?;
  if (score >= 35) return '涓埌楂?;
  return '楂?;
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
    greenFlags.push('缁欎簡鏄庣‘缃戝潃锛屽彲浠ョ户缁牳瀵瑰叕寮€淇℃伅銆?);
  } else {
    score -= 10;
    redFlags.push('娌℃湁鎻愪緵缃戝潃锛屼俊鎭笉瓒筹紝瀹规槗鍙湅鍒板浼犲眰銆?);
    nextChecks.push('琛ヤ竴涓畼缃戞垨浜у搧椤甸摼鎺ャ€?);
  }

  if (name.length >= 4) {
    score += 5;
    greenFlags.push('鐩爣鍚嶇О娓呮锛屼究浜庡悗缁悳绱㈠拰姣斿銆?);
  } else {
    score -= 4;
    redFlags.push('鐩爣鍚嶇О杩囩煭鎴栨ā绯婏紝鍚庣画鐮旂┒瀹规槗鍋忋€?);
  }

  if (['project', 'tool', 'protocol', 'platform', 'token service'].includes(category)) {
    score += 4;
    greenFlags.push('鍒嗙被鏄庣‘锛屽垽鏂彛寰勬洿绋冲畾銆?);
  } else {
    redFlags.push('鍒嗙被涓嶆竻妤氾紝缁撴灉浼氬亸淇濆畧銆?);
    nextChecks.push('鏄庣‘瀹冨埌搴曟槸椤圭洰銆佸伐鍏枫€佸崗璁繕鏄钩鍙般€?);
  }

  if (hasKeyword(combined, ['guaranteed', '绋宠禋', 'guarantee', '100x', '鏆村瘜', 'risk free', '鏃犻闄?])) {
    score -= 25;
    redFlags.push('鍑虹幇鏄庢樉澶稿ぇ鏀剁泭鎴栨棤椋庨櫓琛ㄨ堪锛屽浼犻闄╅珮銆?);
  }

  if (hasKeyword(combined, ['token', 'airdrop', 'futures', 'leverage', '鏈熻揣', '鏉犳潌'])) {
    score -= 8;
    redFlags.push('娑夊強楂樻尝鍔ㄦ垨鎶曟満璇锛岄渶瑕佹洿寮洪獙璇併€?);
    nextChecks.push('鍏堢‘璁ゅ畠鐨勫晢涓氭ā寮忥紝涓嶈鍙湅浠ｅ竵鍙欎簨銆?);
  }

  if (hasKeyword(combined, ['github', 'docs', 'documentation', 'open source', 'whitepaper'])) {
    score += 10;
    greenFlags.push('鏈夋枃妗?浠撳簱绾跨储锛岄€忔槑搴︾浉瀵规洿楂樸€?);
  }

  if (hasKeyword(combined, ['agent', 'ai', 'research', 'analysis'])) {
    nextChecks.push('鏍稿鏄惁鐪熸湁鍙繍琛岃兘鍔涳紝涓嶅彧鏄竴娈?demo 鏂囨銆?);
  }

  if (hasKeyword(combined, ['anonymous team', 'anonymous', '鍖垮悕鍥㈤槦'])) {
    score -= 12;
    redFlags.push('鍥㈤槦韬唤涓嶉€忔槑锛屼細鏀惧ぇ鎵ц涓庝俊浠婚闄┿€?);
  }

  score = Math.max(5, Math.min(95, score));

  let verdict = '淇℃伅涓嶈冻锛屽厛琛ユ潗鏂欏啀鍒ゆ柇銆?;
  let confidence = '浣?;
  let recommendation = '鍏堣ˉ閾炬帴銆佸洟闃熴€佸畾浠峰拰鐪熷疄鐢ㄦ埛鍙嶉锛屽啀鍐冲畾瑕佷笉瑕佺户缁€?;

  if (score >= 70) {
    verdict = '鍒濇鐪嬬浉瀵规甯革紝浣嗚繕闇€瑕佸仛鏇存繁楠岃瘉銆?;
    confidence = '涓?;
    recommendation = '鍙互缁х画璺燂紝浣嗘殏鏃跺彧閫傚悎灏忔垚鏈瀵燂紝涓嶉€傚悎閲嶆姇鍏ャ€?;
  } else if (score >= 50) {
    verdict = '淇″彿娣峰悎锛屽缓璁皑鎱庯紝涓嶈鐩存帴鎶曞叆銆?;
    confidence = '涓?;
    recommendation = '鍏堝仛浜屾鏍稿锛屽彧鏈夊叧閿枒鐐硅瑙ｉ噴娓呮鍚庡啀鑰冭檻缁х画銆?;
  } else if (score >= 30) {
    verdict = '椋庨櫓鍋忛珮锛屽綋鍓嶆洿鍍忛渶瑕佸己楠岃瘉鐨勭洰鏍囥€?;
    confidence = '涓?;
    recommendation = '浼樺厛鎶婂畠褰撻珮椋庨櫓鏍囩殑澶勭悊锛岄櫎闈炲嚭鐜版洿纭殑璇佹嵁銆?;
  } else {
    verdict = '楂橀闄?楂樺櫔闊充俊鍙锋槑鏄撅紝鍏堜笉瑕佽交淇°€?;
    confidence = '楂?;
    recommendation = '鐜板湪鏇村儚璇ョ洿鎺ラ伩寮€锛岃€屼笉鏄户缁姇鍏ユ椂闂村拰閽便€?;
  }

  if (greenFlags.length === 0) {
    greenFlags.push('鐩墠娌℃湁鐪嬪埌瓒冲寮虹殑姝ｅ悜淇″彿銆?);
  }

  if (redFlags.length === 0) {
    redFlags.push('鐩墠娌℃湁鍙戠幇鐗瑰埆鏄庢樉鐨勭孩鏃楋紝浣嗕粛闇€琛ラ獙璇併€?);
  }

  if (nextChecks.length === 0) {
    nextChecks.push('缁х画鏍稿鍥㈤槦銆佹枃妗ｃ€佷环鏍笺€佺湡瀹炵敤鎴峰弽棣堛€?);
  }

  const summary = `${verdict} 褰撳墠椋庨櫓甯︿负 ${getRiskBand(score)}锛屾渶閲嶈鐨勬槸鍏堢‘璁ゅ叕寮€鏉愭枡涓庣湡瀹炰娇鐢ㄦ儏鍐垫槸鍚︿竴鑷淬€俙;

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
  resultContainer.innerHTML = '鍒嗘瀽涓?..';

  const payload = Object.fromEntries(new FormData(form).entries());
  const data = analyzeNanaCheck(payload);

  resultContainer.innerHTML = `
    <section class="result-block hero">
      <h3>${data.target.name || '鏈懡鍚嶇洰鏍?}</h3>
      <p><strong>缁撹锛?/strong>${data.verdict}</p>
      <p><strong>缃俊搴︼細</strong>${data.confidence}</p>
      <p><strong>椋庨櫓鍒嗭細</strong>${data.score}/100</p>
      <p><strong>椋庨櫓甯︼細</strong>${data.riskBand}</p>
      <p><strong>鎽樿锛?/strong>${data.summary}</p>
      <p><strong>寤鸿锛?/strong>${data.recommendation}</p>
    </section>
    ${renderList('姝ｅ悜淇″彿', data.greenFlags)}
    ${renderList('椋庨櫓淇″彿', data.redFlags)}
    ${renderList('涓嬩竴姝ユ牳瀵?, data.nextChecks)}
  `;

  resultCard.hidden = false;
});

renderExamples();
