# システム設計書: AI-Driven Schema Generator

> **V1 実装範囲:** [v1_release.md](./v1_release.md)  
> Parser / Visualizer（§4 B, C）は **V2 以降**。V1 は Generator + Web UI のみ。

## 1. 設計方針 (@Structural)
- **言語・環境**: Node.js (v20+) / TypeScript
- **アーキテクチャ**: クリーンアーキテクチャの考え方を取り入れ、コアロジック（スキーマ生成・解析）を外部インターフェース（CLI/API）から独立させる。
- **拡張性**: 新たな出力フォーマット（例: TypeORM, Drizzle）や可視化エンジンを容易に追加できるよう、プラグイン/ストラテジーパターンを採用する。

## 2. 技術スタック
- **Runtime**: Node.js
- **Language**: TypeScript (tsx で実行)
- **Server**: Fastify (高速かつスキーマ駆動開発に適しているため)
- **AI Integration**: OpenAI SDK / Google Generative AI SDK
- **Schema Parsing**:
  - SQL: `sql-ddl-to-json-schema` 等のライブラリ
  - Prisma: `@prisma/sdk` または `@prisma/internals`
- **Visualization**: Mermaid.js (CLI/Markdown出力用)

## 3. ディレクトリ構成
```text
.
├── plan/               # 開発計画書・設計書
├── src/
│   ├── index.ts        # サーバーエントリーポイント
│   ├── core/           # ビジネスロジック
│   │   ├── generator/  # スキーマ生成ロジック (AI連携)
│   │   ├── parser/     # 既存スキーマ解析ロジック
│   │   └── visualizer/ # ER図生成ロジック (Mermaid)
│   ├── interfaces/     # 外部との接点
│   │   ├── http/       # APIエンドポイント (Fastify)
│   │   └── cli/        # CLIコマンド (Commander.js)
│   ├── types/          # 共有型定義
│   └── utils/          # 共通ユーティリティ
├── output/             # 生成されたファイルの出力先
├── package.json
└── tsconfig.json
```

## 4. 主要コンポーネント設計

| コンポーネント | V1 | 説明 |
|----------------|----|------|
| **A. Generator** | ○ | 要望テキスト → AI → SQL / Prisma（現行 `POST /generate`） |
| **B. Parser** | — | 既存 SQL/Prisma → 中間 JSON（**V2・リバースエンジニアリング**） |
| **C. Visualizer** | — | 中間 JSON → Mermaid / `ER_diagram.md`（**V2**） |
| **D. Web UI** | ○ | `public/` 静的画面（**V1**） |

## 5. Web UI（追加設計・未実装）

要件: [ui_requirements.md](./ui_requirements.md)

```text
.
├── public/             # 静的 Web UI（要望入力・結果表示・DL）
│   ├── index.html
│   ├── app.js
│   └── styles.css
```

- 生成は既存 `POST /generate` を利用
- 初版は Fastify から `public/` を静的配信する構成を想定（別案: Vite dev サーバー）
- フロントは API キーを保持しない

## 6. 次のステップ

1. [x] サーバー基礎 + `POST /generate`
2. [ ] **V1:** Web UI + 静的配信 — [v1_release.md](./v1_release.md)
3. [ ] **V2:** Parser + Visualizer（リバースエンジニアリング・ER 図）
