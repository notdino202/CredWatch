import React from 'react';
import Header from './components/Header';
import EmailCheckPanel from './components/EmailCheckPanel';
import PasswordCheckPanel from './components/PasswordCheckPanel';
import ExplainerCard from './components/ExplainerCard';

/**
 * Root component of the CredWatch frontend application.
 * Manages responsive layouts and grids.
 */
function App() {
  return (
    <div className="min-h-screen bg-[#0a0e0c] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <Header />
      
      {/* Dashboard Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Intro Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-white to-[#8aa89c] bg-clip-text text-transparent">
            Is your digital identity compromised?
          </h2>
          <p className="text-sm md:text-base text-[#8aa89c] leading-relaxed">
            Check if your credentials have appeared in data breaches. Your passwords are safe with us—we use advanced privacy models (k-anonymity) so your sensitive details are never sent in plaintext.
          </p>
        </div>

        {/* Grid panel for Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <EmailCheckPanel />
          <PasswordCheckPanel />
        </div>

        {/* Bottom Explainer */}
        <ExplainerCard />
      </main>

      {/* Footer bar */}
      <footer className="border-t border-white/5 bg-[#0a0e0c]/50 py-6 text-center text-xs text-[#8aa89c]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>&copy; 2026 CredWatch. Built solo for student mini-project viva demonstration.</p>
          <p className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
            Secured Local Session
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
