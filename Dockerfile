# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# ポートを公開
EXPOSE 10000

# 環境変数
ENV NODE_ENV=production
ENV PORT=10000

# アプリケーション起動
CMD ["npm", "start"]
