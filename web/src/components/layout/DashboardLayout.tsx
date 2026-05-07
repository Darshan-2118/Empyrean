import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  title: string;
  alertCount?: number;
  children: ReactNode;
}

export default function DashboardLayout({ title, alertCount = 0, children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex">
      {/* Background Video */}
      <video
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4#t=0.1"
      />

      <Sidebar />

      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar title={title} alertCount={alertCount} />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
