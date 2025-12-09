import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';

const app = new Hono();

// モックデータ（開発用）
let contacts = [
  { id: 1, name: '山田 太郎', phone: '090-1234-5678', created_at: new Date(), updated_at: new Date() },
  { id: 2, name: '佐藤 花子', phone: '080-2345-6789', created_at: new Date(), updated_at: new Date() },
  { id: 3, name: '鈴木 一郎', phone: '070-3456-7890', created_at: new Date(), updated_at: new Date() },
];
let nextId = 4;

// CORS設定
app.use('*', cors());

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './' }));

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', mode: 'development', database: 'mock' });
});

// API: 電話帳一覧取得
app.get('/api/contacts', async (c) => {
  return c.json(contacts);
});

// API: 電話帳詳細取得
app.get('/api/contacts/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const contact = contacts.find(c => c.id === id);
  
  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404);
  }
  
  return c.json(contact);
});

// API: 電話帳新規登録
app.post('/api/contacts', async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone } = body;
    
    if (!name || !phone) {
      return c.json({ error: 'Name and phone are required' }, 400);
    }
    
    const newContact = {
      id: nextId++,
      name,
      phone,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    contacts.unshift(newContact);
    return c.json(newContact, 201);
  } catch (error) {
    console.error('Error creating contact:', error);
    return c.json({ error: 'Failed to create contact' }, 500);
  }
});

// API: 電話帳更新
app.put('/api/contacts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { name, phone } = body;
    
    if (!name || !phone) {
      return c.json({ error: 'Name and phone are required' }, 400);
    }
    
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Contact not found' }, 404);
    }
    
    contacts[index] = {
      ...contacts[index],
      name,
      phone,
      updated_at: new Date()
    };
    
    return c.json(contacts[index]);
  } catch (error) {
    console.error('Error updating contact:', error);
    return c.json({ error: 'Failed to update contact' }, 500);
  }
});

// API: 電話帳削除
app.delete('/api/contacts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Contact not found' }, 404);
    }
    
    contacts.splice(index, 1);
    return c.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return c.json({ error: 'Failed to delete contact' }, 500);
  }
});

// ルートページ - 一覧画面
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>電話帳アプリ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-address-book mr-2"></i>
                        電話帳
                    </h1>
                    <a href="/new" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center">
                        <i class="fas fa-plus mr-2"></i>
                        新規登録
                    </a>
                </div>
                
                <div id="loading" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-2">読み込み中...</p>
                </div>
                
                <div id="contacts-list" class="hidden">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody id="contacts-tbody" class="bg-white divide-y divide-gray-200">
                        </tbody>
                    </table>
                    
                    <div id="empty-message" class="hidden text-center py-8 text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>登録されている連絡先がありません</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = window.location.origin + '/api';
            
            // 連絡先一覧を読み込む
            async function loadContacts() {
                try {
                    const response = await axios.get(API_BASE + '/contacts');
                    const contacts = response.data;
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('contacts-list').classList.remove('hidden');
                    
                    const tbody = document.getElementById('contacts-tbody');
                    tbody.innerHTML = '';
                    
                    if (contacts.length === 0) {
                        document.getElementById('empty-message').classList.remove('hidden');
                        return;
                    }
                    
                    contacts.forEach(contact => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = \`
                            <td class="px-4 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">\${escapeHtml(contact.name)}</div>
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">\${escapeHtml(contact.phone)}</div>
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap text-center">
                                <a href="/edit/\${contact.id}" class="text-blue-600 hover:text-blue-900 mr-3">
                                    <i class="fas fa-edit"></i> 編集
                                </a>
                                <button onclick="deleteContact(\${contact.id})" class="text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash"></i> 削除
                                </button>
                            </td>
                        \`;
                        tbody.appendChild(tr);
                    });
                } catch (error) {
                    console.error('Error loading contacts:', error);
                    document.getElementById('loading').innerHTML = \`
                        <div class="text-red-600">
                            <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                            <p>データの読み込みに失敗しました</p>
                        </div>
                    \`;
                }
            }
            
            // 連絡先を削除
            async function deleteContact(id) {
                if (!confirm('この連絡先を削除してもよろしいですか？')) {
                    return;
                }
                
                try {
                    await axios.delete(API_BASE + '/contacts/' + id);
                    loadContacts();
                } catch (error) {
                    console.error('Error deleting contact:', error);
                    alert('削除に失敗しました');
                }
            }
            
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            
            // 初期読み込み
            loadContacts();
        </script>
    </body>
    </html>
  `);
});

