import { Sparkles, Download, Wand2, BookOpen, ArrowRight, Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TwitterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
            />

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col lg:flex-row min-h-screen w-full p-4 lg:p-6 gap-4">

                {/* Left Panel */}
                <div className="relative w-full lg:w-[52%] flex flex-col min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]">
                    <div className="liquid-glass-strong absolute inset-0 rounded-3xl" />

                    <div className="relative z-20 flex flex-col h-full p-6 lg:p-8">
                        {/* Nav */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <img src="/finallogo.png" alt="EMPYREAN Logo" className="w-full h-full object-contain drop-shadow-md" />
                                </div>
                                <span className="font-semibold text-2xl tracking-tighter text-white">EMPYREAN</span>
                            </div>
                            <button className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform">
                                <span className="text-sm font-medium">Menu</span>
                                <Menu className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Hero Center */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center mt-12 mb-12">
                            <div className="w-32 h-32 flex items-center justify-center mb-6 drop-shadow-2xl">
                                <img src="/finallogo.png" alt="EMPYREAN Logo" className="w-full h-full object-contain" />
                            </div>

                            <h1 className="text-6xl lg:text-7xl tracking-[-0.05em] text-white font-medium leading-[1.1] mb-10 max-w-2xl">
                                Breathing <br />
                                <span className="font-serif italic text-white/80">Intelligence</span> into Air Data
                            </h1>

                            <button onClick={() => navigate('/login')} className="liquid-glass-strong flex items-center gap-3 px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-transform mb-12">
                                <span className="font-medium">Explore Now</span>
                                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                                    <Download className="w-3.5 h-3.5" />
                                </div>
                            </button>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <span className="liquid-glass px-4 py-2 rounded-full text-xs text-white/80 hover:scale-105 transition-transform cursor-pointer">
                                    Artistic Gallery
                                </span>
                                <span className="liquid-glass px-4 py-2 rounded-full text-xs text-white/80 hover:scale-105 transition-transform cursor-pointer">
                                    AI Generation
                                </span>
                                <span className="liquid-glass px-4 py-2 rounded-full text-xs text-white/80 hover:scale-105 transition-transform cursor-pointer">
                                    3D Structures
                                </span>
                            </div>
                        </div>

                        {/* Bottom Quote */}
                        <div className="flex flex-col items-center text-center mt-auto">
                            <span className="text-xs tracking-widest uppercase text-white/50 mb-4">Visionary Design</span>
                            <p className="text-lg lg:text-xl text-white/90 mb-6">
                                "Where Air Meets <span className="font-serif italic">Intelligence</span> at the Highest Plane"
                            </p>
                            <div className="flex items-center gap-4 w-full max-w-[200px]">
                                <div className="h-px bg-white/20 flex-1" />
                                <span className="text-[10px] tracking-widest uppercase text-white/60 font-medium">IoT Based Air Quality Mapping System</span>
                                <div className="h-px bg-white/20 flex-1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="hidden lg:flex w-[48%] flex-col gap-6">
                    {/* Top Bar */}
                    <div className="flex items-start justify-between">
                        <div className="liquid-glass flex items-center gap-2 p-1.5 rounded-full">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white/80 hover:scale-105 transition-all">
                                <TwitterIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white/80 hover:scale-105 transition-all">
                                <LinkedinIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white/80 hover:scale-105 transition-all">
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ml-2">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <button className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform">
                            <span className="text-sm font-medium">Account</span>
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Community Card */}
                    <div className="liquid-glass w-56 p-5 rounded-3xl mt-4 hover:scale-105 transition-transform cursor-pointer">
                        <h3 className="font-medium text-white mb-1">Enter our ecosystem</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Join a community of creators and innovators building the future of AI artistry.
                        </p>
                    </div>

                    {/* Bottom Feature Section */}
                    <div className="liquid-glass mt-auto p-4 rounded-[2.5rem] flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="liquid-glass flex-1 p-5 rounded-3xl flex flex-col gap-3 hover:scale-105 transition-transform cursor-pointer group">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Wand2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-white mb-1">Processing</h4>
                                    <p className="text-xs text-white/60">Neural network analysis</p>
                                </div>
                            </div>
                            <div className="liquid-glass flex-1 p-5 rounded-3xl flex flex-col gap-3 hover:scale-105 transition-transform cursor-pointer group">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-white mb-1">Growth Archive</h4>
                                    <p className="text-xs text-white/60">Historical data patterns</p>
                                </div>
                            </div>
                        </div>

                        <div className="liquid-glass p-4 rounded-3xl flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer group">
                            <div className="w-24 h-16 rounded-2xl overflow-hidden bg-white/5 shrink-0 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=96&h=64"
                                    alt="Flower sculpture"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm text-white mb-1">Advanced Plant Sculpting</h4>
                                <p className="text-xs text-white/60">Bio-synthetic algorithms</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
