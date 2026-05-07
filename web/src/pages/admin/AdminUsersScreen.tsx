import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Cpu, Edit2, Trash2, Plus, Shield, User as UserIcon, Check, X } from 'lucide-react';
import { AlertToast } from '../../components/common/AlertToast';

interface UserRecord {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  assignedNode: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
  healthConditions: string[];
}

const DEMO_NODES = ['node1', 'node2', 'node3', 'node1'];

const INITIAL_USERS: UserRecord[] = [
  {
    uid: '1', username: 'user1', displayName: 'Chirag Mehta',
    email: 'chirag@empyrean.io', role: 'user',
    assignedNode: 'node1', status: 'active',
    createdAt: '2026-04-15T08:00:00Z',
    healthConditions: ['Asthma'],
  },
  {
    uid: '2', username: 'admin1', displayName: 'System Administrator',
    email: 'admin@empyrean.io', role: 'admin',
    assignedNode: null, status: 'active',
    createdAt: '2026-04-01T00:00:00Z',
    healthConditions: [],
  },
];

function getAvatarColor(name: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f59e0b', '#22c55e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserRecord>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', displayName: '', email: '', role: 'user' as 'user' | 'admin', assignedNode: '' });

  const startEdit = (user: UserRecord) => {
    setEditingId(user.uid);
    setEditData({ role: user.role, assignedNode: user.assignedNode, status: user.status });
  };

  const saveEdit = (uid: string) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...editData } : u));
    setEditingId(null);
    setToast({ type: 'success', message: 'User updated successfully.' });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = (uid: string) => {
    setUsers(prev => prev.map(u => u.uid === uid
      ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
      : u
    ));
    setToast({ type: 'success', message: 'User status changed.' });
    setTimeout(() => setToast(null), 3000);
  };

  const createUser = () => {
    if (!newUser.username || !newUser.email) {
      setToast({ type: 'error', message: 'Username and email are required.' });
      return;
    }
    const user: UserRecord = {
      uid: Date.now().toString(),
      username: newUser.username,
      displayName: newUser.displayName || newUser.username,
      email: newUser.email,
      role: newUser.role,
      assignedNode: newUser.assignedNode || null,
      status: 'active',
      createdAt: new Date().toISOString(),
      healthConditions: [],
    };
    setUsers(prev => [...prev, user]);
    setShowCreate(false);
    setNewUser({ username: '', displayName: '', email: '', role: 'user', assignedNode: '' });
    setToast({ type: 'success', message: `User "${user.displayName}" created.` });
    setTimeout(() => setToast(null), 3000);
  };

  const assignedNodes = new Set(users.filter(u => u.assignedNode).map(u => u.assignedNode!));
  const availableNodes = DEMO_NODES.filter(n => !assignedNodes.has(n));

  return (
    <AdminLayout title="User Management">
      {toast && <div className="mb-4"><AlertToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}

      <div className="flex flex-col gap-6">
        {/* Header stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatPill label="Total Users" value={users.length} icon={Users} />
          <StatPill label="Active" value={users.filter(u => u.status === 'active').length} icon={Check} color="text-green-400" />
          <StatPill label="Disabled" value={users.filter(u => u.status === 'disabled').length} icon={X} color="text-red-400" />
          <StatPill label="Admins" value={users.filter(u => u.role === 'admin').length} icon={Shield} color="text-amber-400" />
        </div>

        {/* Create user button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Create user form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="liquid-glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5"
            >
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                New User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField label="Username" value={newUser.username} onChange={v => setNewUser(p => ({ ...p, username: v }))} />
                <InputField label="Display Name" value={newUser.displayName} onChange={v => setNewUser(p => ({ ...p, displayName: v }))} />
                <InputField label="Email" value={newUser.email} onChange={v => setNewUser(p => ({ ...p, email: v }))} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value as 'user' | 'admin' }))}
                    className="bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {newUser.role === 'user' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-white/60">Assign Node</label>
                    <select
                      value={newUser.assignedNode}
                      onChange={e => setNewUser(p => ({ ...p, assignedNode: e.target.value }))}
                      className="bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                    >
                      <option value="">— Unassigned —</option>
                      {availableNodes.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">Cancel</button>
                <button onClick={createUser} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95">Create</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users table */}
        <div className="liquid-glass rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Node</th>
                  <th className="px-6 py-4">Conditions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {users.map(user => (
                    <motion.tr
                      key={user.uid}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ backgroundColor: getAvatarColor(user.username) }}
                          >
                            {user.displayName[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{user.displayName}</p>
                            <p className="text-xs text-white/40">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {editingId === user.uid ? (
                          <select
                            value={editData.role}
                            onChange={e => setEditData(p => ({ ...p, role: e.target.value as 'user' | 'admin' }))}
                            className="bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                            user.role === 'admin'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/15'
                          }`}>
                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* Assigned node */}
                      <td className="px-6 py-4">
                        {editingId === user.uid ? (
                          <select
                            value={editData.assignedNode || ''}
                            onChange={e => setEditData(p => ({ ...p, assignedNode: e.target.value || null }))}
                            className="bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="">— Unassigned —</option>
                            {DEMO_NODES.map(n => (
                              <option key={n} value={n} disabled={assignedNodes.has(n) && n !== user.assignedNode}>{n}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {user.assignedNode ? (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/15 text-blue-300 rounded-full">
                                <Cpu className="w-3 h-3" />
                                {user.assignedNode}
                              </span>
                            ) : (
                              <span className="text-xs text-white/30 italic">None</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Health conditions */}
                      <td className="px-6 py-4">
                        {user.healthConditions.length > 0 ? (
                          <span className="text-xs text-white/50">{user.healthConditions.join(', ')}</span>
                        ) : (
                          <span className="text-xs text-white/20 italic">None set</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                            : 'bg-red-500/10 text-red-400 border border-red-500/15'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {editingId === user.uid ? (
                            <>
                              <button onClick={() => saveEdit(user.uid)} className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-all">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(user)} className="p-1.5 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-white/40 rounded-lg transition-all">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => toggleStatus(user.uid)} className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatPill({ label, value, icon: Icon, color = 'text-white' }: any) {
  return (
    <div className="liquid-glass rounded-xl p-4 flex items-center gap-3 border border-white/5">
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <p className="text-xs text-white/40 font-medium">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
      />
    </div>
  );
}
