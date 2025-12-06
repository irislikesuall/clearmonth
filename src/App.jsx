import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  LogOut, 
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  AlignLeft,
  Globe,
  FileText,
  Palette,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Mail,
  Lock
} from 'lucide-react';

// ==========================================
// ✅ 您的 Supabase 配置 (增加了去空格处理，防止复制错误)
// ==========================================
const supabaseUrl = 'https://fdfroxjrihytarwrjxqz.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZnJveGpyaWh5dGFyd3JqeHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzQ3NjUsImV4cCI6MjA4MDYxMDc2NX0.BDO7AVetY5WruNfyPtY2id0zexqGxCyCoH6B-ku047Y';

// 🛡️ 安全初始化 Supabase
let supabase = null;
let initError = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    // 使用 trim() 去除可能存在的首尾空格
    supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());
  } else {
    initError = "Supabase URL 或 Key 缺失";
  }
} catch (error) {
  console.error("Supabase 初始化失败:", error);
  initError = error.message;
}

// --- 简单的错误边界组件 (Error Boundary) ---
// 如果页面崩溃，显示错误信息而不是白屏
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 h-screen flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-red-800 mb-2">程序遇到了一点问题</h1>
          <p className="text-red-600 mb-4">请将下方错误信息截图给技术支持：</p>
          <pre className="bg-white p-4 rounded border border-red-200 text-left text-xs font-mono overflow-auto max-w-lg">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            刷新页面重试
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- 多语言配置 ---
const TRANSLATIONS = {
  en: {
    appName: 'ClearMonth',
    // ✅ 关键修复：添加了 weekDays
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    views: { month: 'Month', week: 'Week' },
    today: 'Today',
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Log Out',
    welcome: 'Welcome',
    email: 'Email address',
    password: 'Password',
    loginDesc: 'Login to sync your calendar',
    signupDesc: 'Create an account to get started',
    switchToLogin: 'Already have an account? Log In',
    switchToSignup: "Don't have an account? Sign Up",
    checkEmail: 'Account created! You are logged in.',
    addTask: 'Add Task',
    taskDetails: 'Task Details',
    detailsPlaceholder: 'Add detailed description here...',
    titlePlaceholder: 'Task title...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    weeklyNotes: 'Weekly Notes',
    notesPlaceholder: 'Free text for this week...',
    remaining: 'more...',
    emptyDay: 'No tasks',
    confirmDeleteTitle: 'Delete Task?',
    confirmDeleteDesc: 'This action cannot be undone.',
    confirmButton: 'Yes, Delete',
    help: 'Help',
    usageGuide: 'Usage Guide',
    guideSteps: [
      { title: 'Sync Data', desc: 'Login to save data to cloud automatically.' },
      { title: 'Switch Views', desc: 'Use top-right dropdown to toggle Month/Week view.' },
      { title: 'Add Task', desc: 'Click any date cell or the big + button.' }
    ],
    close: 'Close',
    loading: 'Processing...'
  },
  zh: {
    appName: '清月历',
    // ✅ 关键修复：添加了 weekDays
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    views: { month: '月视图', week: '周视图' },
    today: '今天',
    login: '登录',
    signup: '注册账户',
    logout: '退出',
    welcome: '欢迎',
    email: '邮箱地址',
    password: '密码 (至少6位)',
    loginDesc: '登录以同步您的日历数据',
    signupDesc: '注册一个新账户以开始使用',
    switchToLogin: '已有账号？去登录',
    switchToSignup: '还没有账号？去注册',
    checkEmail: '注册并登录成功！',
    addTask: '新建任务',
    taskDetails: '任务详情',
    detailsPlaceholder: '在此添加详细描述...',
    titlePlaceholder: '任务标题...',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    weeklyNotes: '本周备忘',
    notesPlaceholder: '在此记录本周随想...',
    remaining: '项剩余...',
    emptyDay: '暂无安排',
    confirmDeleteTitle: '确认删除？',
    confirmDeleteDesc: '此操作无法撤销。',
    confirmButton: '确认删除',
    help: '使用说明',
    usageGuide: '使用指南',
    guideSteps: [
      { title: '云端同步', desc: '登录后，数据将自动保存到云端，永不丢失。' },
      { title: '切换视图', desc: '右上角下拉菜单可切换月/周视图。' },
      { title: '新建任务', desc: '点击日历格子或右上角 + 按钮。' }
    ],
    close: '知道啦',
    loading: '处理中...'
  }
};

