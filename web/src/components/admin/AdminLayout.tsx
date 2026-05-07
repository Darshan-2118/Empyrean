import { type ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-amber-950/20 z-0" />
      <div className="absolute inset-0 opacity-30 z-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)`
        }}
      />

      <AdminSidebar />

      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <AdminTopBar title={title} />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
