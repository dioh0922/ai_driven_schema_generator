import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runInverterTests() {
  console.log('--- 💣 @Inverter Final Robustness Test ---');

  // 1. ババリデーションの限界テスト
  console.log('\n[Test 1] Validation Boundary (2001 chars)...');
  try {
    const tooLongPrompt = 'A'.repeat(2001);
    await axios.post(`${BASE_URL}/generate`, { prompt: tooLongPrompt });
    console.log('🚨 FAIL: 2001 chars accepted!');
  } catch (e: any) {
    console.log('OK: Rejected with status', e.response?.status, e.response?.data?.message || e.response?.data?.error);
  }

  // 2. ディレクトリトラバーサルの再試行
  console.log('\n[Test 2] Traversal Attack (Injection into path)...');
  const attackPaths = [
    '..%2f..%2fpackage.json',
    '../../package.json',
    'styles.css/../../package.json'
  ];
  for (const p of attackPaths) {
    try {
      const res = await axios.get(`${BASE_URL}/${p}`);
      console.log(`🚨 FAIL: Accessed ${p}! Data length:`, res.data.length);
    } catch (e: any) {
      console.log(`OK: Access to ${p} failed with status`, e.response?.status);
    }
  }

  // 3. 並列実行によるディレクトリ分離テスト
  console.log('\n[Test 3] Parallel Collision Test (10 simultaneous requests)...');
  const prompts = Array.from({ length: 10 }, (_, i) => `Table_${i}`);
  
  const results = await Promise.allSettled(
    prompts.map(p => axios.post(`${BASE_URL}/generate`, { prompt: p }))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Results: ${succeeded}/${prompts.length} succeeded.`);
  
  if (succeeded > 1) {
    console.log('Note: Check output/ directory to ensure separate folders exist.');
  }

  // 4. 不正なボディ形式
  console.log('\n[Test 4] Junk Body Format...');
  try {
    await axios.post(`${BASE_URL}/generate`, { some_other_key: 'junk' });
    console.log('🚨 FAIL: Junk body accepted!');
  } catch (e: any) {
    console.log('OK: Rejected junk body with status', e.response?.status);
  }

  console.log('\n--- 💣 Inverter Test Completed ---');
}

runInverterTests();
