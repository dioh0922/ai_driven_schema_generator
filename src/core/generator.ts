import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { GenerateSuccessResponse, SchemaFile } from '../types/schema.js';

const OUTPUT_ROOT = path.join(process.cwd(), 'output');

const AI_PROMPT_TEMPLATE = (prompt: string) => `
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
`.trim();

export function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function getModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview';
}

export async function generateSchema(prompt: string): Promise<GenerateSuccessResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません。');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getModelName();
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(AI_PROMPT_TEMPLATE(prompt));
  const text = result.response.text();
  const parts = text.split('---').map((s) => s.trim());

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(
      'AI の応答形式が不正です。SQL と Prisma が "---" で区切られている必要があります。'
    );
  }

  const files: SchemaFile[] = [
    { name: 'schema.sql', content: parts[0] },
    { name: 'schema.prisma', content: parts[1] },
  ];

  // @Speed: 並列アクセス対策としてリクエストごとに一意識別子でディレクトリを分ける
  const requestId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const requestDir = path.join(OUTPUT_ROOT, requestId);

  await fs.mkdir(requestDir, { recursive: true });
  await Promise.all(
    files.map((file) => fs.writeFile(path.join(requestDir, file.name), file.content))
  );

  return {
    message: 'スキーマを生成しました',
    files,
  };
}
