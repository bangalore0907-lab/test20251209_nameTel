# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# package.jsonをコピー
COPY package*.json ./

# 全ての依存関係をインストール（ビルドに必要）
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 本番ステージ
FROM node:20-alpine

WORKDIR /app

# package.jsonをコピー
COPY package*.json ./

# 本番用の依存関係のみインストール
RUN npm ci --only=production

# ビルド済みファイルをコピー
COPY --from=builder /app/dist ./dist

# ポートを公開
EXPOSE 10000

# 環境変数
ENV NODE_ENV=production
ENV PORT=10000

# アプリケーション起動
CMD ["npm", "start"]
