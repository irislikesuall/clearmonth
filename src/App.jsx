import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// ==========================================
// ✅ Firebase 配置与初始化
// ==========================================
// 适配 Vite 环境变量 (import.meta.env) 或回退到硬编码
const firebaseConfig = {
  apiKey: (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) || "AIzaSyDZ2wqdY1uXj12mCXh58zbFuRh1TylPj88",
  authDomain: "clearmonth-fdd18.firebaseapp.com",
  projectId: "clearmonth-fdd18",
  storageBucket: "clearmonth-fdd18.firebasestorage.app",
  messagingSenderId: "586292348802",
  appId: "1:586292348802:web:1d7bf1db3ed7aaedadb19b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'clearmonth-app';

// ==========================================
// 🧩 工具函数 & 常量
// ==========================================

const TRANSLATIONS = {
  en: {
    appName: 'ClearMonth',
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
    titlePlaceholder: 'Task title... (Press Enter to save)',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    weeklyNotes: 'Weekly Notes',
    monthlyNotes: 'Monthly Notes',
    notesPlaceholder: 'Free text area...',
    remaining: 'more...',
    emptyDay: 'No tasks',
    confirmDeleteTitle: 'Delete Task?',
    confirmDeleteDesc: 'This action cannot be undone.',
    confirmButton: 'Yes, Delete',
    help: 'Help',
    usageGuide: 'Usage Guide',
    guideSteps: [
      { title: 'Sync Data', desc: 'Login to save data to cloud automatically.' },
      { title: 'Drag & Drop', desc: 'Drag tasks to move them between days. Drag to arrows to change month.' },
      { title: 'Quick Add', desc: 'Press Enter in the title field to save immediately.' },
      { title: 'Notes', desc: 'Use the sticky note areas in Week/Month views for memos.' }
    ],
    close: 'Close',
    loading: 'Processing...',
    dragToMove: 'Move to'
  },
  zh: {
    appName: '清月历',
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
    titlePlaceholder: '任务标题... (回车直接保存)',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    weeklyNotes: '本周备忘',
    monthlyNotes: '本月备忘',
    notesPlaceholder: '在此记录随想...',
    remaining: '项剩余...',
    emptyDay: '暂无安排',
    confirmDeleteTitle: '确认删除？',
    confirmDeleteDesc: '此操作无法撤销。',
    confirmButton: '确认删除',
    help: '使用说明',
    usageGuide: '使用指南',
    guideSteps: [
      { title: '云端同步', desc: '登录后，数据将自动保存到云端，永不丢失。' },
      { title: '拖拽移动', desc: '长按任务可拖拽至任意日期。拖至顶部箭头可跨月移动。' },
      { title: '快速添加', desc: '在输入标题时直接敲击回车键即可保存。' },
      { title: '备忘录', desc: '利用月视图空白处或周视图底部的区域记录灵感。' }
    ],
    close: '知道啦',
    loading: '处理中...',
    dragToMove: '移动到'
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

// ==========================================
// 🧱 子组件定义 (Component Split)
// ==========================================

// 1. Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 h-screen flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-red-800 mb-2">程序遇到了一点问题</h1>
          <pre className="bg-white p-4 rounded border border-red-200 text-left text-xs font-mono overflow-auto max-w-lg mb-4">{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">刷新页面重试</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// 2. 任务项组件 (支持拖拽)
const TaskItem = ({ task, theme, isCompact, onClick, onDelete, onDragStart }) => (
  <div 
    draggable="true"
    onDragStart={(e) => onDragStart && onDragStart(e, task)}
    onClick={(e) => { e.stopPropagation(); onClick(task); }}
    className={`flex items-start gap-2 group cursor-grab active:cursor-grabbing ${isCompact ? 'mb-1' : `mb-3 p-3 bg-white rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all`}`}
  >
    <div className="pt-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(task, true); }}>
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${task.completed ? `${theme.color} border-transparent` : `border-slate-300 bg-white hover:${theme.border}`}`}>
        {task.completed && <Check size={10} className="text-white" />}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <span className={`text-sm leading-tight transition-all select-none block truncate ${task.completed ? 'text-slate-400 line-through opacity-60' : 'text-slate-700'}`}>{task.text}</span>
    </div>
    {!isCompact && onDelete && (
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-300 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
    )}
  </div>
);

// 3. 备忘录组件 (月/周共用)
const NoteBlock = ({ title, value, onChange, theme, placeholder, type = 'week' }) => (
  <div className={`relative flex flex-col ${type === 'month' ? 'h-full bg-yellow-50/60 p-2 sm:p-3 shadow-inner' : `border-b border-slate-200 ${theme.light} bg-opacity-30 p-3 sm:p-4 min-h-[180px]`}`}>
    <div className={`flex items-center gap-2 mb-2 ${type === 'month' ? '' : 'pb-2 border-b ' + theme.border}`}>
      <FileText size={type === 'month' ? 14 : 16} className={`${theme.text} opacity-70`} />
      <span className={`font-bold text-slate-700 ${type === 'month' ? 'text-xs' : 'text-sm'}`}>{title}</span>
    </div>
    <textarea 
      className="flex-1 w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-slate-600 placeholder:text-slate-400/70 leading-relaxed" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

// 4. 认证弹窗
const AuthModal = ({ isOpen, mode, setMode, email, setEmail, password, setPassword, loading, message, onSubmit, onClose, t, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${theme.light} ${theme.text} rounded-full flex items-center justify-center mx-auto mb-4`}><Globe size={32} /></div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? t.login : t.signup}</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">{mode === 'login' ? t.loginDesc : t.signupDesc}</p>
          {message ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-4 border border-green-100 flex gap-2 items-center text-left">
              <Check size={20} className="flex-shrink-0" /> {message}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm" required />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className={`w-full py-3 ${theme.color} text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg disabled:opacity-50`}>
                {loading ? t.loading : (mode === 'login' ? t.login : t.signup)}
              </button>
            </form>
          )}
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); }} className={`text-sm font-medium ${theme.text} hover:underline`}>{mode === 'login' ? t.switchToSignup : t.switchToLogin}</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={20} /></button>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 主逻辑组件
// ==========================================

