const promptEl = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');
const resultSection = document.getElementById('resultSection');
const previewSql = document.getElementById('previewSql');
const previewPrisma = document.getElementById('previewPrisma');
const downloadSql = document.getElementById('downloadSql');
const downloadPrisma = document.getElementById('downloadPrisma');
const tabs = document.querySelectorAll('.tab');

/** @type {Map<string, string>} */
let fileContents = new Map();

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function setLoading(loading) {
  generateBtn.disabled = loading;
  promptEl.disabled = loading;
  if (loading) {
    setStatus('生成中です。数十秒かかる場合があります…', 'loading');
  }
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function showTab(name) {
  const isSql = name === 'sql';
  previewSql.classList.toggle('hidden', !isSql);
  previewSql.classList.toggle('active', isSql);
  previewPrisma.classList.toggle('hidden', isSql);
  previewPrisma.classList.toggle('active', !isSql);

  tabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

function renderResults(files) {
  fileContents = new Map(files.map((f) => [f.name, f.content]));

  const sql = fileContents.get('schema.sql') ?? '';
  const prisma = fileContents.get('schema.prisma') ?? '';

  previewSql.textContent = sql;
  previewPrisma.textContent = prisma;

  downloadSql.disabled = !sql;
  downloadPrisma.disabled = !prisma;

  resultSection.classList.remove('hidden');
  showTab('sql');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
});

downloadSql.addEventListener('click', () => {
  const content = fileContents.get('schema.sql');
  if (content) downloadFile('schema.sql', content);
});

downloadPrisma.addEventListener('click', () => {
  const content = fileContents.get('schema.prisma');
  if (content) downloadFile('schema.prisma', content);
});

generateBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();

  if (!prompt) {
    setStatus('要望テキストを入力してください。', 'error');
    resultSection.classList.add('hidden');
    return;
  }

  setLoading(true);
  resultSection.classList.add('hidden');

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? 'スキーマの生成に失敗しました。');
    }

    renderResults(data.files ?? []);
    setStatus(data.message ?? '生成が完了しました。', 'success');
  } catch (err) {
    setStatus(err instanceof Error ? err.message : '通信エラーが発生しました。', 'error');
  } finally {
    setLoading(false);
  }
});
