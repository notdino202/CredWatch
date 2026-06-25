import React from 'react';
import { ShieldCheck, UserCheck, KeyRound, Network } from 'lucide-react';

/**
 * Explainer panel detailing the privacy guarantee and k-anonymity protocol.
 */
const ExplainerCard = () => {
  return (
    <div className="bg-[#121613] border border-white/8 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(61,220,132,0.4)]" />
        <h2 className="text-xl font-semibold text-white">How is my data protected? (No-Leak Guarantee)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Point 1 */}
        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 hover:border-emerald-400/10 hover:bg-white/[0.02] transition-all">
          <div className="h-10 w-10 bg-emerald-400/10 rounded flex items-center justify-center mb-4">
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Zero Server Logs</h3>
          <p className="text-sm text-[#8aa89c] leading-relaxed">
            This system operates entirely in-memory and in session state. We do not use databases, and we never write your email address or password to disk.
          </p>
        </div>

        {/* Point 2 */}
        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 hover:border-emerald-400/10 hover:bg-white/[0.02] transition-all">
          <div className="h-10 w-10 bg-emerald-400/10 rounded flex items-center justify-center mb-4">
            <KeyRound className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">K-Anonymity Hashing</h3>
          <p className="text-sm text-[#8aa89c] leading-relaxed">
            We do not send your password anywhere. The frontend calculates its SHA-1 hash and sends only the first 5 characters (prefix) to the server. The server forwards these to the external breach database.
          </p>
        </div>

        {/* Point 3 */}
        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 hover:border-emerald-400/10 hover:bg-white/[0.02] transition-all">
          <div className="h-10 w-10 bg-emerald-400/10 rounded flex items-center justify-center mb-4">
            <Network className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Local Suffix Matching</h3>
          <p className="text-sm text-[#8aa89c] leading-relaxed">
            The database returns all leaked hash endings matching the prefix. Our backend matches the rest of the hash suffix locally. Neither the external database nor our server ever knows your actual password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplainerCard;
