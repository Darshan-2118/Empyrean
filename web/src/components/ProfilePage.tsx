import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../services/useAuth';
import DashboardLayout from './DashboardLayout';
import { AlertToast } from './AlertToast';
import { ConditionSelector } from './ConditionSelector';
import { Camera, Save, Shield, Clock, Mail, User as UserIcon, Cpu, Heart } from 'lucide-react';

// ── Image compression via canvas ──
async function compressImage(file: File, maxPx = 256, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Avatar color (deterministic) ──
function getAvatarColor(name: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
}

const SAVE_COOLDOWN = 5000;

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const username = user?.username || 'user';
  const displayName = user?.displayName || username;
  const fileRef = useRef<HTMLInputElement>(null);

  // Auxiliary fields (phone, bio) that only live in empyrean_profile
  const storedAux = (() => {
    try { return JSON.parse(localStorage.getItem('empyrean_profile') || '{}'); } catch { return {}; }
  })();

  // Identity fields (fullName, email, avatar) always come from the auth context —
  // it is the SINGLE SOURCE OF TRUTH.  phone/bio come from empyrean_profile only.
  const [profile, setProfile] = useState<ProfileData>({
    fullName: displayName,
    email: user?.email || `${username}@empyrean.io`,
    phone: storedAux.phone || '+91 98765 43210',
    bio: storedAux.bio || 'IoT air quality monitoring enthusiast.',
    avatar: user?.avatar || '',
  });

  const [conditions, setConditions] = useState<string[]>(user?.healthConditions || []);
  // Snapshot for dirty-checking — must be set AFTER profile is initialized
  const [original, setOriginal] = useState<ProfileData>(() => ({
    fullName: displayName,
    email: user?.email || `${username}@empyrean.io`,
    phone: storedAux.phone || '+91 98765 43210',
    bio: storedAux.bio || 'IoT air quality monitoring enthusiast.',
    avatar: user?.avatar || '',
  }));
  const [originalConditions, setOriginalConditions] = useState<string[]>(conditions);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSave, setLastSave] = useState(0);

  // Keep identity fields in sync with the auth context (e.g. after a save
  // propagates through updateUserProfile, or if another tab changes the user).
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      fullName: user?.displayName || prev.fullName,
      email:    user?.email    || prev.email,
      avatar:   user?.avatar   ?? prev.avatar,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.displayName, user?.email, user?.avatar]);

  useEffect(() => {
    const profileDirty = JSON.stringify(profile) !== JSON.stringify(original);
    const conditionsDirty = JSON.stringify(conditions) !== JSON.stringify(originalConditions);
    setDirty(profileDirty || conditionsDirty);
  }, [profile, original, conditions, originalConditions]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const updateField = (key: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Image must be under 5 MB.' });
      return;
    }

    try {
      const compressed = await compressImage(file, 256, 0.7);
      updateField('avatar', compressed);
      setToast({ type: 'success', message: 'Photo updated (will save with profile).' });
    } catch {
      setToast({ type: 'error', message: 'Failed to process image.' });
    }
  };

  const handleSave = () => {
    const now = Date.now();
    if (now - lastSave < SAVE_COOLDOWN) {
      const wait = Math.ceil((SAVE_COOLDOWN - (now - lastSave)) / 1000);
      setToast({ type: 'error', message: `Please wait ${wait}s before saving again.` });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      // Persist only the aux fields (phone/bio) to empyrean_profile.
      // Identity fields go exclusively into the auth context (empyrean_user)
      // so there is one canonical store and no drift between pages.
      const aux = { phone: profile.phone, bio: profile.bio };
      localStorage.setItem('empyrean_profile', JSON.stringify(aux));
      // Auth context is updated → empyrean_user is written → every component
      // that calls useAuth() re-renders with the correct, unified values.
      updateUserProfile({
        displayName: profile.fullName,
        email: profile.email,
        healthConditions: conditions,
        avatar: profile.avatar,
      });
      localStorage.setItem('empyrean_health_conditions', JSON.stringify(conditions));
      setOriginal(profile);
      setOriginalConditions(conditions);
      setLastSave(Date.now());
      setSaving(false);
      setToast({ type: 'success', message: 'Profile saved successfully!' });
    }, 600);
  };

  const createdDate = '2026-04-15T08:00:00Z';
  const lastLogin = new Date().toISOString();
  const avatarColor = getAvatarColor(username);

  return (
    <DashboardLayout title="Profile" alertCount={2}>
      {toast && (
        <div className="mb-4">
          <AlertToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar card */}
        <div className="liquid-glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="relative group">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl text-4xl font-bold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {username[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold">{profile.fullName}</h2>
            <p className="text-white/50 text-sm capitalize">{user?.role || 'user'}</p>
          </div>

          {/* Node assignment badge */}
          {user?.assignedNode && (
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Assigned Node</p>
                <p className="text-sm font-bold text-blue-200">{user.assignedNode}</p>
              </div>
            </div>
          )}

          <div className="w-full space-y-3 mt-2 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Shield className="w-4 h-4 text-green-400 shrink-0" />
              <span>Account created</span>
              <span className="ml-auto text-white/80">{new Date(createdDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Last login</span>
              <span className="ml-auto text-white/80">{new Date(lastLogin).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="liquid-glass rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-semibold border-b border-white/10 pb-3">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/70 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Full Name</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/70">Username</label>
                <input
                  value={username}
                  disabled
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/70 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/70">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Health Conditions */}
          <div className="liquid-glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Heart className="w-5 h-5 text-pink-400" />
              <div>
                <h3 className="text-lg font-semibold leading-none">Health Conditions</h3>
                <p className="text-xs text-white/40 mt-1">Personalizes your air quality alerts and thresholds</p>
              </div>
            </div>

            <ConditionSelector
              selected={conditions}
              onChange={setConditions}
              placeholder="Search and select your health conditions..."
            />

            {conditions.length > 0 && (
              <p className="text-xs text-white/40">
                {conditions.length} condition{conditions.length > 1 ? 's' : ''} selected — stricter AQI warnings are enabled for your profile.
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : dirty ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
