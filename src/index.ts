import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { generateSchema, getApiKey } from './core/generator.js';
import type { ErrorResponse } from './types/schema.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PORT = Number(process.env.PORT) || 3000;

// @Speed: 本来は @fastify/static を使うべきだが、インストールの制約があるため
// 自前実装を最小限の修正で安全にする
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

async function servePublic(filename: string, reply: any) {
  // 安全のため basename のみを使用し、ディレクトリトラバーサルを防止
  const safeName = path.basename(filename);
  const filePath = path.join(PUBLIC_DIR, safeName);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(safeName);
    return reply.type(MIME_TYPES[ext] ?? 'text/plain').send(content);
  } catch {
    return reply.status(404).send('Not Found');
  }
}

fastify.get('/api/health', async () => ({
  status: 'ok',
  apiKeyConfigured: Boolean(getApiKey()),
}));

// @Speed: 2000文字制限のスキーマを定義 (Inverter対策)
const generateSchemaConfig = {
  schema: {
    body: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string', minLength: 1, maxLength: 2000 }
      }
    }
  }
};

fastify.post<{ Body: { prompt: string } }>('/generate', generateSchemaConfig, async (request, reply) => {
  const { prompt } = request.body;

  if (!getApiKey()) {
    return reply.status(503).send({
      error: 'GEMINI_API_KEY が設定されていません。',
    } satisfies ErrorResponse);
  }

  try {
    const result = await generateSchema(prompt);
    return result;
  } catch (error) {
    fastify.log.error(error);
    const message = error instanceof Error ? error.message : '失敗しました。';
    return reply.status(500).send({ error: message } satisfies ErrorResponse);
  }
});

fastify.get('/', async (_, reply) => servePublic('index.html', reply));
fastify.get('/styles.css', async (_, reply) => servePublic('styles.css', reply));
fastify.get('/app.js', async (_, reply) => servePublic('app.js', reply));

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server: http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
