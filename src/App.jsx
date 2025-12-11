import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  LogOut, 
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Palette,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Layout,
  Clock,
  StickyNote
} from 'lucide-react';

// --- Firebase Imports (Modular SDK) ---
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
// ✅ Firebase Config
// ==========================================
const firebaseConfig = {
  apiKey: (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) || "AIzaSyDZ2wqdY1uXj12mCXh58zbFuRh1TylPj88",
  authDomain: "clearmonth-fdd18.firebaseapp.com",
  projectId: "clearmonth-fdd18",
  storageBucket: "clearmonth-fdd18.firebasestorage.app",
  messagingSenderId: "586292348802",
  appId: "1:586292348802:web:1d7bf1db3ed7aaedadb19b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'clearmonth-app';

// ==========================================
// 🧩 Constants
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
    emptyDay: 'No tasks for this day',
    confirmDeleteTitle: 'Delete Task?',
    confirmDeleteDesc: 'This action cannot be undone.',
    confirmButton: 'Yes, Delete',
    help: 'Help',
    usageGuide: 'Usage Guide',
    guideSteps: [
      { title: 'Sync Data', desc: 'Login to save data to cloud automatically.' },
      { title: 'Drag & Drop', desc: 'Drag tasks to move. Multi-day tasks move as a block.' },
      { title: 'Multi-day', desc: 'Set an End Date to create tasks that span multiple days.' },
      { title: 'Task Actions', desc: 'Click checkbox to complete. Click text to edit.' }
    ],
    close: 'Close',
    loading: 'Processing...',
    startDate: 'Start',
    endDate: 'End'
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
      { title: '拖拽移动', desc: '长按任务可拖拽。跨天任务会整体移动，保持天数不变。' },
      { title: '跨天任务', desc: '新建任务时设置“结束日期”即可创建连续多天的任务。' },
      { title: '任务操作', desc: '点击方框完成任务，点击文字编辑详情。' }
    ],
    close: '知道啦',
    loading: '处理中...',
    startDate: '开始',
    endDate: '结束'
  }
};

const THEMES = [
  { id: 'orange', color: 'bg-orange-500', hover: 'hover:bg-orange-600', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'focus:ring-orange-300' },
  { id: 'slate',  color: 'bg-slate-600',  hover: 'hover:bg-slate-700',  light: 'bg-slate-100',  border: 'border-slate-300',  text: 'text-slate-700',  ring: 'focus:ring-slate-300' },
  { id: 'green',  color: 'bg-emerald-500',hover: 'hover:bg-emerald-600',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',ring: 'focus:ring-emerald-300' },
  { id: 'blue',   color: 'bg-sky-500',    hover: 'hover:bg-sky-600',    light: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    ring: 'focus:ring-sky-300' },
  { id: 'rose',   color: 'bg-rose-500',   hover: 'hover:bg-rose-600',   light: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: 'focus:ring-rose-300' },
  { id: 'amber',  color: 'bg-amber-500',  hover: 'hover:bg-amber-600',  light: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: 'focus:ring-amber-300' },
];

// Utilities
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; 
};
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
const getDayDiff = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// ==========================================
// 🧱 Components
// ==========================================

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
          <h1 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h1>
          <p className="text-red-600 mb-4">The application encountered an unexpected error.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md">Reload Application</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

