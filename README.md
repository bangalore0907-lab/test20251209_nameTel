# 電話帳アプリケーション

## プロジェクト概要
- **名前**: webapp (電話帳アプリ)
- **目的**: 名前と電話番号を管理するシンプルな電話帳Webアプリケーション
- **主な機能**: 
  - 連絡先の一覧表示
  - 連絡先の新規登録
  - 連絡先の編集
  - 連絡先の削除

## 技術スタック
- **バックエンド**: Hono (TypeScript)
- **データベース**: PostgreSQL (test20251209)
- **フロントエンド**: HTML + TailwindCSS + Axios
- **デプロイ**: Render対応

## データ構造
### contactsテーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | SERIAL | 主キー |
| name | VARCHAR(255) | 名前 |
| phone | VARCHAR(20) | 電話番号 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

## APIエンドポイント
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | 一覧画面 |
| GET | `/new` | 新規登録画面 |
| GET | `/edit/:id` | 編集画面 |
| GET | `/api/contacts` | 連絡先一覧取得 |
| GET | `/api/contacts/:id` | 連絡先詳細取得 |
| POST | `/api/contacts` | 連絡先新規登録 |
| PUT | `/api/contacts/:id` | 連絡先更新 |
| DELETE | `/api/contacts/:id` | 連絡先削除 |

## ローカル開発環境セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. データベース設定
PostgreSQLデータベース `test20251209` を作成し、`.env`ファイルに接続情報を設定：

```bash
cp .env.example .env
# .envファイルを編集してDATABASE_URLを設定
```

### 3. マイグレーション実行
```bash
npm run build
npm run db:migrate
```

### 4. 開発サーバー起動
```bash
npm run dev
# または
pm2 start ecosystem.config.cjs
```

アプリケーションは http://localhost:3000 で起動します。

## Renderへのデプロイ

### 1. GitHubリポジトリに接続
このプロジェクトをGitHubリポジトリにプッシュします。

### 2. Renderでデータベース作成
Renderダッシュボードで：
- New PostgreSQLデータベースを作成
- データベース名: `test20251209`
- 接続情報を取得

### 3. Renderで新しいWebサービス作成
- GitHubリポジトリを選択
- `render.yaml`が自動検出されます
- 環境変数`DATABASE_URL`はデータベースから自動設定されます

### 4. デプロイ後の初期化
デプロイ後、Renderのシェルでマイグレーションを実行：
```bash
npm run db:migrate
```

## 開発状況
### ✅ 完了している機能
- 連絡先一覧表示（削除機能付き）
- 連絡先新規登録
- 連絡先編集
- PostgreSQL接続とデータ永続化
- Render対応設定

### 📋 今後の改善案
- バリデーション強化
- 検索機能
- ページネーション
- エクスポート/インポート機能
- 認証機能の追加

## プロジェクト構造
```
webapp/
├── src/
│   ├── index.ts        # メインアプリケーション（Hono + API + 画面）
│   ├── db.ts           # PostgreSQL接続設定
│   └── migrate.ts      # データベースマイグレーション
├── dist/               # ビルド出力（自動生成）
├── .env.example        # 環境変数テンプレート
├── .gitignore          # Git除外設定
├── ecosystem.config.cjs # PM2設定（開発環境）
├── package.json        # 依存関係とスクリプト
├── render.yaml         # Renderデプロイ設定
├── tsconfig.json       # TypeScript設定
└── README.md           # このファイル
```

## 使い方
1. **一覧画面**: すべての連絡先を表示。「新規登録」ボタンで登録画面へ。
2. **新規登録**: 名前と電話番号を入力して「登録」ボタンをクリック。
3. **編集**: 一覧画面の「編集」リンクから編集画面へ。内容を変更して「更新」ボタンをクリック。
4. **削除**: 一覧画面の「削除」ボタンをクリック（確認ダイアログが表示されます）。

## ライセンス
MIT

## 最終更新日
2025-12-09