function CalendarAppContent() {
  const [lang, setLang] = useState('zh'); 
  const t = TRANSLATIONS[lang];
  const [currentThemeId, setCurrentThemeId] = useState('orange');
  const theme = THEMES.find(th => th.id === currentThemeId) || THEMES[0];
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [tasks, setTasks] = useState([{ id: 'intro-1', date: formatDateKey(new Date()), text: '欢迎使用清月历', details: '这是演示数据。', completed: false }]);
  const [notes, setNotes] = useState({}); // 存储周/月备注 { '2023-10-01': 'note content' }
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
  
  // Drag and Drop State
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // 1. Performance Optimization: Use useMemo for tasks map
  const tasksMap = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  // Auth & Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setShowAuthModal(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      const savedTasks = localStorage.getItem('saas_tasks_v3');
      const savedNotes = localStorage.getItem('saas_notes_v3');
      if (savedTasks) try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
      if (savedNotes) try { setNotes(JSON.parse(savedNotes)); } catch (e) {}
      return;
    }

    setDataLoading(true);
    // Sync Tasks
    const qTasks = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    });

    // Sync Notes (简单的本地存储方案用于演示，真实SaaS可存DB)
    const savedNotes = localStorage.getItem(`saas_notes_${user.uid}`);
    if (savedNotes) try { setNotes(JSON.parse(savedNotes)); } catch(e){}

    return () => { unsubTasks(); };
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('saas_tasks_v3', JSON.stringify(tasks));
      localStorage.setItem('saas_notes_v3', JSON.stringify(notes));
    } else {
      localStorage.setItem(`saas_notes_${user.uid}`, JSON.stringify(notes));
    }
  }, [tasks, notes, user]);

  // Database Operations
  const dbUpdateTask = async (task) => {
    if (user) {
      const taskRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', task.id);
      await updateDoc(taskRef, {
        text: task.text, details: task.details, date: task.date, completed: task.completed
      });
    }
  };

  const handleTaskAction = (task, isToggle = false) => {
    if (isToggle) {
      const updated = { ...task, completed: !task.completed };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      dbUpdateTask(updated);
    } else {
      openEditModal(task);
    }
  };

  const saveTask = async () => {
    if (!formText.trim()) return;
    
    if (modalMode === 'add') {
      const tempId = Date.now().toString();
      const tempTask = { id: tempId, date: formDate, text: formText, details: formDetails, completed: false };
      setTasks(prev => [...prev, tempTask]);
      setIsModalOpen(false);
      
      if (user) {
        try {
          const docRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks'), {
            ...tempTask, createdAt: serverTimestamp()
          });
          setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: docRef.id } : t));
        } catch (e) { console.error(e); }
      }
    } else {
      const updatedTask = { ...editingTask, date: formDate, text: formText, details: formDetails };
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setIsModalOpen(false);
      dbUpdateTask(updatedTask);
    }
  };

  const deleteTask = async () => {
    if (deleteConfirm.taskId) {
      const id = deleteConfirm.taskId;
      setTasks(prev => prev.filter(t => t.id !== id));
      setDeleteConfirm({ show: false, taskId: null });
      setIsModalOpen(false);
      if (user) await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', id));
    }
  };

  const handleNoteChange = (key, text) => {
    setNotes((prev) => ({ ...prev, [key]: text }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id); // Required for Firefox
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e, dateKey) => {
    e.preventDefault(); // Necessary for onDrop to work
    if (draggedTask && dateKey !== draggedTask.date) {
      setDragOverDate(dateKey);
    }
  };

  const handleDrop = async (e, targetDateKey) => {
    e.preventDefault();
    if (draggedTask && targetDateKey && draggedTask.date !== targetDateKey) {
      // Optimistic update
      const updatedTask = { ...draggedTask, date: targetDateKey };
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? updatedTask : t));
      
      // DB update
      if (user) await dbUpdateTask(updatedTask);
    }
    setDragOverDate(null);
  };

  const handleNavDrop = (e, direction) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    let targetDate = new Date(currentDate);
    if (direction === 'prev') {
      targetDate.setMonth(targetDate.getMonth() - 1);
      targetDate.setDate(1);
    } else {
      targetDate.setMonth(targetDate.getMonth() + 1);
      targetDate.setDate(1);
    }
    const targetKey = formatDateKey(targetDate);
    handleDrop(e, targetKey);
    setCurrentDate(targetDate); // Jump to that month
  };

  // Helpers
  const openAddModal = (dateKey = null) => {
    setModalMode('add'); 
    setFormDate(dateKey || selectedDateKey); 
    setFormText(''); 
    setFormDetails(''); 
    setIsModalOpen(true);
  };
  
  const openEditModal = (task) => {
    setModalMode('edit'); 
    setFormDate(task.date); 
    setFormText(task.text); 
    setFormDetails(task.details || ''); 
    setEditingTask(task); 
    setIsModalOpen(true);
  };

  // Render Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayObj = getFirstDayOfMonth(year, month);
  
  // Month Cells Generation
  const monthCells = [];
  // Start Empty Slots
  for (let i = 0; i < firstDayObj; i++) monthCells.push({ type: 'empty', key: `empty-start-${i}`, index: i });
  // Day Slots
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(new Date(year, month, day));
    monthCells.push({ type: 'day', day, dateKey, dateObj: new Date(year, month, day) });
  }
  // End Empty Slots (to fill grid)
  const totalSlots = monthCells.length;
  const remainingSlots = 35 - totalSlots > 0 ? 35 - totalSlots : (42 - totalSlots > 0 ? 42 - totalSlots : 0);
  for (let i = 0; i < remainingSlots; i++) monthCells.push({ type: 'empty', key: `empty-end-${i}`, index: i + firstDayObj + daysInMonth });

  const weekDays = getWeekRange(currentDate);
  const weekStartKey = formatDateKey(weekDays[0]);
  const monthStartKey = formatDateKey(new Date(year, month, 1));

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-slate-800 transition-colors duration-300">
      
      {/* HEADER */}
      <header className={`flex-shrink-0 bg-white border-b ${theme.border} px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm z-20 relative`}>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors duration-300 ${theme.color}`}>
              {lang === 'zh' ? <span className="font-serif font-bold text-sm">月</span> : <CalendarIcon size={18} />}
            </div>
            <span className={`font-bold text-xl tracking-tight text-slate-800 group-hover:${theme.text} transition-colors hidden sm:block`}>{t.appName}</span>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2 py-1">
             <button onClick={() => { const now = new Date(); setCurrentDate(now); setSelectedDateKey(formatDateKey(now)); }} className={`text-xs font-bold ${theme.text} hover:bg-white px-3 py-1.5 rounded-full transition shadow-sm mr-1`}>{t.today}</button>
             {/* Navigation with Drop Zones for Cross-Month Dragging */}
             <button 
                onClick={() => view === 'month' ? setCurrentDate(new Date(year, month - 1, 1)) : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleNavDrop(e, 'prev')}
                className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
                title="Drop task here to move to previous month"
              >
                <ChevronLeft size={16} />
              </button>
             <div className="relative group cursor-pointer">
               <span className="font-semibold w-24 sm:w-32 text-center text-slate-700 block select-none text-xs sm:text-sm whitespace-nowrap overflow-hidden">
                 {view === 'month' ? currentDate.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' }) : `${weekDays[0].getMonth()+1}/${weekDays[0].getDate()} - ${weekDays[6].getMonth()+1}/${weekDays[6].getDate()}`}
               </span>
               <input type={view === 'month' ? "month" : "date"} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => {
                 if(e.target.value) {
                   const [y, m, d] = e.target.value.split('-');
                   setCurrentDate(new Date(parseInt(y), parseInt(m)-1, parseInt(d || '1')));
                   if (d) setSelectedDateKey(e.target.value);
                 }
               }} />
             </div>
             <button 
                onClick={() => view === 'month' ? setCurrentDate(new Date(year, month + 1, 1)) : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleNavDrop(e, 'next')}
                className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
                title="Drop task here to move to next month"
              >
                <ChevronRight size={16} />
              </button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 ${isThemeMenuOpen ? 'bg-slate-100' : ''}`}><Palette size={18} className="text-slate-500" /></button>
            {isThemeMenuOpen && (
              <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-100 z-30 w-48 grid grid-cols-3 gap-2">
                {THEMES.map((th) => <button key={th.id} onClick={() => { setCurrentThemeId(th.id); setIsThemeMenuOpen(false); }} className={`w-full aspect-square rounded-lg ${th.color} hover:opacity-80 ring-2 ${currentThemeId === th.id ? 'ring-slate-400' : 'ring-transparent'}`} />)}
              </div>
            )}
          </div>
          <div className="relative hidden sm:block">
            <button onClick={() => setIsViewMenuOpen(!isViewMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">{t.views[view]} <ChevronDown size={14} /></button>
            {isViewMenuOpen && <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30">{['month', 'week'].map((v) => <button key={v} onClick={() => { setView(v); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:${theme.light} ${view === v ? `${theme.text} font-medium` : 'text-slate-600'}`}>{t.views[v]}</button>)}</div>}
          </div>
          <button onClick={() => openAddModal()} className={`w-9 h-9 ${theme.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition`}><Plus size={20} /></button>
          {user ? (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className={`w-8 h-8 ${theme.light} rounded-full flex items-center justify-center ${theme.text} font-bold border ${theme.border} text-xs`}>{user.email ? user.email[0].toUpperCase() : 'U'}</div>
              <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} className={`text-sm font-medium text-slate-600 hover:${theme.text} whitespace-nowrap`}>{t.login}</button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {dataLoading && <div className="absolute inset-0 bg-white/50 z-40 flex items-center justify-center"><Loader2 className={`animate-spin ${theme.text}`} size={32} /></div>}
        
        <div className="flex-1 overflow-auto custom-scrollbar bg-stone-50 p-2 sm:p-4 flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
            
            {/* Week Header for Month View */}
            {view === 'month' && (
              <div className="overflow-auto custom-scrollbar flex-shrink-0 border-b border-slate-200 bg-stone-50">
                <div className="grid grid-cols-7 min-w-[700px]">
                    {(t.weekDays || []).map(day => <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>)}
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white">
              
              {/* --- MONTH VIEW --- */}
              {view === 'month' && (
                <div className="grid grid-cols-7 auto-rows-fr min-h-full border-l border-slate-200 min-w-[700px]">
                  {monthCells.map((cell, idx) => {
                    // Feature 1: Monthly Notes in the FIRST empty slot of the grid
                    if (cell.type === 'empty') {
                      if (idx === 0) {
                         return (
                            <div key={cell.key} className="bg-stone-50/20 border-b border-r border-slate-200 min-h-[100px]">
                               <NoteBlock 
                                  type="month"
                                  title={t.monthlyNotes} 
                                  theme={theme} 
                                  placeholder={t.notesPlaceholder}
                                  value={notes[monthStartKey]}
                                  onChange={(val) => handleNoteChange(monthStartKey, val)}
                               />
                            </div>
                         );
                      }
                      return <div key={cell.key} className="bg-stone-50/50 border-b border-r border-slate-200 min-h-[100px]" />;
                    }

                    const isToday = isSameDate(cell.dateObj, new Date());
                    // Feature 4: Performance (using map lookup O(1) instead of filter O(N))
                    const dayTasks = tasksMap[cell.dateKey] || [];
                    const isSelected = selectedDateKey === cell.dateKey;
                    const isDragOver = dragOverDate === cell.dateKey;

                    return (
                      <div 
                        key={cell.dateKey} 
                        onClick={() => setSelectedDateKey(cell.dateKey)} 
                        onDragOver={(e) => handleDragOver(e, cell.dateKey)}
                        onDrop={(e) => handleDrop(e, cell.dateKey)}
                        onDragLeave={handleDragEnd}
                        className={`relative border-b border-r border-slate-200 p-1.5 sm:p-2 min-h-[120px] group transition-all cursor-pointer 
                          ${isDragOver ? 'bg-blue-50 ring-inset ring-2 ring-blue-300' : ''}
                          ${isSelected ? `${theme.light} bg-opacity-60` : 'bg-white hover:bg-slate-50'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isToday ? `${theme.color} text-white shadow-md` : 'text-slate-700'}`}>{cell.day}</span>
                          <button onClick={(e) => { e.stopPropagation(); openAddModal(cell.dateKey); }} className={`opacity-0 group-hover:opacity-100 text-slate-400 hover:${theme.text}`}><Plus size={14} /></button>
                        </div>
                        <div className="space-y-0.5">
                          {dayTasks.slice(0, 15).map((task) => (
                            <TaskItem 
                              key={task.id} 
                              task={task} 
                              theme={theme} 
                              isCompact={true} 
                              onClick={handleTaskAction} 
                              onDragStart={handleDragStart}
                            />
                          ))}
                          {dayTasks.length > 15 && <div className="text-[10px] text-slate-400 pl-1">{dayTasks.length - 15} {t.remaining}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- WEEK VIEW --- */}
              {view === 'week' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-fr min-h-full">
                  {weekDays.map((date, index) => {
                    const dateKey = formatDateKey(date);
                    const isToday = isSameDate(date, new Date());
                    const dayTasks = tasksMap[dateKey] || [];
                    const isDragOver = dragOverDate === dateKey;

                    return (
                      <div 
                        key={dateKey} 
                        onDragOver={(e) => handleDragOver(e, dateKey)}
                        onDrop={(e) => handleDrop(e, dateKey)}
                        className={`border-r border-b border-slate-200 p-3 sm:p-4 flex flex-col min-h-[180px] transition-colors
                          ${isDragOver ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                          <div><span className="text-xs font-bold text-slate-400 uppercase mr-2">{(t.weekDays || [])[index]}</span><span className={`text-lg font-bold ${isToday ? theme.text : 'text-slate-700'}`}>{date.getDate()}</span></div>
                          <button onClick={() => openAddModal(dateKey)} className={`text-slate-300 hover:${theme.text}`}><Plus size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                          {dayTasks.length > 0 ? dayTasks.map((task) => (
                             <TaskItem 
                                key={task.id} 
                                task={task} 
                                theme={theme} 
                                isCompact={false} 
                                onClick={handleTaskAction} 
                                onDelete={() => { setDeleteConfirm({show: true, taskId: task.id}); }}
                                onDragStart={handleDragStart}
                             />
                          )) : <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">{t.emptyDay}</div>}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Weekly Note Block */}
                  <NoteBlock 
                    title={t.weeklyNotes}
                    value={notes[weekStartKey]} 
                    onChange={(val) => handleNoteChange(weekStartKey, val)}
                    theme={theme}
                    placeholder={t.notesPlaceholder}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER (Month View List) */}
      {view === 'month' && (
        <div className="h-48 flex-shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex">
          <div className="w-24 sm:w-48 bg-stone-50 border-r border-slate-200 flex flex-col items-center justify-center p-2 sm:p-4 relative">
             <div className="text-2xl sm:text-4xl font-bold text-slate-800">{new Date(selectedDateKey).getDate()}</div>
             <div className="text-xs sm:text-base text-slate-500 font-medium uppercase tracking-wide text-center">{new Date(selectedDateKey).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: lang === 'zh' ? 'short' : 'long' })}</div>
             <div className="text-[10px] sm:text-xs text-slate-400 mt-1 hidden sm:block">{(tasksMap[selectedDateKey] || []).filter((t) => !t.completed).length} pending</div>
             <button onClick={() => setIsHelpModalOpen(true)} className="absolute bottom-3 left-3 text-slate-400 hover:text-slate-600 transition-colors p-1" title={t.help}><HelpCircle size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">{selectedDateKey === formatDateKey(new Date()) ? t.today : selectedDateKey}</h3>
                  <button onClick={() => openAddModal(selectedDateKey)} className={`text-sm ${theme.text} hover:${theme.light} px-3 py-1 rounded-full transition flex items-center gap-1`}><Plus size={14} /> {t.addTask}</button>
                </div>
                <div className="space-y-1">
                  {(tasksMap[selectedDateKey] || []).map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      theme={theme} 
                      onClick={handleTaskAction} 
                      onDelete={() => { setDeleteConfirm({show: true, taskId: task.id}); }}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {(tasksMap[selectedDateKey] || []).length === 0 && <div className="text-slate-400 italic py-4 text-sm">{t.emptyDay}</div>}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AuthModal 
        isOpen={showAuthModal} 
        mode={authMode} 
        setMode={setAuthMode} 
        email={authEmail} 
        setEmail={setAuthEmail} 
        password={authPassword} 
        setPassword={setAuthPassword} 
        loading={authLoading} 
        message={authMessage} 
        t={t} 
        theme={theme}
        onClose={() => setShowAuthModal(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          setAuthLoading(true); setAuthMessage('');
          try {
            if (authMode === 'signup') {
              await createUserWithEmailAndPassword(auth, authEmail, authPassword);
              setAuthMessage(t.checkEmail);
            } else {
              await signInWithEmailAndPassword(auth, authEmail, authPassword);
            }
          } catch (error) {
            let msg = error.message;
            if (msg.includes("email-already-in-use")) msg = "邮箱已被占用";
            if (msg.includes("invalid-credential")) msg = "账号或密码错误";
            alert(msg);
          } finally { setAuthLoading(false); }
        }}
      />

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-slate-800">{modalMode === 'add' ? t.addTask : t.taskDetails}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input 
                autoFocus={modalMode === 'add'} 
                type="text" 
                value={formText} 
                onChange={e => setFormText(e.target.value)} 
                // Feature 2: Quick Add on Enter
                onKeyDown={(e) => e.key === 'Enter' && saveTask()}
                placeholder={t.titlePlaceholder} 
                className="w-full text-lg font-semibold placeholder:font-normal bg-transparent border-none focus:ring-0 px-0 text-slate-800 placeholder:text-slate-300" 
              />
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                <CalendarIcon size={16} />
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="bg-transparent border-none text-slate-600 focus:ring-0 p-0 text-sm" />
              </div>
              <div className="relative">
                <textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} placeholder={t.detailsPlaceholder} rows={4} className={`w-full px-4 py-3 bg-stone-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-opacity-50 ${theme.ring} focus:border-transparent outline-none text-slate-700 text-sm resize-none`} />
                <AlignLeft className="absolute right-3 top-3 text-slate-300" size={16} />
              </div>
              <div className="flex justify-between pt-4 gap-3">
                 {modalMode === 'edit' && <button type="button" onClick={() => { setDeleteConfirm({ show: true, taskId: editingTask.id }); setIsModalOpen(false); }} className="text-red-400 hover:text-red-600 text-sm font-medium px-2">{t.delete}</button>}
                 <div className="flex gap-3 ml-auto"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition text-sm">{t.cancel}</button><button onClick={saveTask} className={`px-6 py-2 ${theme.color} ${theme.hover} text-white rounded-lg font-medium shadow-lg transition text-sm`}>{t.save}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.confirmDeleteTitle}</h3>
              <p className="text-slate-500 text-sm mb-6">{t.confirmDeleteDesc}</p>
              <div className="flex gap-3"><button onClick={() => setDeleteConfirm({ show: false, taskId: null })} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">{t.cancel}</button><button onClick={deleteTask} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-lg shadow-red-100 transition">{t.confirmButton}</button></div>
           </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-stone-50">
                <div className="flex items-center gap-2"><HelpCircle size={20} className={theme.text} /><h3 className="font-bold text-slate-800">{t.usageGuide}</h3></div>
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
