import { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  is_completed: boolean;
  frequency: string | null;
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await fetchApi('/todos?select=*&order=due_date.asc.nullslast');
      setTodos(data || []);
    } catch (err) {
      console.error('Failed to load todos', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      await fetchApi(`/todos?id=eq.${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !todo.is_completed })
      });
      loadTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const todayTodos = todos.filter(t => !t.is_completed && t.due_date && isToday(parseISO(t.due_date)));
  const upcomingTodos = todos.filter(t => !t.is_completed && t.due_date && isFuture(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).slice(0, 5);

  if (loading) return <div className="text-slate-400">Loading dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Good morning! 👋</h1>
        <p className="text-slate-400">Here's what's happening with your tasks today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
            <Calendar className="text-primary-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Due Today</p>
            <p className="text-2xl font-bold text-white">{todayTodos.length}</p>
          </div>
        </div>
        
        <div className="bg-surface p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-success-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-success-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-white">{todos.filter(t => t.is_completed).length}</p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Clock className="text-purple-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{todos.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="bg-surface rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Today's Tasks</h2>
          </div>
          <div className="p-4 space-y-2">
            {todayTodos.length === 0 ? (
              <p className="text-slate-400 text-sm p-4 text-center">No tasks due today. Enjoy your day!</p>
            ) : (
              todayTodos.map(todo => (
                <div key={todo.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors group">
                  <button onClick={() => toggleComplete(todo)} className="mt-1 text-slate-400 hover:text-success-500">
                    <Circle size={20} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{todo.title}</h3>
                    {todo.description && <p className="text-sm text-slate-400 line-clamp-1">{todo.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-surface rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Upcoming</h2>
          </div>
          <div className="p-4 space-y-2">
            {upcomingTodos.length === 0 ? (
              <p className="text-slate-400 text-sm p-4 text-center">No upcoming tasks.</p>
            ) : (
              upcomingTodos.map(todo => (
                <div key={todo.id} className="flex items-start justify-between p-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                     <div>
                      <h3 className="text-white font-medium">{todo.title}</h3>
                      <p className="text-sm text-slate-400">
                        {todo.due_date ? format(parseISO(todo.due_date), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                  {todo.frequency && (
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {todo.frequency === 'Minute' ? 'Every Minute' : todo.frequency === 'Hour' ? 'Every Hour' : todo.frequency}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