const THEMES = [
  { id: 'orange', color: 'bg-orange-400', hover: 'hover:bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'focus:ring-orange-300', icon: 'bg-orange-400' },
  { id: 'slate',  color: 'bg-slate-500',  hover: 'hover:bg-slate-600',  light: 'bg-slate-100',  border: 'border-slate-300',  text: 'text-slate-700',  ring: 'focus:ring-slate-300',  icon: 'bg-slate-500' },
  { id: 'green',  color: 'bg-emerald-400',hover: 'hover:bg-emerald-500',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',ring: 'focus:ring-emerald-300',icon: 'bg-emerald-400' },
  { id: 'blue',   color: 'bg-sky-400',    hover: 'hover:bg-sky-500',    light: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    ring: 'focus:ring-sky-300',    icon: 'bg-sky-400' },
  { id: 'red',    color: 'bg-rose-400',   hover: 'hover:bg-rose-500',   light: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: 'focus:ring-rose-300',   icon: 'bg-rose-400' },
  { id: 'yellow', color: 'bg-amber-400',  hover: 'hover:bg-amber-500',  light: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: 'focus:ring-amber-300',  icon: 'bg-amber-400' },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; 
};
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const isSameDate = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};
const getWeekRange = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(current.setDate(diff));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
};

const INITIAL_TASKS = [
  { id: 1, date: formatDateKey(new Date()), text: '欢迎使用清月历', details: '这是本地演示数据。', completed: false }
];

