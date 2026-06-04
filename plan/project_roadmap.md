# プロジェクト計画: AI-Driven Schema Generator

**V1 定義:** [v1_release.md](./v1_release.md)

## 1. 目的

ユーザーの漠然としたアイデアや表題から、最小構成のデータベーススキーマ（SQL & Prisma）を自動生成する。

**V1** では、それを **Web 画面から完結** させることをリリース目標とする。

---

## 2. 要件定義 (@Definition)

### [要件] — バージョン別

| 要件 | V1 | V2以降 |
|------|----|--------|
| AI によるスキーマ推論（テキスト → SQL / Prisma） | ○ | ○ |
| Web 画面からの要望入力・ファイル取得 | ○ | ○ |
| マルチフォーマット出力（.sql, .prisma） | ○ | ○ |
| 最小構成・拡張性のあるスキーマ | ○ | ○ |
| **既存スキーマのリバースエンジニアリング** | — | ○ |
| **ER 図（Mermaid / `ER_diagram.md`）** | — | ○ |
| 修正依頼による再生成 | — | 将来 |
| TypeORM / Drizzle 等の追加出力 | — | 将来 |

### [詳細な要件内容] — V1

1. **入力**
   - Web 画面からの要望テキスト（[ui_requirements.md](./ui_requirements.md)）
2. **プロセス**
   - AI によるエンティティ・リレーション推論
   - `POST /generate` 経由の生成
3. **出力**
   - `schema.sql`（DDL）
   - `schema.prisma`
4. **取得**
   - 画面プレビュー + 個別ダウンロード（ZIP は任意）

### [詳細な要件内容] — V2 以降（V1 では実装しない）

1. **入力**: 既存 `.sql` / `.prisma` ファイルのアップロード
2. **プロセス**: パース → 中間 JSON → Mermaid ER 図
3. **出力**: `ER_diagram.md`、UI 上の ER プレビュー

---

## 3. 開発フェーズ（リリース単位）

### V1: Web UI リリース（最優先）

- [x] API スキーマ生成（`POST /generate`）
- [x] Web UI: 要望入力・生成・プレビュー・ダウンロード
- [x] 静的配信・README
- [ ] V1 受け入れ条件の実機確認

詳細: [v1_release.md](./v1_release.md), [2026-06-05_development_plan.md](./2026-06-05_development_plan.md)

### V2: リバースエンジニアリングと可視化（後回し）

- 既存 SQL / Prisma の解析
- `ER_diagram.md` 生成
- UI へのアップロード・ER 表示の統合

### V3: 堅牢化と拡張

- ディレクトリ構造の整理、バリデーション強化
- 修正再生成、追加出力フォーマット

---

## 4. 次のステップ（V1）

1. @Structural — V1 向け API / `public/` 設計
2. @Speed — V1 UI 実装
3. @Realistic — [v1_release.md](./v1_release.md) の受け入れ条件確認

---

## 5. 計画ドキュメント一覧

| ファイル | 内容 |
|----------|------|
| [v1_release.md](./v1_release.md) | **V1 スコープ・受け入れ条件（正）** |
| [v2_requirements.md](./v2_requirements.md) | **V2 要件定義・スコープ** |
| [ui_requirements.md](./ui_requirements.md) | Web UI 要件（V1 確定版） |

| [2026-06-05_development_plan.md](./2026-06-05_development_plan.md) | 開発タスク・V1/V2 分割 |
| [2026-06-04_future_plan.md](./2026-06-04_future_plan.md) | 初版計画（履歴・注記付き） |
| [system_design.md](./system_design.md) | システム設計（V2 以降の parser 等を含む全体像） |
| [v1_implementation_design.md](./v1_implementation_design.md) | V1 実装設計・API 契約 |
