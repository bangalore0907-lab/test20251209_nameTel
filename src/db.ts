import pg from 'pg';
const { Pool } = pg;

// PostgreSQL接続設定
// Renderの環境変数DATABASE_URLを使用（ローカルでは.envファイルから読み込み）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/test20251209',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 接続テスト
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export default pool;
