import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

/**
 * Header component featuring the brand name and real-time backend health check status.
 */
const Header = () => {
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (response.ok && data.status === 'ok') {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <header className="bg-[#121613]/80 backdrop-blur-md border-b border-white/8 sticky top-0 z-50 py-4">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        {/* Brand Logo Area */}
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(61,220,132,0.4)]" />
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">CredWatch</h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8aa89c]">
              Privacy-Preserving Leak Checker
            </span>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full text-xs">
          <span 
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              apiOnline === null 
                ? 'bg-slate-500 animate-pulse' 
                : apiOnline 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
            }`}
          ></span>
          <span className="text-[#8aa89c] font-medium">
            {apiOnline === null ? 'Connecting...' : apiOnline ? 'API Online' : 'API Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
