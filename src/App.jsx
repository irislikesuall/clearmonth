import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
  StickyNote
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
// ✅ Firebase 配置
// ==========================================
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
// 🧩 常量定义
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
    notesPlaceholder: 'Type notes here...',
    remaining: 'more...',
    emptyDay: 'No tasks',
    confirmDeleteTitle: 'Delete Task?',
    confirmDeleteDesc: 'This action cannot be undone.',
    confirmButton: 'Yes, Delete',
    help: 'Help',
    usageGuide: 'Usage Guide',
    guideSteps: [
      { title: 'Sync Data', desc: 'Login to save data to cloud automatically.' },
      { title: 'Drag & Drop', desc: 'Drag tasks to move them between days. Drag to TOP arrows to change month.' },
      { title: 'Quick Add', desc: 'Press Enter in the title field to save immediately.' },
      { title: 'Notes', desc: 'Use the sticky note areas in Week/Month views for memos.' }
    ],
    close: 'Close',
    loading: 'Processing...',
  },
  zh: {
    appName: '清月历',
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    views: { month: '月视图', week: '周视图' },
    today: '今天',
    login: '登录',
    signup: '注册账户',
    logout: '退出',
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
      { title: '备忘录', desc: '利用月视图空白处（月初或月末）记录灵感。' }
    ],
    close: '知道啦',
    loading: '处理中...',
  }
};

