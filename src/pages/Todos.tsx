import { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { format, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Clock, Bell, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  is_completed: boolean;
  frequency: string | null;
  telegram_enabled: boolean;
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('Once');
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  
  const user = useAuthStore(state => state.user);

  const loadTodos = async () => {
    try {
      const data = await fetchApi('/todos');
      setTodos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/todos', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id,
          title,
          description,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          frequency,
          telegram_enabled: telegramEnabled
        })
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      loadTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      await fetchApi(`/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !todo.is_completed })
      });
      loadTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetchApi(`/todos/${id}`, { method: 'DELETE' });
      loadTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Your Todos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Task Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-medium"
            />
          </div>
          <div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Once">Once</option>
                <option value="Minute">Every Minute</option>
                <option value="Hour">Every Hour</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-primary-500 focus:ring-primary-500 bg-slate-900"
              />
              <span className="text-slate-300">Enable Telegram Reminders</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl font-medium">Save Task</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 bg-surface p-1 rounded-xl w-fit border border-slate-800">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.map(todo => (
          <div key={todo.id} className={`bg-surface p-4 rounded-2xl border transition-all ${todo.is_completed ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-slate-600'}`}>
            <div className="flex items-start gap-4">
              <button onClick={() => toggleComplete(todo)} className="mt-1 flex-shrink-0">
                {todo.is_completed ? (
                  <CheckCircle2 className="text-success-500" size={24} />
                ) : (
                  <Circle className="text-slate-400 hover:text-primary-500" size={24} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-medium truncate ${todo.is_completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-slate-400 mt-1 text-sm">{todo.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {todo.due_date && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                      <Clock size={14} />
                      {format(parseISO(todo.due_date), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                  {todo.frequency && todo.frequency !== 'Once' && (
                    <div className="flex items-center gap-1.5 text-xs text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20">
                      {todo.frequency === 'Minute' ? 'Every Minute' : todo.frequency === 'Hour' ? 'Every Hour' : todo.frequency}
                    </div>
                  )}
                  {todo.telegram_enabled && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      <Bell size={14} />
                      Reminders On
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => deleteTodo(todo.id)} className="text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400">No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