function CalendarAppContent() {
  const [lang, setLang] = useState('zh'); 
  const t = TRANSLATIONS[lang];
  const [currentThemeId, setCurrentThemeId] = useState('orange');
  const theme = THEMES.find(th => th.id === currentThemeId) || THEMES[0];
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [weeklyNotes, setWeeklyNotes] = useState({}); 
  const [view, setView] = useState('month'); 
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(''); 
  const [dataLoading, setDataLoading] = useState(false);

  const [modalMode, setModalMode] = useState('add'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const [formText, setFormText] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formDate, setFormDate] = useState('');
  const datePickerRef = useRef(null);

  // 如果 Supabase 初始化就失败了，直接显示错误
  if (initError) {
    throw new Error("Supabase 配置错误: " + initError);
  }

  useEffect(() => {
    const savedNotes = localStorage.getItem('saas_notes_v3');
    if (savedNotes) {
      try { setWeeklyNotes(JSON.parse(savedNotes)); } catch (e) {}
    }
    
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data && data.session) {
          setUser(data.session.user);
          fetchTasks(data.session.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchTasks(session.user.id);
          setShowAuthModal(false); 
        } else {
          setTasks(INITIAL_TASKS);
        }
      });
      return () => {
        if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
      };
    } else {
      const savedTasks = localStorage.getItem('saas_tasks_v3');
      if (savedTasks) {
        try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('saas_tasks_v3', JSON.stringify(tasks));
      localStorage.setItem('saas_notes_v3', JSON.stringify(weeklyNotes));
    }
  }, [tasks, weeklyNotes, user]);

  const fetchTasks = async (userId) => {
    if (!supabase) return;
    setDataLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
    if (!error && data) setTasks(data);
    setDataLoading(false);
  };

  const dbAddTask = async (newTask) => {
    if (user && supabase) {
      const { data } = await supabase.from('tasks').insert([{
        user_id: user.id,
        text: newTask.text,
        details: newTask.details,
        date: newTask.date,
        completed: newTask.completed
      }]).select();
      if (data) return data[0];
    }
    return newTask;
  };

  const dbUpdateTask = async (task) => {
    if (user && supabase) {
      await supabase.from('tasks').update({
        text: task.text,
        details: task.details,
        date: task.date,
        completed: task.completed
      }).eq('id', task.id);
    }
  };

  const dbDeleteTask = async (taskId) => {
    if (user && supabase) await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("配置错误：Supabase 连接未开启。");
    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setAuthMessage(t.checkEmail);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message); 
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, completed: !task.completed };
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    await dbUpdateTask(updatedTask);
  };

  const saveTask = async () => {
    if (!formText.trim()) return;
    if (modalMode === 'add') {
      const tempTask = {
        id: Date.now(),
        date: formDate,
        text: formText,
        details: formDetails,
        completed: false
      };
      setTasks(prev => [...prev, tempTask]);
      setIsModalOpen(false);
      const savedTask = await dbAddTask(tempTask);
      if (user && savedTask) setTasks(prev => prev.map(t => t.id === tempTask.id ? savedTask : t));
    } else {
      const updatedTask = { ...editingTask, date: formDate, text: formText, details: formDetails };
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setIsModalOpen(false);
      await dbUpdateTask(updatedTask);
    }
  };

  const confirmDeleteTask = async () => {
    if (deleteConfirm.taskId) {
      const idToDelete = deleteConfirm.taskId;
      setTasks(tasks.filter(t => t.id !== idToDelete));
      setDeleteConfirm({ show: false, taskId: null });
      setIsModalOpen(false);
      await dbDeleteTask(idToDelete);
    }
  };

  const initiateDelete = (taskId = null) => {
    const idToDelete = taskId || (editingTask ? editingTask.id : null);
    if (idToDelete) setDeleteConfirm({ show: true, taskId: idToDelete });
  };

  const saveWeeklyNote = (noteText) => {
    const weekStart = getWeekRange(currentDate)[0];
    const weekKey = formatDateKey(weekStart);
    setWeeklyNotes(prev => ({ ...prev, [weekKey]: noteText }));
  };
  
  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
  const openAddModal = (dateKey = null) => {
    setModalMode('add'); setFormDate(dateKey || selectedDateKey); setFormText(''); setFormDetails(''); setEditingTask(null); setIsModalOpen(true);
  };
  const openEditModal = (task) => {
    setModalMode('edit'); setFormDate(task.date); setFormText(task.text); setFormDetails(task.details || ''); setEditingTask(task); setIsModalOpen(true);
  };
  const goToToday = () => { const now = new Date(); setCurrentDate(now); setSelectedDateKey(formatDateKey(now)); };
  const handleDatePick = (e) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-');
      setCurrentDate(new Date(y, m - 1, d || 1));
      if (d) setSelectedDateKey(e.target.value);
    }
  };

  const TaskItem = ({ task, isCompact = false, onDelete = null }) => (
    <div className={`flex items-start gap-2 group ${isCompact ? 'mb-1' : `mb-3 p-3 bg-white rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all`}`}>
      <div className="pt-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }}>
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${task.completed ? `${theme.color} border-transparent` : `border-slate-300 bg-white hover:${theme.border}`}`}>
          {task.completed && <Check size={10} className="text-white" />}
        </div>
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditModal(task)}>
        <span className={`text-sm leading-tight transition-all select-none block truncate ${task.completed ? 'text-slate-400 line-through opacity-60' : 'text-slate-700'}`}>{task.text}</span>
      </div>
      {!isCompact && onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-300 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
      )}
    </div>
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayObj = getFirstDayOfMonth(year, month);
  const monthCells = [];
  for (let i = 0; i < firstDayObj; i++) monthCells.push({ type: 'empty', key: `empty-${i}` });
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(new Date(year, month, day));
    monthCells.push({ type: 'day', day, dateKey, dateObj: new Date(year, month, day) });
  }
  const weekDays = getWeekRange(currentDate);
  const currentWeekKey = formatDateKey(weekDays[0]);

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-slate-800 transition-colors duration-300">
      <header className={`flex-shrink-0 bg-white border-b ${theme.border} px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm z-20 relative transition-colors duration-300`}>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleLang}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors duration-300 ${theme.color} group-hover:opacity-90`}>{lang === 'zh' ? <span className="font-serif font-bold text-sm">月</span> : <CalendarIcon size={18} />}</div>
            <span className={`font-bold text-xl tracking-tight text-slate-800 group-hover:${theme.text} transition-colors`}>{t.appName}</span>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2 py-1">
             <button onClick={goToToday} className={`text-xs font-bold ${theme.text} hover:bg-white px-3 py-1.5 rounded-full transition shadow-sm mr-1`}>{t.today}</button>
             <button onClick={() => view === 'month' ? setCurrentDate(new Date(year, month - 1, 1)) : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}><ChevronLeft size={16} /></button>
             <div className="relative group cursor-pointer">
               <span className="font-semibold w-24 sm:w-32 text-center text-slate-700 block select-none">{view === 'month' ? currentDate.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' }) : `${weekDays[0].getMonth()+1}/${weekDays[0].getDate()} - ${weekDays[6].getMonth()+1}/${weekDays[6].getDate()}`}</span>
               <input ref={datePickerRef} type={view === 'month' ? "month" : "date"} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleDatePick} />
               <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 ${theme.color} transition-all group-hover:w-full`}></div>
             </div>
             <button onClick={() => view === 'month' ? setCurrentDate(new Date(year, month + 1, 1)) : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 ${isThemeMenuOpen ? 'bg-slate-100' : ''}`}><Palette size={20} className="text-slate-500" /></button>
            {isThemeMenuOpen && (
              <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in-95 duration-200 w-48">
                <div className="grid grid-cols-3 gap-2">{THEMES.map((th) => <button key={th.id} onClick={() => { setCurrentThemeId(th.id); setIsThemeMenuOpen(false); }} className={`w-full aspect-square rounded-lg ${th.color} hover:opacity-80 transition shadow-sm ring-2 ring-offset-2 ${currentThemeId === th.id ? 'ring-slate-400' : 'ring-transparent'}`} />)}</div>
              </div>
            )}
          </div>
          <div className="relative hidden sm:block">
            <button onClick={() => setIsViewMenuOpen(!isViewMenuOpen)} className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:${theme.border} transition text-sm font-medium text-slate-600`}>{t.views[view]} <ChevronDown size={14} /></button>
            {isViewMenuOpen && <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30">{['month', 'week'].map((v) => <button key={v} onClick={() => { setView(v); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:${theme.light} hover:${theme.text} ${view === v ? `${theme.text} font-medium` : 'text-slate-600'}`}>{t.views[v]}</button>)}</div>}
          </div>
          <button onClick={() => openAddModal()} className={`w-9 h-9 ${theme.color} ${theme.hover} text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105`}><Plus size={20} /></button>
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className={`w-8 h-8 ${theme.light} rounded-full flex items-center justify-center ${theme.text} font-bold border ${theme.border} text-sm`}>{user.email ? user.email[0].toUpperCase() : 'U'}</div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500" title={t.logout}><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} className={`text-sm font-medium text-slate-600 hover:${theme.text}`}>{t.login}</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {dataLoading && <div className="absolute inset-0 bg-white/50 z-40 flex items-center justify-center"><Loader2 className={`animate-spin ${theme.text}`} size={32} /></div>}
        {view === 'month' && (
          <div className="grid grid-cols-7 border-b border-slate-200 bg-stone-50 flex-shrink-0">
            {t.weekDays.map(day => <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>)}
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {view === 'month' && (
            <div className="grid grid-cols-7 auto-rows-fr min-h-full border-l border-slate-200">
              {monthCells.map((cell) => {
                if (cell.type === 'empty') return <div key={cell.key} className="bg-stone-50/50 border-b border-r border-slate-200 min-h-[100px]" />;
                const isToday = isSameDate(cell.dateObj, new Date());
                const dayTasks = tasks.filter(t => t.date === cell.dateKey);
                const isSelected = selectedDateKey === cell.dateKey;
                return (
                  <div key={cell.dateKey} onClick={() => setSelectedDateKey(cell.dateKey)} className={`relative border-b border-r border-slate-200 p-1.5 sm:p-2 min-h-[120px] group transition-colors cursor-pointer ${isSelected ? `${theme.light} bg-opacity-60` : 'bg-white hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isToday ? `${theme.color} text-white shadow-md` : 'text-slate-700'}`}>{cell.day}</span>
                      <button onClick={(e) => { e.stopPropagation(); openAddModal(cell.dateKey); }} className={`opacity-0 group-hover:opacity-100 text-slate-400 hover:${theme.text}`}><Plus size={14} /></button>
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 15).map(task => <TaskItem key={task.id} task={task} isCompact={true} />)}
                      {dayTasks.length > 15 && <div className="text-[10px] text-slate-400 pl-1">{dayTasks.length - 15} {t.remaining}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {view === 'week' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-2 h-full">
              {weekDays.map((date, index) => {
                const dateKey = formatDateKey(date);
                const isToday = isSameDate(date, new Date());
                const dayTasks = tasks.filter(t => t.date === dateKey);
                return (
                  <div key={dateKey} className="border-r border-b border-slate-200 p-4 flex flex-col min-h-[200px] hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div><span className="text-xs font-bold text-slate-400 uppercase mr-2">{t.weekDays[index]}</span><span className={`text-lg font-bold ${isToday ? theme.text : 'text-slate-700'}`}>{date.getDate()}</span></div>
                      <button onClick={() => openAddModal(dateKey)} className={`text-slate-300 hover:${theme.text}`}><Plus size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                      {dayTasks.length > 0 ? dayTasks.map(task => <TaskItem key={task.id} task={task} isCompact={false} onDelete={initiateDelete} />) : <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">{t.emptyDay}</div>}
                    </div>
                  </div>
                );
              })}
              <div className={`border-b border-slate-200 ${theme.light} bg-opacity-30 p-4 flex flex-col min-h-[200px]`}>
                <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${theme.border}`}><FileText size={16} className={theme.text} /><span className="font-bold text-slate-700">{t.weeklyNotes}</span></div>
                <textarea className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-slate-600 placeholder:text-slate-300" placeholder={t.notesPlaceholder} value={weeklyNotes[currentWeekKey] || ''} onChange={(e) => saveWeeklyNote(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer (Month View) */}
      {view === 'month' && (
        <div className="h-48 flex-shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex">
          <div className="w-48 bg-stone-50 border-r border-slate-200 flex flex-col items-center justify-center p-4 relative">
             <div className="text-4xl font-bold text-slate-800">{new Date(selectedDateKey).getDate()}</div>
             <div className="text-slate-500 font-medium uppercase tracking-wide">{new Date(selectedDateKey).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long' })}</div>
             <div className="text-xs text-slate-400 mt-1">{tasks.filter(t => t.date === selectedDateKey && !t.completed).length} pending</div>
             <button onClick={() => setIsHelpModalOpen(true)} className="absolute bottom-3 left-3 text-slate-400 hover:text-slate-600 transition-colors p-1" title={t.help}><HelpCircle size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">{selectedDateKey === formatDateKey(new Date()) ? t.today : selectedDateKey}</h3>
                  <button onClick={() => openAddModal(selectedDateKey)} className={`text-sm ${theme.text} hover:${theme.light} px-3 py-1 rounded-full transition flex items-center gap-1`}><Plus size={14} /> {t.addTask}</button>
                </div>
                <div className="space-y-1">
                  {tasks.filter(t => t.date === selectedDateKey).map(task => <TaskItem key={task.id} task={task} onDelete={initiateDelete} />)}
                  {tasks.filter(t => t.date === selectedDateKey).length === 0 && <div className="text-slate-400 italic py-4 text-sm">{t.emptyDay}</div>}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className={`w-16 h-16 ${theme.light} ${theme.text} rounded-full flex items-center justify-center mx-auto mb-4`}><Globe size={32} /></div>
              <h2 className="text-2xl font-bold text-slate-900">{authMode === 'login' ? t.login : t.signup}</h2>
              <p className="text-slate-500 text-sm mt-1 mb-6">{authMode === 'login' ? t.loginDesc : t.signupDesc}</p>
              {authMessage ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-4 border border-green-100 flex gap-2 items-center text-left">
                  <Check size={20} className="flex-shrink-0" /> {authMessage}
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input type="email" placeholder={t.email} value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm" required />
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input type="password" placeholder={t.password} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm" required minLength={6} />
                  </div>
                  <button type="submit" disabled={authLoading} className={`w-full py-3 ${theme.color} text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg disabled:opacity-50`}>
                    {authLoading ? t.loading : (authMode === 'login' ? t.login : t.signup)}
                  </button>
                </form>
              )}
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage(''); }} className={`text-sm font-medium ${theme.text} hover:underline`}>{authMode === 'login' ? t.switchToSignup : t.switchToLogin}</button>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={20} /></button>
          </div>
        </div>
      )}

      {/* Task/Help Modals omitted for brevity - logic remains same as functional part */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-slate-800">{modalMode === 'add' ? t.addTask : t.taskDetails}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input autoFocus={modalMode === 'add'} type="text" value={formText} onChange={e => setFormText(e.target.value)} placeholder={t.titlePlaceholder} className="w-full text-lg font-semibold placeholder:font-normal bg-transparent border-none focus:ring-0 px-0 text-slate-800 placeholder:text-slate-300" />
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg"><CalendarIcon size={16} /><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="bg-transparent border-none text-slate-600 focus:ring-0 p-0 text-sm" /></div>
              <div className="relative"><textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} placeholder={t.detailsPlaceholder} rows={4} className={`w-full px-4 py-3 bg-stone-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-opacity-50 ${theme.ring} focus:border-transparent outline-none text-slate-700 text-sm resize-none`} /><AlignLeft className="absolute right-3 top-3 text-slate-300" size={16} /></div>
              <div className="flex justify-between pt-4 gap-3">
                 {modalMode === 'edit' && <button type="button" onClick={() => initiateDelete(null)} className="text-red-400 hover:text-red-600 text-sm font-medium px-2">{t.delete}</button>}
                 <div className="flex gap-3 ml-auto"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition text-sm">{t.cancel}</button><button onClick={saveTask} className={`px-6 py-2 ${theme.color} ${theme.hover} text-white rounded-lg font-medium shadow-lg transition text-sm`}>{t.save}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.confirmDeleteTitle}</h3>
              <p className="text-slate-500 text-sm mb-6">{t.confirmDeleteDesc}</p>
              <div className="flex gap-3"><button onClick={() => setDeleteConfirm({ show: false, taskId: null })} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">{t.cancel}</button><button onClick={confirmDeleteTask} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-lg shadow-red-100 transition">{t.confirmButton}</button></div>
           </div>
        </div>
      )}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-stone-50">
                <div className="flex items-center gap-2"><HelpCircle size={20} className={theme.text} /><h3 className="font-bold text-lg text-slate-800">{t.usageGuide}</h3></div>
                <button onClick={() => setIsHelpModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">{t.guideSteps.map((step, idx) => (<div key={idx} className="flex gap-4"><div className={`w-8 h-8 rounded-full ${theme.light} ${theme.text} flex items-center justify-center font-bold flex-shrink-0 mt-0.5 text-sm`}>{idx + 1}</div><div><h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4><p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p></div></div>))}</div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-stone-50 text-right"><button onClick={() => setIsHelpModalOpen(false)} className={`px-6 py-2 ${theme.color} text-white font-medium rounded-lg hover:opacity-90 transition text-sm shadow-md`}>{t.close}</button></div>
           </div>
        </div>
      )}
    </div>
  );
}

// 封装导出，加上 ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <CalendarAppContent />
    </ErrorBoundary>
  );
}