const THEMES = [
  { id: 'orange', color: 'bg-orange-400', hover: 'hover:bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'focus:ring-orange-300' },
  { id: 'slate',  color: 'bg-slate-500',  hover: 'hover:bg-slate-600',  light: 'bg-slate-100',  border: 'border-slate-300',  text: 'text-slate-700',  ring: 'focus:ring-slate-300' },
  { id: 'green',  color: 'bg-emerald-400',hover: 'hover:bg-emerald-500',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',ring: 'focus:ring-emerald-300' },
  { id: 'blue',   color: 'bg-sky-400',    hover: 'hover:bg-sky-500',    light: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    ring: 'focus:ring-sky-300' },
  { id: 'red',    color: 'bg-rose-400',   hover: 'hover:bg-rose-500',   light: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: 'focus:ring-rose-300' },
  { id: 'yellow', color: 'bg-amber-400',  hover: 'hover:bg-amber-500',  light: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: 'focus:ring-amber-300' },
];

// 日期计算工具
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
// 🧱 组件定义
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

// 2. 任务项 (Draggable)
const TaskItem = ({ task, theme, isCompact, onClick, onDelete, onDragStart }) => (
  <div 
    draggable="true"
    onDragStart={(e) => {
      // 必须阻止冒泡，否则可能触发父容器点击
      e.stopPropagation();
      onDragStart(e, task);
    }}
    onClick={(e) => { e.stopPropagation(); onClick(task); }}
    className={`
      flex items-start gap-2 group cursor-grab active:cursor-grabbing 
      ${isCompact ? 'mb-1' : `mb-3 p-3 bg-white rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all`}
    `}
  >
    <div className="pt-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(task, true); }}>
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${task.completed ? `${theme.color} border-transparent` : `border-slate-300 bg-white hover:${theme.border}`}`}>
        {task.completed && <Check size={10} className="text-white" />}
      </div>
    </div>
    <div className="flex-1 min-w-0 pointer-events-none">
      <span className={`text-sm leading-tight transition-all select-none block truncate ${task.completed ? 'text-slate-400 line-through opacity-60' : 'text-slate-700'}`}>{task.text}</span>
    </div>
    {!isCompact && onDelete && (
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-300 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
    )}
  </div>
);

// 3. 备忘录
const NoteBlock = ({ title, value, onChange, theme, placeholder, type = 'week' }) => (
  <div className={`relative flex flex-col ${type === 'month' ? 'h-full bg-yellow-50/60 p-2 shadow-inner border border-yellow-100' : `border-b border-slate-200 ${theme.light} bg-opacity-30 p-3 sm:p-4 min-h-[180px]`}`}>
    <div className={`flex items-center gap-2 mb-2 ${type === 'month' ? '' : 'pb-2 border-b ' + theme.border}`}>
      <StickyNote size={type === 'month' ? 14 : 16} className={type === 'month' ? 'text-yellow-600' : theme.text} />
      <span className={`font-bold ${type === 'month' ? 'text-yellow-700 text-xs' : 'text-slate-700 text-sm'}`}>{title}</span>
    </div>
    <textarea 
      className="flex-1 w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-slate-600 placeholder:text-slate-400/50 leading-relaxed" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

// ==========================================
// 🚀 主程序
// ==========================================
function CalendarAppContent() {
  const [lang, setLang] = useState('zh'); 
  const t = TRANSLATIONS[lang];
  const [currentThemeId, setCurrentThemeId] = useState('orange');
  const theme = THEMES.find(th => th.id === currentThemeId) || THEMES[0];
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // 日历状态
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [view, setView] = useState('month'); 
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  // 数据状态
  const [tasks, setTasks] = useState([{ id: 'demo-1', date: formatDateKey(new Date()), text: '欢迎使用清月历', details: '登录后数据自动云同步', completed: false }]);
  const [notes, setNotes] = useState({}); 
  const [dataLoading, setDataLoading] = useState(false);
  
  // 用户状态
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // 弹窗状态
  const [modalMode, setModalMode] = useState('add'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formText, setFormText] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formDate, setFormDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 拖拽状态
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // 性能优化：任务映射表 O(1)
  const tasksMap = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  // Auth 监听
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setShowAuthModal(false);
    });
    return () => unsubscribe();
  }, []);

  // 数据同步
  useEffect(() => {
    if (!user) {
      const localTasks = localStorage.getItem('saas_tasks_v3');
      const localNotes = localStorage.getItem('saas_notes_v3');
      if (localTasks) try { setTasks(JSON.parse(localTasks)); } catch {}
      if (localNotes) try { setNotes(JSON.parse(localNotes)); } catch {}
      return;
    }

    setDataLoading(true);
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks'));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDataLoading(false);
    });
    // 简单同步 Notes (实际项目建议存 Firestore)
    const savedNotes = localStorage.getItem(`saas_notes_${user.uid}`);
    if (savedNotes) try { setNotes(JSON.parse(savedNotes)); } catch {}

    return () => unsub();
  }, [user]);

  // 本地存储兜底
  useEffect(() => {
    if (!user) {
      localStorage.setItem('saas_tasks_v3', JSON.stringify(tasks));
      localStorage.setItem('saas_notes_v3', JSON.stringify(notes));
    } else {
      localStorage.setItem(`saas_notes_${user.uid}`, JSON.stringify(notes));
    }
  }, [tasks, notes, user]);

  // --- 操作逻辑 ---

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(task)); 
    // 增加透明度反馈
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e, dateKey) => {
    e.preventDefault(); // 必须调用，否则无法 Drop
    e.dataTransfer.dropEffect = 'move';
    if (draggedTask && dateKey && draggedTask.date !== dateKey) {
      setDragOverDate(dateKey);
    }
  };

  const handleDrop = async (e, targetDateKey) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (draggedTask && targetDateKey && draggedTask.date !== targetDateKey) {
      const updatedTask = { ...draggedTask, date: targetDateKey };
      
      // 乐观更新
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? updatedTask : t));
      
      // 数据库更新
      if (user) {
        const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', draggedTask.id);
        await updateDoc(ref, { date: targetDateKey });
      }
    }
    setDraggedTask(null);
  };

  const handleNavDrop = (e, direction) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    let targetDate = new Date(currentDate);
    if (direction === 'prev') {
      targetDate.setMonth(targetDate.getMonth() - 1);
      targetDate.setDate(1); // 默认丢到上个月1号
    } else {
      targetDate.setMonth(targetDate.getMonth() + 1);
      targetDate.setDate(1); // 默认丢到下个月1号
    }
    const targetKey = formatDateKey(targetDate);
    
    handleDrop(e, targetKey);
    setCurrentDate(targetDate); // 跳转视图
  };

  const saveTask = async () => {
    if (!formText.trim()) return;

    if (modalMode === 'add') {
      const tempId = Date.now().toString();
      const newTask = { id: tempId, date: formDate, text: formText, details: formDetails, completed: false };
      
      setTasks(prev => [...prev, newTask]);
      setIsModalOpen(false);

      if (user) {
        try {
          const ref = await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks'), {
            ...newTask, createdAt: serverTimestamp()
          });
          setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: ref.id } : t));
        } catch (e) { console.error(e); }
      }
    } else {
      const updated = { ...editingTask, date: formDate, text: formText, details: formDetails };
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      setIsModalOpen(false);
      if (user) {
        const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', updated.id);
        await updateDoc(ref, { text: updated.text, details: updated.details, date: updated.date });
      }
    }
  };

  const deleteTask = async () => {
    if (!deleteConfirm.taskId) return;
    const id = deleteConfirm.taskId;
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm({ show: false, taskId: null });
    setIsModalOpen(false);
    if (user) await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', id));
  };

  // 生成日历格子
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayObj = getFirstDayOfMonth(year, month); // 0 (Mon) to 6 (Sun) if Mon start
  
  const monthCells = [];
  // 1. 月初空白
  for (let i = 0; i < firstDayObj; i++) monthCells.push({ type: 'empty', key: `start-${i}` });
  // 2. 日期
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    monthCells.push({ type: 'day', day, dateKey: formatDateKey(d), dateObj: d });
  }
  // 3. 月末空白 (补齐到42格或35格)
  const totalSlots = monthCells.length;
  const neededSlots = totalSlots > 35 ? 42 : 35;
  for (let i = 0; i < neededSlots - totalSlots; i++) monthCells.push({ type: 'empty', key: `end-${i}` });

  // 关键修复：计算月度备忘录的位置
  // 如果月初有空位，放第一个；如果月初没空位（周一），放月末第一个空位
  let noteSlotIndex = -1;
  if (firstDayObj > 0) {
    noteSlotIndex = 0;
  } else if (monthCells.length > daysInMonth) {
    noteSlotIndex = daysInMonth; // 月末第一个空位
  }

  const weekDays = getWeekRange(currentDate);

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-slate-800">
      
      {/* Header */}
      <header className={`flex-shrink-0 bg-white border-b ${theme.border} px-4 py-3 flex items-center justify-between shadow-sm z-20`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg ${theme.color}`}>
              {lang === 'zh' ? <span className="font-serif font-bold text-sm">月</span> : <CalendarIcon size={18} />}
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">{t.appName}</span>
          </div>
          <div className="flex items-center gap-1 bg-stone-100 rounded-full px-1.5 py-1">
             <button onClick={() => { const now = new Date(); setCurrentDate(now); setSelectedDateKey(formatDateKey(now)); }} className={`text-xs font-bold ${theme.text} hover:bg-white px-3 py-1.5 rounded-full transition shadow-sm mr-1`}>{t.today}</button>
             {/* 拖拽到箭头跨月 */}
             <button 
               onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => handleNavDrop(e, 'prev')}
               className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
             ><ChevronLeft size={16} /></button>
             <div className="relative group cursor-pointer w-24 sm:w-32 text-center">
               <span className="font-semibold text-sm select-none">{currentDate.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })}</span>
               <input type="month" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if(e.target.value) setCurrentDate(new Date(e.target.value + '-01')); }} />
             </div>
             <button 
               onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => handleNavDrop(e, 'next')}
               className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
             ><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 ${isThemeMenuOpen ? 'bg-slate-100' : ''}`}><Palette size={18} className="text-slate-500" /></button>
          {isThemeMenuOpen && (
              <div className="absolute top-16 right-20 p-3 bg-white rounded-xl shadow-xl border border-slate-100 z-30 w-48 grid grid-cols-3 gap-2">
                {THEMES.map((th) => <button key={th.id} onClick={() => { setCurrentThemeId(th.id); setIsThemeMenuOpen(false); }} className={`w-full aspect-square rounded-lg ${th.color} hover:opacity-80 ring-2 ${currentThemeId === th.id ? 'ring-slate-400' : 'ring-transparent'}`} />)}
              </div>
          )}
          
          <div className="relative hidden sm:block">
            <button onClick={() => setIsViewMenuOpen(!isViewMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">{t.views[view]} <ChevronDown size={14} /></button>
            {isViewMenuOpen && <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30">{['month', 'week'].map((v) => <button key={v} onClick={() => { setView(v); setIsViewMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:${theme.light} ${view === v ? `${theme.text} font-medium` : 'text-slate-600'}`}>{t.views[v]}</button>)}</div>}
          </div>

          <button onClick={() => { setModalMode('add'); setFormDate(selectedDateKey); setFormText(''); setFormDetails(''); setIsModalOpen(true); }} className={`w-9 h-9 ${theme.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition`}><Plus size={20} /></button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className={`w-8 h-8 ${theme.light} rounded-full flex items-center justify-center ${theme.text} font-bold border ${theme.border} text-xs`}>{user.email[0].toUpperCase()}</div>
              <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} className={`text-sm font-medium text-slate-600 hover:${theme.text}`}>{t.login}</button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {dataLoading && <div className="absolute inset-0 bg-white/50 z-40 flex items-center justify-center"><Loader2 className={`animate-spin ${theme.text}`} size={32} /></div>}
        
        <div className="flex-1 overflow-auto custom-scrollbar bg-stone-50 p-2 sm:p-4 flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Calendar Headings */}
            {view === 'month' && (
              <div className="grid grid-cols-7 border-b border-slate-200 bg-stone-50 min-w-[600px]">
                  {t.weekDays.map(day => <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">{day}</div>)}
              </div>
            )}

            {/* Grid Content */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white">
              {view === 'month' ? (
                <div className="grid grid-cols-7 auto-rows-fr min-h-full border-l border-slate-200 min-w-[600px]">
                  {monthCells.map((cell, idx) => {
                    // 渲染月度备忘录
                    if (idx === noteSlotIndex) {
                      const monthKey = formatDateKey(new Date(year, month, 1));
                      return (
                        <div key={cell.key || 'note'} className="bg-stone-50/30 border-b border-r border-slate-200 min-h-[100px]">
                          <NoteBlock 
                            type="month"
                            title={t.monthlyNotes} 
                            theme={theme} 
                            placeholder={t.notesPlaceholder}
                            value={notes[monthKey]}
                            onChange={(val) => setNotes(prev => ({ ...prev, [monthKey]: val }))}
                          />
                        </div>
                      );
                    }

                    if (cell.type === 'empty') return <div key={cell.key} className="bg-stone-50/50 border-b border-r border-slate-200 min-h-[100px]" />;

                    const dayTasks = tasksMap[cell.dateKey] || [];
                    const isToday = isSameDate(cell.dateObj, new Date());
                    const isDragTarget = dragOverDate === cell.dateKey;
                    const isSelected = selectedDateKey === cell.dateKey;

                    return (
                      <div 
                        key={cell.dateKey}
                        onClick={() => setSelectedDateKey(cell.dateKey)}
                        onDragOver={(e) => handleDragOver(e, cell.dateKey)}
                        onDrop={(e) => handleDrop(e, cell.dateKey)}
                        className={`
                          relative border-b border-r border-slate-200 p-1 sm:p-2 min-h-[120px] transition-all cursor-pointer group
                          ${isDragTarget ? 'bg-blue-50 ring-2 ring-inset ring-blue-300 z-10' : ''}
                          ${isSelected && !isDragTarget ? `${theme.light}` : 'hover:bg-slate-50'}
                        `}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isToday ? `${theme.color} text-white` : 'text-slate-700'}`}>{cell.day}</span>
                            <button onClick={(e) => { e.stopPropagation(); setModalMode('add'); setFormDate(cell.dateKey); setIsModalOpen(true); }} className={`opacity-0 group-hover:opacity-100 text-slate-400 hover:${theme.text}`}><Plus size={14} /></button>
                         </div>
                         <div className="space-y-0.5">
                            {dayTasks.map(task => (
                              <TaskItem 
                                key={task.id} 
                                task={task} 
                                theme={theme} 
                                isCompact={true} 
                                onClick={(t, toggle) => {
                                   if (toggle) {
                                     const updated = { ...t, completed: !t.completed };
                                     setTasks(prev => prev.map(pt => pt.id === t.id ? updated : pt));
                                     if(user) updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', t.id), { completed: updated.completed });
                                   } else {
                                     setEditingTask(t); setFormText(t.text); setFormDetails(t.details); setFormDate(t.date); setModalMode('edit'); setIsModalOpen(true);
                                   }
                                }}
                                onDragStart={handleDragStart}
                              />
                            ))}
                         </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-fr min-h-full">
                  {weekDays.map((date, idx) => {
                    const dateKey = formatDateKey(date);
                    const dayTasks = tasksMap[dateKey] || [];
                    const isDragTarget = dragOverDate === dateKey;
                    return (
                      <div 
                        key={dateKey} 
                        onDragOver={(e) => handleDragOver(e, dateKey)}
                        onDrop={(e) => handleDrop(e, dateKey)}
                        className={`border-r border-b border-slate-200 p-3 sm:p-4 flex flex-col min-h-[180px] transition-colors ${isDragTarget ? 'bg-blue-50' : ''}`}
                      >
                         <div className="flex justify-between mb-3 pb-2 border-b border-slate-100">
                           <div><span className="text-xs font-bold text-slate-400 mr-2">{t.weekDays[idx]}</span><span className="font-bold text-slate-700">{date.getDate()}</span></div>
                           <button onClick={() => { setModalMode('add'); setFormDate(dateKey); setIsModalOpen(true); }}><Plus size={16} className="text-slate-300 hover:text-slate-600" /></button>
                         </div>
                         <div className="space-y-2 flex-1">
                           {dayTasks.map(task => (
                             <TaskItem 
                               key={task.id} task={task} theme={theme} 
                               onClick={() => { setEditingTask(task); setFormText(task.text); setFormDetails(task.details); setFormDate(task.date); setModalMode('edit'); setIsModalOpen(true); }}
                               onDelete={() => { setDeleteConfirm({ show: true, taskId: task.id }); }}
                               onDragStart={handleDragStart}
                             />
                           ))}
                         </div>
                      </div>
                    );
                  })}
                  <NoteBlock title={t.weeklyNotes} theme={theme} value={notes[formatDateKey(weekDays[0])]} onChange={(v) => setNotes(prev => ({...prev, [formatDateKey(weekDays[0])]: v}))} placeholder={t.notesPlaceholder} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* 底部详情区 (仅月视图) */}
      {view === 'month' && (
        <div className="h-40 bg-white border-t border-slate-200 flex shrink-0">
          <div className="w-24 sm:w-40 bg-stone-50 border-r flex flex-col items-center justify-center p-4">
             <div className="text-3xl font-bold text-slate-800">{new Date(selectedDateKey).getDate()}</div>
             <div className="text-xs uppercase text-slate-500 font-bold mt-1">{new Date(selectedDateKey).toLocaleString(lang==='zh'?'zh-CN':'en-US', {weekday:'long'})}</div>
             <button onClick={() => setIsHelpModalOpen(true)} className="mt-4 text-slate-300 hover:text-slate-500"><HelpCircle size={18} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
             <div className="flex items-center justify-between mb-2">
               <h3 className="font-bold text-slate-700">{selectedDateKey}</h3>
             </div>
             <div className="space-y-1">
                {(tasksMap[selectedDateKey] || []).map(task => (
                   <TaskItem key={task.id} task={task} theme={theme} onClick={() => { setEditingTask(task); setFormText(task.text); setFormDetails(task.details); setFormDate(task.date); setModalMode('edit'); setIsModalOpen(true); }} onDelete={() => { setDeleteConfirm({ show: true, taskId: task.id }); }} onDragStart={handleDragStart} />
                ))}
                {(tasksMap[selectedDateKey] || []).length === 0 && <span className="text-slate-400 text-sm italic">{t.emptyDay}</span>}
             </div>
          </div>
        </div>
      )}

      {/* 认证弹窗 */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-2xl font-bold mb-2">{authMode === 'login' ? t.login : t.signup}</h2>
              {authMessage && <div className="text-green-600 bg-green-50 p-2 rounded mb-4 text-sm">{authMessage}</div>}
              <form onSubmit={async (e) => {
                 e.preventDefault(); setAuthLoading(true); setAuthMessage('');
                 try {
                   if (authMode === 'signup') { await createUserWithEmailAndPassword(auth, authEmail, authPassword); setAuthMessage(t.checkEmail); }
                   else { await signInWithEmailAndPassword(auth, authEmail, authPassword); }
                 } catch (err) { alert(err.message); } finally { setAuthLoading(false); }
              }} className="space-y-4">
                 <input type="email" placeholder={t.email} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required />
                 <input type="password" placeholder={t.password} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required />
                 <button disabled={authLoading} className={`w-full py-3 ${theme.color} text-white rounded-xl font-bold`}>{authLoading ? t.loading : (authMode === 'login' ? t.login : t.signup)}</button>
              </form>
              <button onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')} className="mt-4 text-sm text-slate-500 hover:underline">{authMode === 'login' ? t.switchToSignup : t.switchToLogin}</button>
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-300"><X size={20} /></button>
           </div>
        </div>
      )}

      {/* 任务弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-4 bg-stone-50 border-b flex justify-between items-center"><h3 className="font-bold">{t.taskDetails}</h3><button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button></div>
             <div className="p-6 space-y-4">
               <input 
                 autoFocus 
                 className="w-full text-lg font-bold border-none p-0 focus:ring-0 placeholder:font-normal" 
                 placeholder={t.titlePlaceholder} 
                 value={formText} 
                 onChange={e => setFormText(e.target.value)}
                 onKeyDown={(e) => {
                   // 核心修复：防止中文输入法回车误触
                   if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveTask();
                 }}
               />
               <div className="flex items-center gap-2 bg-slate-50 p-2 rounded text-sm text-slate-500"><CalendarIcon size={16} /><input type="date" className="bg-transparent border-none p-0 text-sm" value={formDate} onChange={e=>setFormDate(e.target.value)} /></div>
               <textarea className="w-full bg-stone-50 p-3 rounded-xl border-none resize-none text-sm h-32" placeholder={t.detailsPlaceholder} value={formDetails} onChange={e=>setFormDetails(e.target.value)} />
               <div className="flex justify-end gap-3 pt-2">
                 {modalMode === 'edit' && <button onClick={() => { setIsModalOpen(false); setDeleteConfirm({ show: true, taskId: editingTask.id }); }} className="text-red-400 text-sm mr-auto">{t.delete}</button>}
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 text-sm">{t.cancel}</button>
                 <button onClick={saveTask} className={`px-6 py-2 ${theme.color} text-white rounded-lg text-sm font-bold shadow-lg`}>{t.save}</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {deleteConfirm.show && (
         <div className="fixed inset-0 bg-slate-900/30 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full shadow-xl">
               <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
               <h3 className="font-bold text-lg mb-1">{t.confirmDeleteTitle}</h3>
               <p className="text-slate-500 text-sm mb-6">{t.confirmDeleteDesc}</p>
               <div className="flex gap-3">
                 <button onClick={() => setDeleteConfirm({show:false, taskId:null})} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">{t.cancel}</button>
                 <button onClick={deleteTask} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-bold shadow-red-200 shadow-lg">{t.confirmButton}</button>
               </div>
            </div>
         </div>
      )}

      {/* 帮助弹窗 */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-[70] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="p-4 border-b bg-stone-50 flex justify-between"><h3 className="font-bold flex items-center gap-2"><HelpCircle size={18} /> {t.usageGuide}</h3><button onClick={()=>setIsHelpModalOpen(false)}><X size={18} /></button></div>
              <div className="p-6 space-y-4">
                 {t.guideSteps.map((s,i) => <div key={i} className="flex gap-3"><div className={`w-6 h-6 rounded-full ${theme.color} text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>{i+1}</div><div><div className="font-bold text-sm">{s.title}</div><div className="text-xs text-slate-500">{s.desc}</div></div></div>)}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CalendarAppContent />
    </ErrorBoundary>
  );
}
