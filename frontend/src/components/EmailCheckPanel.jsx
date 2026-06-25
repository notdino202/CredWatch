import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCredWatchApi } from '../hooks/useCredWatchApi';
import { validateEmail } from '../utils/validators';
import RiskGauge from './RiskGauge';
import BreachTimeline from './BreachTimeline';
import LoadingState from './LoadingState';

/**
 * Panel component wrapping the email search and results visualization flow.
 */
const EmailCheckPanel = () => {
  const [emailInput, setEmailInput] = useState('');
  const [validationError, setValidationError] = useState(null);
  const { loading, error, data, execute, clear } = useCredWatchApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation check
    const valError = validateEmail(emailInput);
    if (valError) {
      setValidationError(valError);
      return;
    }

    try {
      await execute('/api/check-email', { email: emailInput.trim() });
    } catch {
      // Errors are handled inside the API hook state
    }
  };

  return (
    <section className="bg-[#121613] border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full hover:border-white/12 transition-all">
      <div className="space-y-4">
        {/* Header Title block */}
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold font-outfit text-white">Email Breach Check</h2>
        </div>
        <p className="text-sm text-[#8aa89c]">
          Verify if your email address has been compromised in public records breaches.
        </p>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2" novalidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email-input" className="text-xs font-semibold text-[#8aa89c] tracking-wider uppercase">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 font-mono">@</span>
              <input
                id="email-input"
                type="email"
                required
                disabled={loading}
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. name@domain.com"
                className="w-full bg-white/[0.02] border border-white/8 focus:border-emerald-400 focus:bg-white/[0.04] focus:ring-1 focus:ring-emerald-400/20 text-white rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
              />
            </div>
            {/* Inline validation error */}
            {validationError && (
              <span className="text-xs text-[#e2625a] font-medium mt-1">
                {validationError}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-400 hover:bg-emerald-350 disabled:bg-[#1f3328] disabled:text-white/40 active:translate-y-0 hover:-translate-y-0.5 text-black font-semibold font-outfit rounded-xl py-3.5 text-sm transition-all shadow-[0_4px_12px_rgba(61,220,132,0.15)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Analyzing...' : 'Analyze Email'}
          </button>
        </form>

        {/* Global Fetch Errors */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 text-[#e2625a] p-4 rounded-xl flex gap-3 mt-4 text-xs leading-relaxed">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingState />}

        {/* Results Panel */}
        {!loading && data && (
          <div className="mt-6 border-t border-white/5 pt-6 space-y-6 animate-fadeIn">
            {data.is_breached ? (
              <>
                <RiskGauge riskLevel={data.risk_level} breachCount={data.breach_count} />
                <BreachTimeline breaches={data.breaches} />
              </>
            ) : (
              /* Mapped Clean/Safe state display (checkmark message preference) */
              <div className="bg-[#142a1f]/30 border border-emerald-400/20 p-5 rounded-2xl flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(61,220,132,0.4)]" />
                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Secure & Safe</h4>
                  <p className="text-xs text-[#8aa89c] leading-relaxed mt-1">
                    No breaches found! This email does not appear in any cataloged database exposures.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailCheckPanel;
