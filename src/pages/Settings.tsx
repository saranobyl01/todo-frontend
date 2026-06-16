import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Send, Save, Loader2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [chatId, setChatId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/user_telegram`);
      if (data && data.length > 0) {
        setChatId(data[0].telegram_chat_id);
        setIsActive(data[0].is_active);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Check if exists
      const existing = await fetchApi(`/user_telegram`);
      
      if (existing && existing.length > 0) {
        // Update
        await fetchApi(`/user_telegram`, {
          method: 'PATCH',
          body: JSON.stringify({ telegram_chat_id: chatId, is_active: isActive })
        });
      } else {
        // Insert
        await fetchApi(`/user_telegram`, {
          method: 'POST',
          body: JSON.stringify({ user_id: user?.id, telegram_chat_id: chatId, is_active: isActive })
        });
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your Telegram notifications and preferences.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-800/20">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Send size={24} />
            <h2 className="text-xl font-semibold">Telegram Integration</h2>
          </div>
          <p className="text-sm text-slate-400">
            Connect your Telegram account to receive task reminders directly as messages.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-primary-500" />
              How to get your Chat ID
            </h3>
            <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
              <li>Open Telegram and search for <strong>@BotFather</strong></li>
              <li>Create a new bot or get your existing bot's token.</li>
              <li>Search for your bot username in Telegram and send it a message (e.g., "/start").</li>
              <li>Visit <code className="bg-slate-800 px-1 rounded text-primary-400">https://api.telegram.org/bot&lt;YourBotToken&gt;/getUpdates</code> in your browser.</li>
              <li>Look for the <code className="bg-slate-800 px-1 rounded text-primary-400">"chat": {"{"}"id": 123456789{"}"}</code> field in the response and copy the number.</li>
            </ol>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                required
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-primary-500 focus:ring-primary-500 bg-slate-900"
              />
              <span className="text-slate-300 font-medium">Enable notifications globally</span>
            </label>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-success-500/10 text-success-500 border-success-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