const TaskItem = ({ task, theme, isCompact, onClick, onDelete, onDragStart, dayLabel }) => (
  <div 
    draggable="true"
    onDragStart={(e) => {
      e.stopPropagation();
      onDragStart(e, task);
    }}
    onClick={(e) => { e.stopPropagation(); onClick(task, false); }}
    className={`
      flex items-center gap-2 group cursor-grab active:cursor-grabbing relative overflow-hidden
      ${isCompact ? 'mb-1 py-1' : `mb-2 p-3 bg-white rounded-xl border ${theme.border} shadow-sm hover:shadow-md transition-all`}
      ${isCompact && task.isMultiDay ? 'bg-indigo-50 border border-indigo-100 rounded px-1' : ''}
      ${task.completed ? 'opacity-70' : ''}
    `}
  >
    <div 
      className="pt-0.5 cursor-pointer flex-shrink-0 z-10" 
      onClick={(e) => { e.stopPropagation(); onClick(task, true); }}
    >
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${task.completed ? `${theme.color} border-transparent` : `border-slate-300 bg-white hover:${theme.border}`}`}>
        {task.completed && <Check size={12} className="text-white" />}
      </div>
    </div>
    
    <div className="flex-1 min-w-0 pointer-events-none flex items-center gap-1.5">
      <span className={`text-sm leading-tight transition-all select-none block truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'} ${task.isMultiDay && isCompact ? 'text-indigo-700' : ''}`}>
        {task.text}
      </span>
      {dayLabel && <span className="text-[10px] text-indigo-500 font-bold flex-shrink-0 bg-indigo-50 px-1.5 py-0.5 rounded-full">{dayLabel}</span>}
    </div>

    {!isCompact && onDelete && (
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
);

const NoteBlock = ({ title, value, onChange, theme, placeholder, type = 'week' }) => (
  <div className={`relative flex flex-col h-full ${type.includes('month') ? 'bg-amber-50/50 p-2 sm:p-4 hover:bg-amber-50' : `bg-white/50 hover:bg-white`} transition-colors duration-200`}>
    <div className={`flex items-center gap-2 mb-2 ${type.includes('month') ? '' : 'pb-2 border-b border-slate-100'}`}>
      <StickyNote size={type.includes('month') ? 16 : 16} className={type.includes('month') ? 'text-amber-500' : theme.text} />
      <span className={`font-bold uppercase tracking-wide text-xs ${type.includes('month') ? 'text-amber-700' : 'text-slate-500'}`}>{title}</span>
    </div>
    <textarea 
      className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400/50 leading-relaxed custom-scrollbar" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

// ==========================================
// 🚀 Main Application
// ==========================================
function CalendarAppContent() {
  const [lang, setLang] = useState('zh'); 
  const t = TRANSLATIONS[lang];
  
  // --- 1. Theme Persistence ---
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('saas_theme_v3') || 'orange';
    }
    return 'orange';
  });
  const theme = THEMES.find(th => th.id === currentThemeId) || THEMES[0];
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('saas_theme_v3', currentThemeId);
  }, [currentThemeId]);

  // --- Calendar State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [view, setView] = useState('month'); 
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  // --- Data State ---
  const [tasks, setTasks] = useState([]); 
  const [notes, setNotes] = useState({}); 
  const [dataLoading, setDataLoading] = useState(true);
  
  const isUserLoadedRef = useRef(false);
  
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // --- Modal State ---
  const [modalMode, setModalMode] = useState('add'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formText, setFormText] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formEndDate, setFormEndDate] = useState(''); 
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // --- DND State ---
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // --- Computed Tasks Map ---
  const tasksMap = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!task.date) return;

      const startDate = new Date(task.date);
      const endDate = task.endDate ? new Date(task.endDate) : startDate;
      
      let current = new Date(startDate);
      let dayIndex = 1;
      const totalDays = getDayDiff(startDate, endDate) + 1;
      
      if (totalDays > 365) return; 

      while (current <= endDate) {
        const key = formatDateKey(current);
        if (!map[key]) map[key] = [];
        
        map[key].push({
          ...task,
          isMultiDay: totalDays > 1,
          dayLabel: totalDays > 1 ? `(${dayIndex}/${totalDays})` : null
        });
        
        current.setDate(current.getDate() + 1);
        dayIndex++;
      }
    });
    return map;
  }, [tasks]);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Data Synchronization Logic ---
  useEffect(() => {
    setDataLoading(true);
    isUserLoadedRef.current = false;

    if (!user) {
      const localTasks = localStorage.getItem('saas_tasks_v3');
      const localNotes = localStorage.getItem('saas_notes_v3');
      
      if (localTasks) {
        try { setTasks(JSON.parse(localTasks)); } catch(e) { console.error("Parse error", e); setTasks([]); }
      } else {
        setTasks([{ 
          id: 'demo-1', 
          date: formatDateKey(new Date()), 
          endDate: formatDateKey(new Date()), 
          text: lang === 'zh' ? '欢迎使用清月历' : 'Welcome to ClearMonth', 
          details: 'Data is saved locally. Log in to sync.', 
          completed: false 
        }]);
      }

      if (localNotes) {
        try { setNotes(JSON.parse(localNotes)); } catch(e) { console.error("Parse notes error", e); setNotes({}); }
      } else {
        setNotes({});
      }
      
      isUserLoadedRef.current = true;
      setDataLoading(false);

    } else {
      const userNotesKey = `saas_notes_${user.uid}`;
      const savedNotes = localStorage.getItem(userNotesKey);
      if (savedNotes) {
        try { setNotes(JSON.parse(savedNotes)); } catch { setNotes({}); }
      } else {
        setNotes({});
      }

      const tasksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks');
      const unsub = onSnapshot(tasksRef, (snap) => {
  const loadedTasks = snap.docs.map((d) => ({
    ...d.data(),     // 先展开数据
    id: d.id        // 最后用真正的 docId 覆盖掉 data 里的旧 id
  }));
  setTasks(loadedTasks);
  isUserLoadedRef.current = true;
  setDataLoading(false);
}, (err) => {
  console.error("Firestore Error:", err);
  setDataLoading(false);
});
      
      return () => unsub();
    }
  }, [user, lang]);

  useEffect(() => {
    if (!isUserLoadedRef.current) return;

    if (!user) {
      localStorage.setItem('saas_tasks_v3', JSON.stringify(tasks));
      localStorage.setItem('saas_notes_v3', JSON.stringify(notes));
    } else {
      localStorage.setItem(`saas_notes_${user.uid}`, JSON.stringify(notes));
    }
  }, [tasks, notes, user]);

  // --- Actions ---

