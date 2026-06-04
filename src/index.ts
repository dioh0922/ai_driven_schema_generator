import Fastify from 'fastify';
import type { FastifyReply } from 'fastify';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { generateSchema, getApiKey } from './core/generator.js';
import type { ErrorResponse } from './types/schema.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

async function servePublic(filename: string, reply: FastifyReply) {
  const filePath = path.join(PUBLIC_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  const ext = path.extname(filename);
  return reply.type(MIME_TYPES[ext] ?? 'text/plain').send(content);
}

fastify.get('/api/health', async () => ({
  status: 'ok',
  apiKeyConfigured: Boolean(getApiKey()),
}));

fastify.post<{ Body: { prompt?: string } }>('/generate', async (request, reply) => {
  const prompt = request.body?.prompt?.trim();

  if (!prompt) {
    return reply.status(400).send({
      error: '要望テキストを入力してください。',
    } satisfies ErrorResponse);
  }

  if (!getApiKey()) {
    return reply.status(503).send({
      error: 'GEMINI_API_KEY が設定されていません。プロジェクトルートの .env を確認してください。',
    } satisfies ErrorResponse);
  }

  try {
    const result = await generateSchema(prompt);
    return result;
  } catch (error) {
    fastify.log.error(error);
    const message =
      error instanceof Error ? error.message : 'スキーマの生成に失敗しました。';
    return reply.status(500).send({ error: message } satisfies ErrorResponse);
  }
});

fastify.get('/', async (_request, reply) => servePublic('index.html', reply));
fastify.get('/styles.css', async (_request, reply) => servePublic('styles.css', reply));
fastify.get('/app.js', async (_request, reply) => servePublic('app.js', reply));

const start = async () => {
  if (!getApiKey()) {
    fastify.log.warn(
      'GEMINI_API_KEY が未設定です。生成 API は利用できません。.env.example を参照してください。'
    );
  }

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server: http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
