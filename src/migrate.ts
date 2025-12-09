import pool from './db.js';

const migrate = async () => {
  const client = await pool.connect();
  
  try {
    console.log('マイグレーション開始...');
    
    // contactsテーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // indexの作成
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
    `);
    
    console.log('マイグレーション完了！');
    console.log('テーブル: contacts (id, name, phone, created_at, updated_at)');
    
  } catch (error) {
    console.error('マイグレーションエラー:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(console.error);
