import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { ArrowLeft, User, Lock, LogIn, Zap, Shield } from 'lucide-react';
import { AlertToast } from './AlertToast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Post-login redirect (executed when user state changes after login)
    const handlePostLogin = (role?: string) => {
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    const doQuickLogin = async (u: string, p: string) => {
        try {
            setError('');
            await login(u, p);
            // Role determined after login resolves
            const storedUser = localStorage.getItem('empyrean_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                handlePostLogin(parsed.role);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Quick login failed';
            setError(message);
        }
    };

    const handleSubmitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            await login(username, password);
            const storedUser = localStorage.getItem('empyrean_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                handlePostLogin(parsed.role);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
            />

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col min-h-screen w-full p-4 lg:p-6 justify-center items-center">
                
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-6 left-6 liquid-glass flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="w-full max-w-md liquid-glass-strong rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl -z-10 pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 mb-4">
                            <img src="/finallogo.png" alt="EMPYREAN Logo" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tighter text-white">Welcome Back</h2>
                        <p className="text-white/60 text-sm mt-2 font-serif italic">Access the Intelligence</p>
                    </div>

                    <form onSubmit={handleSubmitLogin} className="flex flex-col gap-5">
                        {error && (
                            <AlertToast type="error" message={error} />
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-white/70 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-white/50" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all disabled:opacity-50"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-medium text-white/70">Password</label>
                                <a href="#" className="text-xs text-white/50 hover:text-white transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-white/50" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all disabled:opacity-50"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
                        >
                            <LogIn className="w-5 h-5" />
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-white/60 text-sm">
                            Don't have an account?{' '}
                            <a href="/create-account" className="text-white hover:text-purple-400 transition-colors font-medium">
                                Sign up
                            </a>
                        </p>

                        {/* ── Dev Quick Login ── */}
                        <div className="mt-1 pt-4 border-t border-white/10">
                            <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">
                                Test Accounts
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    id="quick-login-user1"
                                    onClick={() => doQuickLogin('user1', 'user1')}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-purple-500/25 bg-purple-500/8 text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/15 hover:border-purple-500/40 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Zap className="w-3 h-3" />
                                    Login as User1
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    id="quick-login-admin1"
                                    onClick={() => doQuickLogin('admin1', 'admin1')}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-500/25 bg-amber-500/8 text-amber-300/70 hover:text-amber-200 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Shield className="w-3 h-3" />
                                    Login as Admin1
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
