# システム設計書: AI-Driven Schema Generator

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
### A. Generator Service
ユーザーの入力をAIに渡し、中間表現（JSON）としてスキーマ構造を受け取る。
### B. Parser Service
SQLやPrismaファイルを読み込み、Generatorと同じ中間表現（JSON）に変換する。
### C. Visualizer Service
中間表現（JSON）を元に、Mermaid形式のMarkdownテキストを生成する。

## 5. 次のステップ
1. `package.json` の作成と依存関係のインストール。
2. `tsconfig.json` の設定。
3. サーバーの基礎実装 (`src/index.ts`)。
