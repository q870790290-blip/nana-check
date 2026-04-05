const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { analyzeNanaCheck } = require('./analysis');

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