const handleToggleTask = async (task) => {
  const newStatus = !task.completed;
  
  // 1. 乐观更新
  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newStatus } : t));

  // 2. 云端更新
  if (user) {
    try {
      const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', task.id);
      await updateDoc(ref, { completed: newStatus });
    } catch (error) {
      console.error('toggle updateDoc error:', error);
      // 回滚
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !newStatus } : t));
      alert((lang === 'zh' ? '更新失败，请检查网络：' : 'Update failed: ') + (error.code || ''));
    }
  }
};


  const handleSaveTask = async () => {
    if (!formText.trim()) return;

    const finalEndDate = formEndDate || formDate;

    // 新建任务
    if (modalMode === 'add') {
      const tempId = Date.now().toString();
      const newTask = {
        id: tempId,
        date: formDate,
        endDate: finalEndDate,
        text: formText,
        details: formDetails,
        completed: false,
      };

      // 本地乐观添加
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false);

      // 登录状态下，同步到云端
      if (user) {
        try {
          // 不把临时 id 写进 Firestore
          const { id, ...payload } = newTask;
          const docRef = await addDoc(
            collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks'),
            {
              ...payload,
              createdAt: serverTimestamp(),
            }
          );

          // 用真正的 docId 替换本地临时 id
          setTasks((prev) =>
            prev.map((t) =>
              t.id === tempId ? { ...t, id: docRef.id } : t
            )
          );
        } catch (e) {
          console.error('addDoc error:', e);
          // 回滚本地
          setTasks((prev) => prev.filter((t) => t.id !== tempId));
          alert(
            lang === 'zh'
              ? '任务保存失败，请检查网络'
              : 'Failed to save task'
          );
        }
      }

    // 编辑任务
    } else if (editingTask) {
      const updated = {
        ...editingTask,
        date: formDate,
        endDate: finalEndDate,
        text: formText,
        details: formDetails,
      };

      // 本地更新
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setIsModalOpen(false);

      // 登录状态下同步到云端
      if (user) {
        try {
          const ref = doc(
            db,
            'artifacts',
            APP_ID,
            'users',
            user.uid,
            'tasks',
            updated.id
          );
          await updateDoc(ref, {
            text: updated.text,
            details: updated.details,
            date: updated.date,
            endDate: updated.endDate,
          });
        } catch (e) {
          console.error('updateDoc error:', e);
          alert(
            lang === 'zh'
              ? '更新任务失败，请检查网络'
              : 'Failed to update task'
          );
        }
      }
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirm.taskId) return;
    const id = deleteConfirm.taskId;
    
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm({ show: false, taskId: null });
    setIsModalOpen(false);
    
    if (user) {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', id));
      } catch (e) {
        console.error("Delete failed:", e);
        alert(lang === 'zh' ? "删除失败" : "Delete failed");
      }
    }
  };

  // --- DND Logic ---

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(task)); 
  };

  const handleDragOver = (e, dateKey) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (draggedTask && dateKey && draggedTask.date !== dateKey) {
      setDragOverDate(dateKey);
    }
  };

  const handleDrop = async (e, targetDateKey) => {
  e.preventDefault();
  setDragOverDate(null);
  
  if (draggedTask && targetDateKey && draggedTask.date !== targetDateKey) {
    const oldStart = new Date(draggedTask.date);
    const newStart = new Date(targetDateKey);
    const diffTime = newStart.getTime() - oldStart.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const oldEnd = draggedTask.endDate ? new Date(draggedTask.endDate) : oldStart;
    const newEnd = new Date(oldEnd);
    newEnd.setDate(newEnd.getDate() + diffDays);
    const newEndDateKey = formatDateKey(newEnd);

    const updatedTask = { ...draggedTask, date: targetDateKey, endDate: newEndDateKey };
    
    // 乐观更新
    setTasks(prev => prev.map(t => t.id === draggedTask.id ? updatedTask : t));
    
    // 云端更新
    if (user) {
      try {
        const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', draggedTask.id);
        await updateDoc(ref, { date: targetDateKey, endDate: newEndDateKey });
      } catch (error) {
        console.error('drag-drop updateDoc error:', error);
        alert((lang === 'zh' ? '更新失败，请检查网络：' : 'Update failed: ') + (error.code || ''));
        // 回滚
        setTasks(prev => prev.map(t => t.id === draggedTask.id ? draggedTask : t));
      }
    }
  }
  setDraggedTask(null);
};
  // --- UI Helpers ---

  const openAddModal = (dateKey) => {
    setModalMode('add');
    setFormDate(dateKey || selectedDateKey);
    setFormEndDate(dateKey || selectedDateKey);
    setFormText('');
    setFormDetails('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormText(task.text);
    setFormDetails(task.details || '');
    setFormDate(task.date);
    setFormEndDate(task.endDate || task.date);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // --- Render Preparations ---

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayObj = getFirstDayOfMonth(year, month); 
  
  const startEmptyCount = firstDayObj;
  const totalDaysSoFar = startEmptyCount + daysInMonth;
  const endEmptyCount = (7 - (totalDaysSoFar % 7)) % 7;
  const useStartForNotes = startEmptyCount > 0 && startEmptyCount >= endEmptyCount;
  const useEndForNotes = !useStartForNotes && endEmptyCount > 0;
  
  const monthCells = [];
  if (useStartForNotes) {
    monthCells.push({ type: 'note', colSpan: startEmptyCount, key: 'note-start' });
  } else {
    for (let i = 0; i < startEmptyCount; i++) monthCells.push({ type: 'empty', key: `empty-start-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    monthCells.push({ type: 'day', day, dateKey: formatDateKey(d), dateObj: d });
  }
  if (useEndForNotes) {
    monthCells.push({ type: 'note', colSpan: endEmptyCount, key: 'note-end' });
  } else {
    for (let i = 0; i < endEmptyCount; i++) monthCells.push({ type: 'empty', key: `empty-end-${i}` });
  }

  const weekDays = getWeekRange(currentDate);

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Header */}
      <header className={`flex-shrink-0 bg-white border-b ${theme.border} px-4 py-3 flex items-center justify-between shadow-sm z-50 relative`}>
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => setLang((l) => l === 'en' ? 'zh' : 'en')}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${theme.color} transform group-hover:rotate-12 transition-transform duration-300`}>
              {lang === 'zh' ? <span className="font-serif font-bold text-lg">月</span> : <CalendarIcon size={20} />}
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-slate-800">{t.appName}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100/80 rounded-full px-1.5 py-1">
            <button
              onClick={() => { const now = new Date(); setCurrentDate(now); setSelectedDateKey(formatDateKey(now)); }}
              className={`text-xs font-bold ${theme.text} hover:bg-white px-3 py-1.5 rounded-full transition shadow-sm`}
            >
              {t.today}
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="relative group cursor-pointer w-28 text-center">
              <span className="font-semibold text-sm select-none">
                {currentDate.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })}
              </span>
              <input
                type="month"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => { if(e.target.value) setCurrentDate(new Date(e.target.value + '-01')); }}
              />
            </div>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className={`p-1.5 hover:bg-white rounded-full transition text-slate-500 hover:${theme.text}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors ${isThemeMenuOpen ? 'bg-slate-100' : ''}`}
            >
              <Palette size={18} className="text-slate-500" />
            </button>
            {isThemeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>
                <div className="absolute top-12 right-0 p-3 bg-white rounded-xl shadow-xl border border-slate-100 z-50 w-48 grid grid-cols-3 gap-2 animate-in fade-in zoom-in-95 duration-200">
                  {THEMES.map((th) => (
                    <button 
                      key={th.id} 
                      onClick={() => { setCurrentThemeId(th.id); setIsThemeMenuOpen(false); }} 
                      className={`w-full aspect-square rounded-lg ${th.color} hover:opacity-80 ring-2 ring-offset-1 transition-all ${currentThemeId === th.id ? 'ring-slate-400 scale-105' : 'ring-transparent'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
            >
              {view === 'month' ? <Layout size={16} /> : <Clock size={16} />}
              <span className="hidden sm:inline">{t.views[view]}</span>
              <ChevronDown size={14} />
            </button>
            {isViewMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsViewMenuOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {['month', 'week'].map((v) => (
                    <button
                      key={v}
                      onClick={() => { setView(v); setIsViewMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:${theme.light} ${view === v ? `${theme.text} font-bold` : 'text-slate-600'}`}
                    >
                      {t.views[v]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => openAddModal(selectedDateKey)}
            className={`hidden sm:flex items-center gap-1 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition active:scale-95`}
          >
            <Plus size={16} /> {t.addTask}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 ml-1">
              <div className={`w-8 h-8 ${theme.light} rounded-full flex items-center justify-center ${theme.text} font-bold border ${theme.border} text-xs shadow-inner`}>
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
              className={`text-sm font-bold ${theme.text} hover:opacity-80 ml-2 whitespace-nowrap`}
            >
              {t.login}
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {dataLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className={`animate-spin ${theme.text}`} size={40} />
              <span className="text-sm font-medium text-slate-500">{t.loading}</span>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto bg-stone-50 p-2 sm:p-4 custom-scrollbar">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-w-[800px] min-h-full">
            
            {/* Calendar Headings (Sticky) */}
            {view === 'month' && (
              <div className="grid grid-cols-7 border-b border-slate-200 bg-stone-50 sticky top-0 z-20 rounded-t-xl">
                {t.weekDays.map((day) => (
                  <div key={day} className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Grid Content */}
            <div className="bg-white flex-1 relative">
              {view === 'month' ? (
                <div className="grid grid-cols-7 border-l border-slate-200 min-h-full auto-rows-fr">
                  {monthCells.map((cell) => {
                    if (cell.type === 'note') {
                      const monthKey = formatDateKey(new Date(year, month, 1));
                      return (
                        <div
                          key={cell.key}
                          style={{ gridColumn: `span ${cell.colSpan}` }}
                          className="border-b border-r border-slate-200 min-h-[140px] relative"
                        >
                          <NoteBlock 
                            type="month-large"
                            title={t.monthlyNotes} 
                            theme={theme} 
                            placeholder={t.notesPlaceholder}
                            value={notes[monthKey]}
                            onChange={(val) => handleNoteChange(monthKey, val)}
                          />
                        </div>
                      );
                    }
                    
                    if (cell.type === 'empty') {
                      return (
                        <div
                          key={cell.key}
                          className="bg-stone-50/30 border-b border-r border-slate-200 min-h-[140px]"
                        />
                      );
                    }

                    const c = cell;
                    const dayTasks = tasksMap[c.dateKey] || [];
                    const isToday = isSameDate(c.dateObj, new Date());
                    const isDragTarget = dragOverDate === c.dateKey;
                    const isSelected = selectedDateKey === c.dateKey;

                    return (
                      <div 
                        key={c.dateKey}
                        onClick={() => setSelectedDateKey(c.dateKey)}
                        onDragOver={(e) => handleDragOver(e, c.dateKey)}
                        onDrop={(e) => handleDrop(e, c.dateKey)}
                        className={`
                          relative border-b border-r border-slate-200 p-2 min-h-[140px] transition-all cursor-pointer group flex flex-col
                          ${isDragTarget ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-300 z-10' : ''}
                          ${isSelected && !isDragTarget ? `${theme.light}` : 'hover:bg-slate-50'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span
                            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                              isToday
                                ? `${theme.color} text-white shadow-md scale-110`
                                : 'text-slate-600 group-hover:bg-white group-hover:shadow-sm'
                            }`}
                          >
                            {c.day}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openAddModal(c.dateKey); }}
                            className={`opacity-0 group-hover:opacity-100 text-slate-400 hover:${theme.text} transition-opacity p-1`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="space-y-1 flex-1">
                          {dayTasks.map((task) => (
                            <TaskItem 
                              key={task.id} 
                              task={task} 
                              theme={theme} 
                              isCompact={true}
                              dayLabel={task.dayLabel} 
                              onClick={(t, isToggle) => {
                                if (isToggle) {
                                  handleToggleTask(t);
                                } else {
                                  openEditModal(t);
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
                // Week View
                <div className="grid grid-cols-4 min-h-full auto-rows-fr">
                  {weekDays.map((date, idx) => {
                    const dateKey = formatDateKey(date);
                    const dayTasks = tasksMap[dateKey] || [];
                    const isDragTarget = dragOverDate === dateKey;
                    const isToday = isSameDate(date, new Date());
                    const weekKey = formatDateKey(weekDays[0]);
                    return (
                      <React.Fragment key={dateKey}>
                        <div 
                          onDragOver={(e) => handleDragOver(e, dateKey)}
                          onDrop={(e) => handleDrop(e, dateKey)}
                          className={`border-r border-b border-slate-200 p-4 flex flex-col min-h-[300px] transition-colors ${isDragTarget ? 'bg-indigo-50' : ''} ${isToday ? theme.light : ''}`}
                        >
                          <div className="flex justify-between mb-4 pb-2 border-b border-slate-200/50 items-end">
                            <div>
                              <span className="text-xs font-bold text-slate-400 mr-2 uppercase">
                                {t.weekDays[idx]}
                              </span>
                              <span className={`text-xl font-bold ${isToday ? theme.text : 'text-slate-700'}`}>
                                {date.getDate()}
                              </span>
                            </div>
                            <button
                              onClick={() => openAddModal(dateKey)}
                              className="p-1 hover:bg-white rounded-full"
                            >
                              <Plus size={18} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          <div className="space-y-3 flex-1">
                            {dayTasks.map((task) => (
                              <TaskItem 
                                key={task.id} 
                                task={task} 
                                theme={theme} 
                                dayLabel={task.dayLabel}
                                onClick={(t, isToggle) => {
                                  if (isToggle) handleToggleTask(t);
                                  else openEditModal(t);
                                }}
                                onDelete={() => { setDeleteConfirm({ show: true, taskId: task.id }); }}
                                onDragStart={handleDragStart}
                              />
                            ))}
                          </div>
                        </div>
                        {idx === 3 && (
                          <div className="border-r border-b border-slate-200 p-0 flex flex-col min-h-[300px]">
                            <NoteBlock 
                              title={t.weeklyNotes} 
                              theme={theme} 
                              value={notes[weekKey]} 
                              onChange={(v) => handleNoteChange(weekKey, v)} 
                              placeholder={t.notesPlaceholder} 
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ✅ 底部详情 Panel —— 已经放进日历容器里了 */}
            {view === 'month' && (
              <div className="mt-3 h-64 bg-white border-t border-slate-200 flex shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] relative">
                <div className="w-24 sm:w-56 bg-stone-50 border-r border-slate-200 flex flex-col items-center justify-center p-4 gap-2">
                  <span className="text-5xl sm:text-6xl font-bold text-slate-800 tracking-tighter">
                    {new Date(selectedDateKey).getDate()}
                  </span>
                  <span className="text-xs sm:text-sm uppercase text-slate-500 font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {new Date(selectedDateKey).toLocaleString(lang==='zh'?'zh-CN':'en-US', {weekday:'long'})}
                  </span>
                  <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="mt-4 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <HelpCircle size={20} />
                  </button>
                </div>
                <div className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                      <span className="w-2 h-6 rounded-full bg-slate-800"></span>
                      {selectedDateKey}
                    </h3>
                    <button
                      onClick={() => openAddModal(selectedDateKey)}
                      className={`text-sm font-bold text-white ${theme.color} px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2 shadow-md shadow-indigo-100`}
                    >
                      <Plus size={16} /> {t.addTask}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(tasksMap[selectedDateKey] || []).map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        theme={theme} 
                        dayLabel={task.dayLabel}
                        onClick={(t, isToggle) => {
                          if (isToggle) handleToggleTask(t);
                          else openEditModal(t);
                        }}
                        onDelete={() => { setDeleteConfirm({ show: true, taskId: task.id }); }} 
                        onDragStart={handleDragStart} 
                      />
                    ))}
                    {(tasksMap[selectedDateKey] || []).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <CalendarIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">{t.emptyDay}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Bottom Details Panel */}
      {view === 'month' && (
        <div className="h-64 bg-white border-t border-slate-200 flex shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-30 relative">
          <div className="w-24 sm:w-56 bg-stone-50 border-r border-slate-200 flex flex-col items-center justify-center p-4 gap-2">
            <span className="text-5xl sm:text-6xl font-bold text-slate-800 tracking-tighter">
              {new Date(selectedDateKey).getDate()}
            </span>
            <span className="text-xs sm:text-sm uppercase text-slate-500 font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {new Date(selectedDateKey).toLocaleString(lang==='zh'?'zh-CN':'en-US', {weekday:'long'})}
            </span>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="mt-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                <span className="w-2 h-6 rounded-full bg-slate-800"></span>
                {selectedDateKey}
              </h3>
              <button
                onClick={() => openAddModal(selectedDateKey)}
                className={`text-sm font-bold text-white ${theme.color} px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2 shadow-md shadow-indigo-100`}
              >
                <Plus size={16} /> {t.addTask}
              </button>
            </div>
            <div className="space-y-3">
              {(tasksMap[selectedDateKey] || []).map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  theme={theme} 
                  dayLabel={task.dayLabel}
                  onClick={(t, isToggle) => {
                    if (isToggle) handleToggleTask(t);
                    else openEditModal(t);
                  }}
                  onDelete={() => { setDeleteConfirm({ show: true, taskId: task.id }); }} 
                  onDragStart={handleDragStart} 
                />
              ))}
              {(tasksMap[selectedDateKey] || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <CalendarIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">{t.emptyDay}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">
              {authMode === 'login' ? t.login : t.signup}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {authMode === 'login' ? t.loginDesc : t.signupDesc}
            </p>
            
            {authMessage && (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-4 text-sm font-medium">
                {authMessage}
              </div>
            )}
            
            <form
              onSubmit={async (e) => {
                e.preventDefault(); 
                setAuthLoading(true); 
                setAuthMessage('');
                try {
                  if (authMode === 'signup') { 
                    await createUserWithEmailAndPassword(auth, authEmail, authPassword); 
                    setAuthMessage(t.checkEmail); 
                  } else { 
                    await signInWithEmailAndPassword(auth, authEmail, authPassword); 
                  }
                } catch (err) { 
                  alert(err.message); 
                } finally { 
                  setAuthLoading(false); 
                }
              }}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder={t.email}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                value={authEmail}
                onChange={e=>setAuthEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder={t.password}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                value={authPassword}
                onChange={e=>setAuthPassword(e.target.value)}
                required
              />
              <button
                disabled={authLoading}
                className={`w-full py-3 ${theme.color} text-white rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-indigo-100 disabled:opacity-50`}
              >
                {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'login' ? t.login : t.signup)}
              </button>
            </form>
            <button
              onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
              className="mt-6 text-sm text-slate-500 hover:text-slate-800 font-medium underline decoration-slate-300 underline-offset-4"
            >
              {authMode === 'login' ? t.switchToSignup : t.switchToLogin}
            </button>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="p-4 bg-stone-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-700">{t.taskDetails}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <input 
                  autoFocus 
                  className="w-full text-xl font-bold border-none p-0 focus:ring-0 placeholder:font-normal placeholder:text-slate-300 text-slate-800 bg-transparent" 
                  placeholder={t.titlePlaceholder} 
                  value={formText} 
                  onChange={e => setFormText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveTask();
                  }}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">
                    {t.startDate}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg text-sm text-slate-600 border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-all">
                    <CalendarIcon size={16} className="text-slate-400" />
                    <input
                      type="date"
                      className="bg-transparent border-none p-0 text-sm w-full focus:ring-0"
                      value={formDate}
                      onChange={e=>setFormDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">
                    {t.endDate}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg text-sm text-slate-600 border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-all">
                    <CalendarIcon size={16} className="text-slate-400" />
                    <input
                      type="date"
                      className="bg-transparent border-none p-0 text-sm w-full focus:ring-0"
                      value={formEndDate}
                      onChange={e=>setFormEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">
                  Description
                </label>
                <textarea 
                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 resize-none text-sm h-32 transition-all" 
                  placeholder={t.detailsPlaceholder} 
                  value={formDetails} 
                  onChange={e=>setFormDetails(e.target.value)} 
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {modalMode === 'edit' ? (
                  <button
                    onClick={() => { setIsModalOpen(false); setDeleteConfirm({ show: true, taskId: editingTask.id }); }}
                    className="text-red-400 text-sm font-medium hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={16} /> {t.delete}
                  </button>
                ) : <div></div>}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSaveTask}
                    className={`px-6 py-2 ${theme.color} text-white rounded-lg text-sm font-bold shadow-md hover:brightness-110 transition-all transform active:scale-95`}
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/30 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{t.confirmDeleteTitle}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{t.confirmDeleteDesc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({show:false, taskId:null})}
                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-colors"
              >
                {t.confirmButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b bg-stone-50 flex justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-700">
                <HelpCircle size={18} /> {t.usageGuide}
              </h3>
              <button onClick={()=>setIsHelpModalOpen(false)}>
                <X size={18} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {t.guideSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full ${theme.color} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-0.5`}>
                    {i+1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 mb-0.5">{s.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
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
