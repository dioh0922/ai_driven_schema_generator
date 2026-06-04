# AI-Driven Schema Generator

要望テキストからデータベーススキーマ（SQL / Prisma）を AI で生成する Web アプリ（V1）。

## 必要環境

- Node.js 20+
- [Google AI Studio](https://aistudio.google.com/) の API キー

## セットアップ

```bash
cp .env.example .env
# .env に GEMINI_API_KEY を設定

npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## 使い方（V1）

1. 画面に要望・概要を入力（例: 「ブログ。記事・ユーザー・コメント」）
2. **生成する** をクリック
3. SQL / Prisma タブで内容を確認
4. **ダウンロード** で `schema.sql` / `schema.prisma` を保存

生成ファイルは `output/` にも保存されます。

## API

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/` | Web UI |
| GET | `/api/health` | 稼働確認・API キー設定有無 |
| POST | `/generate` | スキーマ生成 `{ "prompt": "..." }` |

### レスポンス例

```json
{
  "message": "スキーマを生成しました",
  "files": [
    { "name": "schema.sql", "content": "..." },
    { "name": "schema.prisma", "content": "..." }
  ]
}
```

## ディレクトリ構成（V1）

```text
public/          # Web UI（HTML / CSS / JS）
src/
  index.ts       # HTTP サーバー・静的配信
  core/
    generator.ts # AI 生成ロジック
  types/
    schema.ts    # API 型
output/          # 生成ファイル出力先
plan/            # 要件・設計ドキュメント
```

## 計画ドキュメント

- [plan/v1_release.md](plan/v1_release.md) — V1 スコープ
- [plan/ui_requirements.md](plan/ui_requirements.md) — UI 要件

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー（tsx watch） |
| `npm run build` | TypeScript ビルド |
| `npm start` | ビルド後の本番起動 |

## V2 以降（未実装）

- 既存 SQL / Prisma のリバースエンジニアリング
- ER 図（Mermaid）の生成・表示
