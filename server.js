const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3017;
const publicDir = path.join(__dirname, 'public');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeText(value) {
  return String(value || '').trim();
}

function hasKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
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

  score = Math.max(5, Math.min(95, score));

  let verdict = '淇℃伅涓嶈冻锛屽厛琛ユ潗鏂欏啀鍒ゆ柇銆?;
  let confidence = '浣?;

  if (score >= 70) {
    verdict = '鍒濇鐪嬬浉瀵规甯革紝浣嗚繕闇€瑕佸仛鏇存繁楠岃瘉銆?;
    confidence = '涓?;
  } else if (score >= 50) {
    verdict = '淇″彿娣峰悎锛屽缓璁皑鎱庯紝涓嶈鐩存帴鎶曞叆銆?;
    confidence = '涓?;
  } else if (score >= 30) {
    verdict = '椋庨櫓鍋忛珮锛屽綋鍓嶆洿鍍忛渶瑕佸己楠岃瘉鐨勭洰鏍囥€?;
    confidence = '涓?;
  } else {
    verdict = '楂橀闄?楂樺櫔闊充俊鍙锋槑鏄撅紝鍏堜笉瑕佽交淇°€?;
    confidence = '楂?;
  }

  if (greenFlags.length === 0) {
    greenFlags.push('鐩墠娌℃湁鐪嬪埌瓒冲寮虹殑姝ｅ悜淇″彿銆?);
  }

  if (nextChecks.length === 0) {
    nextChecks.push('缁х画鏍稿鍥㈤槦銆佹枃妗ｃ€佷环鏍笺€佺湡瀹炵敤鎴峰弽棣堛€?);
  }

  return {
    target: {
      name,
      url: targetUrl,
      category,
      focus,
    },
    verdict,
    confidence,
    score,
    greenFlags,
    redFlags,
    nextChecks,
    generatedAt: new Date().toISOString(),
  };
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && requestUrl.pathname === '/') {
    sendFile(res, path.join(publicDir, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/app.js') {
    sendFile(res, path.join(publicDir, 'app.js'), 'text/javascript; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/styles.css') {
    sendFile(res, path.join(publicDir, 'styles.css'), 'text/css; charset=utf-8');
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/nana-check') {
    try {
      const body = await parseBody(req);
      const result = analyzeNanaCheck(body);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Nana Check running at http://127.0.0.1:${PORT}`);
});
