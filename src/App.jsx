import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GraduationCap, LayoutDashboard, Users, UserPlus, Search, Bell, Settings,
  BookOpen, CalendarCheck, FileBarChart, Menu, X, Moon, Sun, Download,
  Eye, Pencil, Trash2, Plus, ChevronDown, ArrowUpRight, UserRound,
  Mail, Phone, MapPin, CalendarDays, Filter, CheckCircle2, AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'sms-students-v1';
const initialStudents = [
  { id: 'STU-2026-001', name: 'Aline Uwimana', gender: 'Female', email: 'aline.uwimana@example.com', phone: '+250 788 123 456', dob: '2005-04-12', address: 'Kigali, Rwanda', department: 'Software Development', className: 'L5 SWD', enrolled: '2026-01-12', status: 'Active' },
  { id: 'STU-2026-002', name: 'Eric Niyonzima', gender: 'Male', email: 'eric.niyonzima@example.com', phone: '+250 788 234 567', dob: '2004-09-21', address: 'Musanze, Rwanda', department: 'Accounting', className: 'L5 ACC', enrolled: '2026-01-15', status: 'Active' },
  { id: 'STU-2026-003', name: 'Divine Mukamana', gender: 'Female', email: 'divine.mukamana@example.com', phone: '+250 788 345 678', dob: '2006-02-08', address: 'Rubavu, Rwanda', department: 'Building & Construction', className: 'L4 BDC', enrolled: '2026-02-02', status: 'Active' },
  { id: 'STU-2026-004', name: 'Patrick Habimana', gender: 'Male', email: 'patrick.h@example.com', phone: '+250 788 456 789', dob: '2005-11-30', address: 'Ngororero, Rwanda', department: 'PWO', className: 'L5 PWO', enrolled: '2026-02-10', status: 'Inactive' },
  { id: 'STU-2026-005', name: 'Grace Ingabire', gender: 'Female', email: 'grace.ingabire@example.com', phone: '+250 788 567 890', dob: '2004-07-17', address: 'Huye, Rwanda', department: 'Software Development', className: 'L5 SWD', enrolled: '2026-03-01', status: 'Active' }
];

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle(callback, delay = 1200) {
  const lastRun = useRef(0);
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current < delay) return false;
    lastRun.current = now;
    callback(...args);
    return true;
  }, [callback, delay]);
}

function useKeyboardShortcuts({ onSearch, onNew, onEscape }) {
  useEffect(() => {
    const handler = (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); onSearch();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault(); onNew();
      }
      if (event.key === 'Escape') onEscape();
      if (typing && event.key !== 'Escape') return;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearch, onNew, onEscape]);
}

const blankForm = { name: '', gender: '', email: '', phone: '', dob: '', address: '', department: '', className: '', status: 'Active' };
const departments = ['Software Development', 'Accounting', 'Building & Construction', 'PWO'];
const classes = ['L3 SWD', 'L4 SWD', 'L5 SWD', 'L3 ACC', 'L4 ACC', 'L5 ACC', 'L4 BDC', 'L5 BDC', 'L4 PWO', 'L5 PWO'];

