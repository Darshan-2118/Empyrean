import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Sliders, Save, RotateCcw, Cpu, AlertTriangle } from 'lucide-react';
import { AlertToast } from '../../components/common/AlertToast';
import { DEFAULT_THRESHOLDS, type Threshold } from '../../constants/thresholds';


const NODES = ['Global (All Nodes)', 'node1', 'node2', 'node3'];

export default function AdminThresholds() {
  const [selectedNode, setSelectedNode] = useState('Global (All Nodes)');
  const [thresholds, setThresholds] = useState<Threshold[]>(DEFAULT_THRESHOLDS);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateThreshold = (idx: number, field: 'warning' | 'critical', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, [field]: num } : t));
    setDirty(true);
  };

  const save = () => {
    // In production: write to Firestore per-node thresholds
    setDirty(false);
    setToast({ type: 'success', message: `Thresholds saved for ${selectedNode}.` });
    setTimeout(() => setToast(null), 4000);
  };

  const reset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setDirty(false);
    setToast({ type: 'success', message: 'Thresholds reset to defaults.' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AdminLayout title="Global Thresholds">
      {toast && <div className="mb-4"><AlertToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}

      <div className="flex flex-col gap-6">
        {/* Info */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-500/8 border border-amber-500/20 rounded-2xl text-sm text-amber-200/80">
          <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
          Set sensor alert trigger limits per node. Warning = early notice; Critical = immediate action.
          These thresholds apply to operational alerts only — user health-based thresholds are applied client-side.
        </div>

        {/* Node selector */}
        <div className="flex items-center gap-3">
          <Cpu className="w-4 h-4 text-white/40" />
          <label className="text-sm text-white/60">Apply to:</label>
          <div className="flex flex-wrap gap-2">
            {NODES.map(n => (
              <button
                key={n}
                onClick={() => setSelectedNode(n)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedNode === n
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                    : 'bg-white/5 border-white/8 text-white/50 hover:text-white hover:bg-white/8'
                }`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Thresholds table */}
        <div className="liquid-glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-6 py-4">Parameter</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-yellow-400/70">
                      <AlertTriangle className="w-3 h-3" /> Warning
                    </span>
                  </th>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-red-400/70">
                      <AlertTriangle className="w-3 h-3" /> Critical
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {thresholds.map((t, idx) => (
                  <tr key={t.parameter} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm">{t.parameter}</p>
                        {t.unit && <p className="text-xs text-white/40">{t.unit}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-white/50 max-w-xs">{t.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-28">
                        <input
                          type="number"
                          step="0.1"
                          value={t.warning}
                          onChange={e => updateThreshold(idx, 'warning', e.target.value)}
                          className="w-full bg-yellow-500/8 border border-yellow-500/20 rounded-lg py-2 px-3 text-sm text-yellow-200 font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all"
                        />
                        {t.unit && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-yellow-300/40 pointer-events-none">{t.unit}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-28">
                        <input
                          type="number"
                          step="0.1"
                          value={t.critical}
                          onChange={e => updateThreshold(idx, 'critical', e.target.value)}
                          className="w-full bg-red-500/8 border border-red-500/20 rounded-lg py-2 px-3 text-sm text-red-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500/40 transition-all"
                        />
                        {t.unit && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-300/40 pointer-events-none">{t.unit}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-semibold rounded-xl text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            Save Thresholds
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
