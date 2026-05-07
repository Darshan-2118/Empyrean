import { useEffect, useState } from 'react';
import { useAuth } from '../../services/useAuth';
import { getAllNodes, updateNode } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { AlertToast } from '../../components/common/AlertToast';
import { Map } from '../../components/map/Map';
import { Edit2, Battery, Clock, MapPin, Wifi, WifiOff, Check, X, Cpu, User as UserIcon, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Node {
  node_id: string;
  name: string;
  location_name: string;
  lat: number;
  lon: number;
  status: 'online' | 'offline';
  last_seen: string;
  firmware_version: string;
  active: boolean;
  battery_v: number;
}

const DEMO_NODES: Node[] = [
  { node_id: 'node1', name: 'RRCE', location_name: 'R.R. College of Engineering, Bangalore', lat: 12.88705, lon: 77.450153, status: 'online', last_seen: new Date().toISOString(), firmware_version: 'v2.1.4', active: true, battery_v: 3.82 },
  { node_id: 'node2', name: 'RRDCH', location_name: 'RR Dental College & Hospital, Bangalore', lat: 12.8767, lon: 77.4475, status: 'online', last_seen: new Date().toISOString(), firmware_version: 'v2.1.4', active: true, battery_v: 3.71 },
  { node_id: 'node3', name: 'RRMCH', location_name: 'RR Medical College & Hospital, Bangalore', lat: 12.896255, lon: 77.461852, status: 'online', last_seen: new Date().toISOString(), firmware_version: 'v2.0.9', active: true, battery_v: 3.61 },
];

// Simulated user→node assignment map
const NODE_ASSIGNMENTS: Record<string, string | null> = {
  'node1': 'user1 (Chirag Mehta)',
  'node2': null,
  'node3': null,
};

export default function AdminNodesScreen() {
  const { token } = useAuth();
  const isDemo = token?.startsWith('demo-token');

  const [nodes, setNodes] = useState<Node[]>(isDemo ? DEMO_NODES : []);
  const [_loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadNodes = async () => {
    if (isDemo) return;
    try {
      if (!token) return;
      const resp = await getAllNodes(token);
      setNodes(Array.isArray(resp) ? resp : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
    const iv = setInterval(loadNodes, 30000);
    return () => clearInterval(iv);
  }, [token]);

  const startEdit = (node: Node) => {
    setEditingId(node.node_id);
    setEditName(node.name || '');
    setEditActive(node.active);
  };

  const copyCoords = (node: Node) => {
    // Attempt to copy lat/lon (or coordinates if API gives that)
    const lat = node.lat ?? (node as any).coordinates?.lat ?? 0;
    const lon = node.lon ?? (node as any).coordinates?.lng ?? 0;
    navigator.clipboard.writeText(`${lat}, ${lon}`);
    setToast({ type: 'success', message: 'Coordinates copied to clipboard!' });
    setTimeout(() => setToast(null), 3000);
  };

  const saveEdit = async (nodeId: string) => {
    if (isDemo) {
      setNodes(prev => prev.map(n => n.node_id === nodeId ? { ...n, name: editName, active: editActive } : n));
      setEditingId(null);
      setToast({ type: 'success', message: 'Node updated.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      await updateNode(token!, nodeId, { name: editName, active: editActive });
      setNodes(prev => prev.map(n => n.node_id === nodeId ? { ...n, name: editName, active: editActive } : n));
      setEditingId(null);
      setToast({ type: 'success', message: 'Node updated.' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const offlineCount = nodes.filter(n => n.status !== 'online').length;
  const unassigned = nodes.filter(n => !NODE_ASSIGNMENTS[n.node_id]).length;

  return (
    <AdminLayout title="Node Management">
      {toast && <div className="mb-4"><AlertToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}
      {error && <div className="mb-4"><AlertToast type="error" message={error} /></div>}

      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock label="Total" value={nodes.length} />
          <StatBlock label="Online" value={onlineCount} color="text-green-400" />
          <StatBlock label="Offline" value={offlineCount} color="text-red-400" />
          <StatBlock label="Unassigned" value={unassigned} color={unassigned > 0 ? 'text-amber-400' : 'text-green-400'} />
        </div>

        {/* Map View */}
        <div className="liquid-glass rounded-3xl border border-white/8 overflow-hidden shadow-2xl p-2 h-[350px]">
          <Map 
            readings={nodes.map(n => ({
              node_id: n.node_id,
              lat: n.lat,
              lon: n.lon,
              temperature: 0,
              humidity: 0,
              pm25: 0,
              aqi: n.status === 'online' ? 50 : 200, // Dummy color for map
              aqi_category: n.status,
              battery_v: n.battery_v,
              timestamp: n.last_seen
            }))}
            center={[12.88705, 77.450153]} 
            zoom={12} 
          />
        </div>

        {/* Table */}
        <div className="liquid-glass rounded-3xl border border-white/8 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-6 py-5">Device</th>
                  <th className="px-6 py-5">Friendly Name</th>
                  <th className="px-6 py-5">Assigned To</th>
                  <th className="px-6 py-5">Connectivity</th>
                  <th className="px-6 py-5">Battery</th>
                  <th className="px-6 py-5">Firmware</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {nodes.map(node => (
                    <motion.tr
                      layout
                      key={node.node_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        node.status === 'offline' ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Device */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-400/70 shrink-0" />
                          <div>
                            <p className="font-mono text-xs font-bold text-white/80">{node.node_id}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-0.5">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {node.location_name || 'N/A'}</span>
                              <button 
                                onClick={() => copyCoords(node)} 
                                title="Copy Coordinates"
                                className="p-1 hover:bg-white/10 rounded transition-colors hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Friendly name */}
                      <td className="px-6 py-5">
                        {editingId === node.node_id ? (
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-sm w-full focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                        ) : (
                          <span className="font-semibold text-sm">{node.name || 'Unnamed Node'}</span>
                        )}
                      </td>

                      {/* Assigned user */}
                      <td className="px-6 py-5">
                        {NODE_ASSIGNMENTS[node.node_id] ? (
                          <span className="flex items-center gap-1.5 text-xs text-purple-300">
                            <UserIcon className="w-3 h-3" />
                            {NODE_ASSIGNMENTS[node.node_id]}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400/70 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Connectivity */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                            node.status === 'online'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                              : 'bg-red-500/10 text-red-400 border border-red-500/15'
                          }`}>
                            {node.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {node.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(node.last_seen).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>

                      {/* Battery */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Battery className={`w-4 h-4 ${node.battery_v > 3.5 ? 'text-green-400' : node.battery_v > 3.2 ? 'text-yellow-400' : 'text-red-400'}`} />
                          <span className="font-mono text-sm">{node.battery_v.toFixed(2)}V</span>
                        </div>
                      </td>

                      {/* Firmware */}
                      <td className="px-6 py-5">
                        <span className="text-xs text-white/40 font-mono">{node.firmware_version}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        {editingId === node.node_id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => saveEdit(node.node_id)} className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(node)} className="p-2 bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-white/40 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                        )}
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

function StatBlock({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="liquid-glass rounded-2xl p-5 border border-white/5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}