export default function App() {
  const [students, setStudents] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialStudents; }
    catch { return initialStudents; }
  });
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState('Dashboard');
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState({});
  const searchRef = useRef(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }, [students]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const openSearch = useCallback(() => { setPage('Students'); setTimeout(() => searchRef.current?.focus(), 0); }, []);
  const openNew = useCallback(() => { setEditingId(null); setForm(blankForm); setErrors({}); setShowForm(true); }, []);
  const closeModal = useCallback(() => { setShowForm(false); setSelected(null); setDeleteTarget(null); }, []);
  useKeyboardShortcuts({ onSearch: openSearch, onNew: openNew, onEscape: closeModal });

  const filtered = useMemo(() => students.filter((s) => {
    const text = debouncedQuery.toLowerCase();
    const matchesText = [s.id, s.name, s.email, s.className, s.department].some(v => String(v || '').toLowerCase().includes(text));
    return matchesText && (statusFilter === 'All' || s.status === statusFilter) && (departmentFilter === 'All' || s.department === departmentFilter);
  }), [students, debouncedQuery, statusFilter, departmentFilter]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    inactive: students.filter(s => s.status === 'Inactive').length,
    female: students.filter(s => s.gender === 'Female').length,
    male: students.filter(s => s.gender === 'Male').length
  }), [students]);

  const throttledSubmit = useThrottle((event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.gender) nextErrors.gender = 'Select a gender';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (!form.department) nextErrors.department = 'Select a department';
    if (!form.className) nextErrors.className = 'Select a class';
    if (!form.dob) nextErrors.dob = 'Date of birth is required';
    if (students.some(s => s.email.toLowerCase() === form.email.trim().toLowerCase() && s.id !== editingId)) nextErrors.email = 'This email is already registered';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...form, name: form.name.trim(), email: form.email.trim() } : s));
      setToast('Student record updated successfully');
    } else {
      const id = 'STU-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
      setStudents(prev => [{ ...form, id, name: form.name.trim(), email: form.email.trim(), enrolled: new Date().toISOString().slice(0, 10) }, ...prev]);
      setToast('Student registered successfully');
    }
    setShowForm(false); setForm(blankForm); setEditingId(null);
  }, 1000);

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({ name: student.name, gender: student.gender, email: student.email, phone: student.phone, dob: student.dob, address: student.address, department: student.department, className: student.className, status: student.status });
    setErrors({}); setShowForm(true);
  };

  const deleteStudent = () => {
    if (!deleteTarget) return;
    setStudents(prev => prev.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null); setSelected(null); setToast('Student record deleted');
  };

  const exportCsv = () => {
    const columns = ['id', 'name', 'gender', 'email', 'phone', 'department', 'className', 'status', 'enrolled'];
    const csv = [columns.join(','), ...filtered.map(s => columns.map(k => '"' + String(s[k] ?? '').replaceAll('"', '""') + '"').join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'student-records.csv'; link.click(); URL.revokeObjectURL(link.href);
  };

  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Classes', icon: BookOpen },
    { label: 'Departments', icon: GraduationCap },
    { label: 'Attendance', icon: CalendarCheck },
    { label: 'Reports', icon: FileBarChart },
    { label: 'Settings', icon: Settings }
  ];

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={mobileOpen ? 'sidebar mobile-visible' : 'sidebar'}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><b>EduManage</b><small>STUDENT PORTAL</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X/></button></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>{nav.map(item => <button key={item.label} className={page === item.label ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(item.label); setMobileOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'Students' && <span className="nav-count">{students.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><BookOpen size={18}/></div><b>Need some help?</b><p>Explore the student management guide.</p><button onClick={() => setToast('Help guide: register, search, edit and manage student records.')}>View guide <ArrowUpRight size={14}/></button></div><div className="profile"><div className="avatar">AD</div><div><b>Administrator</b><small>System admin</small></div><ChevronDown size={16}/></div></div>
      </aside>
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
      <main className="main">
        <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><button className="icon-btn theme-toggle" title="Toggle theme" onClick={() => setDark(v => !v)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-btn notification" title="Notifications" onClick={() => setToast('You are all caught up!')}><Bell size={18}/><i/></button><div className="top-avatar">AD</div></div></header>
        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow">MONDAY, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div><h1>{page === 'Dashboard' ? 'Good morning, Admin 👋' : page}</h1><p>{page === 'Dashboard' ? 'Here’s what’s happening with your students today.' : 'Manage and review your school information.'}</p></div><div className="welcome-actions"><span className="demo-pill"><i/> DEMO MODE</span><button className="primary-btn" onClick={openNew}><Plus size={17}/> Add student</button></div></div>

          {page === 'Dashboard' && <>
            <section className="stats-grid">
              <StatCard title="Total students" value={stats.total} note="Registered records" icon={Users} tone="blue"/>
              <StatCard title="Active students" value={stats.active} note="Currently enrolled" icon={CheckCircle2} tone="green"/>
              <StatCard title="Inactive students" value={stats.inactive} note="Not currently active" icon={AlertCircle} tone="orange"/>
              <StatCard title="Female students" value={stats.female} note={stats.total ? Math.round(stats.female / stats.total * 100) + '% of students' : '0% of students'} icon={UserRound} tone="purple"/>
            </section>
            <section className="dashboard-grid">
              <div className="panel enrollment-panel"><div className="panel-heading"><div><h2>Student overview</h2><p>Current student distribution</p></div><span className="period-chip">All time <ChevronDown size={14}/></span></div><div className="overview-total"><strong>{stats.total}</strong><span>total registered students</span></div><div className="bar-list">{departments.map((d, i) => { const count = students.filter(s => s.department === d).length; const pct = stats.total ? count / stats.total * 100 : 0; return <div className="bar-row" key={d}><div><span>{d}</span><b>{count}</b></div><div className="bar-track"><i style={{ width: pct + '%' }} className={'bar-' + i}/></div></div>; })}</div></div>
              <div className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Common administrator tasks</p></div></div><button className="quick-action" onClick={openNew}><span className="quick-icon blue-bg"><UserPlus/></span><span><b>Register a student</b><small>Add a new student record</small></span><ArrowUpRight size={16}/></button><button className="quick-action" onClick={openSearch}><span className="quick-icon purple-bg"><Search/></span><span><b>Find a student</b><small>Search the student directory</small></span><ArrowUpRight size={16}/></button><button className="quick-action" onClick={exportCsv}><span className="quick-icon green-bg"><Download/></span><span><b>Export records</b><small>Download student CSV</small></span><ArrowUpRight size={16}/></button></div>
            </section>
            <StudentList students={students.slice(0, 5)} onView={setSelected} onEdit={handleEdit} onDelete={setDeleteTarget} compact/>
          </>}

          {page === 'Students' && <section className="panel students-panel"><div className="panel-heading list-heading"><div><h2>All students <span className="count-badge">{students.length}</span></h2><p>View, search, edit and manage student records.</p></div><button className="secondary-btn" onClick={exportCsv}><Download size={16}/> Export CSV</button></div><div className="toolbar"><div className="search-box"><Search size={17}/><input ref={searchRef} value={query} onChange={e => { setQuery(e.target.value); setPage('Students'); }} placeholder="Search name, ID, email or class..."/><kbd>⌘ K</kbd></div><div className="filters"><label><Filter size={15}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></label><label><select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}><option>All</option>{departments.map(d => <option key={d}>{d}</option>)}</select></label></div></div><StudentList students={filtered} onView={setSelected} onEdit={handleEdit} onDelete={setDeleteTarget}/><div className="table-footer">Showing <b>{filtered.length}</b> of <b>{students.length}</b> students <span>Search uses a 350ms debounce</span></div></section>}

          {page !== 'Dashboard' && page !== 'Students' && <section className="panel placeholder-panel"><div className="placeholder-icon"><GraduationCap size={28}/></div><h2>{page} management</h2><p>This section is ready for the next development phase. Student registration and directory management are available now.</p><button className="primary-btn" onClick={() => setPage('Students')}>Go to students <ArrowUpRight size={16}/></button></section>}
          <footer className="footer"><span>© {new Date().getFullYear()} EduManage. Student Management System.</span><span>Built with React · <b>DEMO / LOCAL DATA</b></span></footer>
        </div>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}><section className="modal form-modal"><div className="modal-header"><div><span className="eyebrow">STUDENT RECORD</span><h2>{editingId ? 'Edit student' : 'Register new student'}</h2><p>Enter the student's information below.</p></div><button className="icon-btn" onClick={closeModal}><X/></button></div><form onSubmit={throttledSubmit} noValidate><div className="form-grid"><Field label="Full name" error={errors.name}><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Aline Uwimana" /></Field><Field label="Gender" error={errors.gender}><select value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></Field><Field label="Email address" error={errors.email}><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="student@example.com"/></Field><Field label="Phone number" error={errors.phone}><input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+250 7XX XXX XXX"/></Field><Field label="Date of birth" error={errors.dob}><input type="date" value={form.dob} onChange={e => setForm({...form, dob:e.target.value})}/></Field><Field label="Department" error={errors.department}><select value={form.department} onChange={e => setForm({...form, department:e.target.value})}><option value="">Select department</option>{departments.map(d=><option key={d}>{d}</option>)}</select></Field><Field label="Class" error={errors.className}><select value={form.className} onChange={e => setForm({...form, className:e.target.value})}><option value="">Select class</option>{classes.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Status"><select value={form.status} onChange={e => setForm({...form, status:e.target.value})}><option>Active</option><option>Inactive</option></select></Field><Field label="Address" wide><input value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="District, country"/></Field></div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button><button type="submit" className="primary-btn"><Plus size={16}/>{editingId ? 'Save changes' : 'Register student'}</button></div></form></section></div>}

      {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="modal detail-modal"><div className="modal-header"><div><span className="eyebrow">STUDENT PROFILE</span><h2>Student details</h2></div><button className="icon-btn" onClick={() => setSelected(null)}><X/></button></div><div className="detail-person"><div className="large-avatar">{selected.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><h3>{selected.name}</h3><span>{selected.id}</span><Status status={selected.status}/></div></div><div className="detail-grid">{[[Mail,'Email',selected.email],[Phone,'Phone',selected.phone],[GraduationCap,'Department',selected.department],[BookOpen,'Class',selected.className],[CalendarDays,'Date of birth',selected.dob],[MapPin,'Address',selected.address || 'Not provided']].map(([Icon,label,value])=><div className="detail-item" key={label}><Icon size={16}/><div><small>{label}</small><b>{value}</b></div></div>)}</div><div className="modal-actions"><button className="secondary-btn" onClick={() => { setSelected(null); handleEdit(selected); }}><Pencil size={15}/> Edit record</button><button className="primary-btn" onClick={() => setSelected(null)}>Close</button></div></section></div>}

      {deleteTarget && <div className="modal-backdrop"><section className="modal confirm-modal"><div className="confirm-icon"><Trash2/></div><h2>Delete student?</h2><p>This will permanently remove <b>{deleteTarget.name}</b> from this browser's demo records.</p><div className="modal-actions"><button className="secondary-btn" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-btn" onClick={deleteStudent}>Delete student</button></div></section></div>}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function StatCard({title,value,note,icon:Icon,tone}) { return <div className="stat-card"><div className={'stat-icon '+tone}><Icon size={20}/></div><span className="stat-title">{title}</span><strong>{value}</strong><small>{note}</small></div>; }
function Status({status}) { return <span className={status === 'Active' ? 'status active-status' : 'status inactive-status'}><i/>{status}</span>; }
function Field({label,error,wide,children}) { return <label className={'field '+(wide?'wide':'')}><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>; }

function StudentList({students,onView,onEdit,onDelete,compact=false}) {
  if (!students.length) return <div className="empty-state"><Users size={30}/><b>No students found</b><span>Try changing your search or filters, or register a new student.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT / CLASS</th><th>STATUS</th><th>ENROLLED</th><th className="align-right">ACTIONS</th></tr></thead><tbody>{students.map((student,index)=><tr key={student.id} onClick={()=>onView(student)} className="clickable-row"><td><div className="student-cell"><div className={'student-avatar avatar-'+(index%5)}>{student.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><b>{student.name}</b><small>{student.email}</small></div></div></td><td><span className="student-id">{student.id}</span></td><td><div className="class-cell"><b>{student.department}</b><small>{student.className}</small></div></td><td><Status status={student.status}/></td><td>{student.enrolled || '—'}</td><td><div className="row-actions" onClick={e=>e.stopPropagation()}><button title="View details" onClick={()=>onView(student)}><Eye size={16}/></button><button title="Edit student" onClick={()=>onEdit(student)}><Pencil size={15}/></button><button title="Delete student" className="delete-action" onClick={()=>onDelete(student)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>;
}