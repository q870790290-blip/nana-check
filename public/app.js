const form = document.getElementById('check-form');
const resultCard = document.getElementById('result-card');
const resultContainer = document.getElementById('result');

function renderList(title, items) {
  return `
    <section class="result-block">
      <h3>${title}</h3>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    </section>
  `;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  resultCard.hidden = true;
  resultContainer.innerHTML = '鍒嗘瀽涓?..';

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch('/api/nana-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    resultContainer.innerHTML = `<p class="error">${data.error || '璇锋眰澶辫触'}</p>`;
    resultCard.hidden = false;
    return;
  }

  resultContainer.innerHTML = `
    <section class="result-block hero">
      <h3>${data.target.name || '鏈懡鍚嶇洰鏍?}</h3>
      <p><strong>缁撹锛?/strong>${data.verdict}</p>
      <p><strong>缃俊搴︼細</strong>${data.confidence}</p>
      <p><strong>椋庨櫓鍒嗭細</strong>${data.score}/100</p>
    </section>
    ${renderList('姝ｅ悜淇″彿', data.greenFlags)}
    ${renderList('椋庨櫓淇″彿', data.redFlags)}
    ${renderList('涓嬩竴姝ユ牳瀵?, data.nextChecks)}
  `;

  resultCard.hidden = false;
});