// 新規登録画面
app.get('/new', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新規登録 - 電話帳アプリ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8 max-w-2xl">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="mb-6">
                    <a href="/" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-arrow-left mr-2"></i>
                        一覧に戻る
                    </a>
                </div>
                
                <h1 class="text-3xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-user-plus mr-2"></i>
                    新規登録
                </h1>
                
                <form id="contact-form" class="space-y-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                            名前 <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="山田 太郎"
                        >
                    </div>
                    
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                            電話番号 <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="090-1234-5678"
                        >
                    </div>
                    
                    <div class="flex gap-4">
                        <button 
                            type="submit" 
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            <i class="fas fa-save mr-2"></i>
                            登録
                        </button>
                        <a 
                            href="/" 
                            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium text-center"
                        >
                            <i class="fas fa-times mr-2"></i>
                            キャンセル
                        </a>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = window.location.origin + '/api';
            
            document.getElementById('contact-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    phone: formData.get('phone')
                };
                
                try {
                    await axios.post(API_BASE + '/contacts', data);
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error creating contact:', error);
                    alert('登録に失敗しました');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// 編集画面
app.get('/edit/:id', async (c) => {
  const id = c.req.param('id');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>編集 - 電話帳アプリ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8 max-w-2xl">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="mb-6">
                    <a href="/" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-arrow-left mr-2"></i>
                        一覧に戻る
                    </a>
                </div>
                
                <div id="loading" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p class="text-gray-600 mt-2">読み込み中...</p>
                </div>
                
                <div id="edit-form-container" class="hidden">
                    <h1 class="text-3xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-edit mr-2"></i>
                        編集
                    </h1>
                    
                    <form id="contact-form" class="space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                名前 <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                        </div>
                        
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                                電話番号 <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                        </div>
                        
                        <div class="flex gap-4">
                            <button 
                                type="submit" 
                                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                <i class="fas fa-save mr-2"></i>
                                更新
                            </button>
                            <a 
                                href="/" 
                                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium text-center"
                            >
                                <i class="fas fa-times mr-2"></i>
                                キャンセル
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = window.location.origin + '/api';
            const contactId = ${id};
            
            // 連絡先データを読み込む
            async function loadContact() {
                try {
                    const response = await axios.get(API_BASE + '/contacts/' + contactId);
                    const contact = response.data;
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('edit-form-container').classList.remove('hidden');
                    
                    document.getElementById('name').value = contact.name;
                    document.getElementById('phone').value = contact.phone;
                } catch (error) {
                    console.error('Error loading contact:', error);
                    document.getElementById('loading').innerHTML = \`
                        <div class="text-red-600">
                            <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                            <p>データの読み込みに失敗しました</p>
                        </div>
                    \`;
                }
            }
            
            // フォーム送信
            document.getElementById('contact-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    phone: formData.get('phone')
                };
                
                try {
                    await axios.put(API_BASE + '/contacts/' + contactId, data);
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error updating contact:', error);
                    alert('更新に失敗しました');
                }
            });
            
            // 初期読み込み
            loadContact();
        </script>
    </body>
    </html>
  `);
});

// サーバー起動
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Development Server is running on http://0.0.0.0:${port}`);
console.log(`📊 Database: Mock (In-Memory)`);
console.log(`📝 Mode: Development`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
