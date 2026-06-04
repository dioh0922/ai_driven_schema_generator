import Fastify from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const fastify = Fastify({ logger: true });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 出力ディレクトリの準備
const OUTPUT_DIR = path.join(process.cwd(), 'output');

fastify.post('/generate', async (request, reply) => {
  const { prompt } = request.body as { prompt: string };

  if (!prompt) {
    return reply.status(400).send({ error: 'Prompt is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const aiPrompt = `
      You are a specialized database architect. 
      Based on the following user requirement, generate a minimal but extensible database schema.
      
      Requirements:
      ${prompt}
      
      Output exactly in the following format, separated by "---":
      1. SQL DDL (PostgreSQL compatible)
      2. Prisma Schema (only the models)
      
      Example format:
      CREATE TABLE ...
      ---
      model ...
    `;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    const [sql, prisma] = text.split('---').map(s => s.trim());

    // ファイル保存
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(path.join(OUTPUT_DIR, 'schema.sql'), sql);
    await fs.writeFile(path.join(OUTPUT_DIR, 'schema.prisma'), prisma);

    return {
      message: 'Schema generated successfully',
      sql,
      prisma
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to generate schema' });
  }
});

fastify.get('/', async () => {
  return { message: 'AI-Driven Schema Generator Server is running!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
