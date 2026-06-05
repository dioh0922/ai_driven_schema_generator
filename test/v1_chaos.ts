import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testV1() {
  console.log('--- 🚨 @Inverter Chaos Testing: V1 API ---');

  // 1. 空のプロンプト
  try {
    console.log('[Test 1] Empty prompt...');
    await axios.post(`${BASE_URL}/generate`, { prompt: '' });
  } catch (e: any) {
    console.log('Result:', e.response?.status, e.response?.data);
  }

  // 2. 超巨大なプロンプト (DoS/オーバーフローの懸念)
  try {
    console.log('[Test 2] Huge prompt (100,000 chars)...');
    const hugePrompt = 'A'.repeat(100000);
    await axios.post(`${BASE_URL}/generate`, { prompt: hugePrompt });
  } catch (e: any) {
    console.log('Result:', e.response?.status, e.response?.data);
  }

  // 3. 不正なJSON形式
  try {
    console.log('[Test 3] Malformed JSON...');
    await axios.post(`${BASE_URL}/generate`, 'not a json', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.log('Result:', e.response?.status, e.response?.data);
  }

  // 4. APIキーなし (サーバー側で .env を一時的に無効化できないため、現在の状態を確認)
  try {
    console.log('[Test 4] Health check...');
    const res = await axios.get(`${BASE_URL}/api/health`);
    console.log('Health:', res.data);
  } catch (e: any) {
    console.log('Result:', e.response?.status);
  }

  // 5. 存在しない静的ファイルへのアクセス (ディレクトリトラバーサル攻撃の試行)
  try {
    console.log('[Test 5] Directory Traversal attempt...');
    await axios.get(`${BASE_URL}/%2e%2e/%2e%2e/package.json`);
  } catch (e: any) {
    console.log('Result:', e.response?.status, ' (Status 404 is expected, but checking if it leaks anything)');
  }
}

testV1();
