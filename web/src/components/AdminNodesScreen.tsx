import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getAllNodes, updateNode } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AlertToast } from './AlertToast';
import { ArrowLeft, Edit2, Battery, Clock, MapPin, Wifi } from 'lucide-react';

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

export default function AdminNodesScreen() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingActive, setEditingActive] = useState(true);

  // Load nodes
  useEffect(() => {
    const loadNodes = async () => {
      try {
        if (!token) return;
        setLoading(true);
        const response = await getAllNodes(token);
        setNodes(Array.isArray(response) ? response : []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNodes();
    // Poll every 30 seconds
    const interval = setInterval(loadNodes, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleEdit = (node: Node) => {
    setEditingNodeId(node.node_id);
    setEditingName(node.name);
    setEditingActive(node.active);
  };

  const handleSave = async (nodeId: string) => {
    if (!token) return;

    try {
      await updateNode(token, nodeId, {
        name: editingName,
        active: editingActive,
      });

      setNodes(nodes.map(n =>
        n.node_id === nodeId
          ? { ...n, name: editingName, active: editingActive }
          : n
      ));

      setEditingNodeId(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-red-200">
            <p>Access Denied: Admin role required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sensor Nodes</h1>
          <p className="text-white/60">Manage and configure IoT devices</p>
        </div>

        {error && <AlertToast type="error" message={error} />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-sm">Total Nodes</p>
            <p className="text-3xl font-bold">{nodes.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-sm">Online</p>
            <p className="text-3xl font-bold text-green-400">{nodes.filter(n => n.status === 'online').length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-sm">Offline</p>
            <p className="text-3xl font-bold text-red-400">{nodes.filter(n => n.status === 'offline').length}</p>
          </div>
        </div>

        {/* Nodes Table */}
        {loading ? (
          <LoadingSkeleton />
        ) : nodes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <p className="text-white/60">No nodes configured yet</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Node ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Battery</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Last Seen</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Firmware</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map(node => (
                    <tr key={node.node_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">{node.node_id}</td>
                      <td className="px-6 py-4 text-sm">
                        {editingNodeId === node.node_id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-32"
                          />
                        ) : (
                          node.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/50" />
                        {node.location_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          node.status === 'online'
                            ? 'bg-green-500/20 text-green-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                          <Wifi className="w-3 h-3 inline mr-1" />
                          {node.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Battery className="w-4 h-4 text-yellow-400" />
                          {node.battery_v.toFixed(2)}V
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(node.last_seen).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white/60">{node.firmware_version}</td>
                      <td className="px-6 py-4 text-sm">
                        {editingNodeId === node.node_id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(node.node_id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNodeId(null)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(node)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
