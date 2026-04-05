const { spawn } = require('child_process');
const http = require('http');
const PORT = 3027;

function request(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/nana-check',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const server = spawn(process.execPath, ['server.js'], {
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT) },
  });

  try {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const response = await request({
      name: 'Example Agent Tool',
      url: 'https://example.com/docs',
      category: 'tool',
      focus: 'It claims guaranteed profit with AI agent automation.',
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.body.verdict || !Array.isArray(response.body.redFlags)) {
      throw new Error('Response shape is invalid');
    }

    if (!response.body.summary || !response.body.recommendation || !response.body.riskBand) {
      throw new Error('Enhanced response fields missing');
    }

    console.log('Nana Check test passed');
  } finally {
    server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
