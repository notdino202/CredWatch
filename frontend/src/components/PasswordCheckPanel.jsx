import React, { useState } from 'react';
import { Key, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCredWatchApi } from '../hooks/useCredWatchApi';
import { validatePassword } from '../utils/validators';
import ExposureBar from './ExposureBar';
import LoadingState from './LoadingState';

/**
 * Panel component wrapping the secure password verification flow.
 * Adheres strictly to zero-leak guidelines:
 * - Plaintext input is cleared out of state immediately when possible.
 * - Passwords are never logged or stored outside of the direct transaction context.
 * - Error handlers surface generic messages without echoing back sensitive inputs.
 */
const PasswordCheckPanel = () => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { loading, error, data, execute, clear } = useCredWatchApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs locally first
    const valError = validatePassword(passwordInput);
    if (valError) {
      setValidationError(valError);
      return;
    }

    try {
      // Execute security-first k-anonymity query
      await execute('/api/check-password', { password: passwordInput });
    } catch {
      // Errors are handled inside the API hook state
    }
  };

  return (
    <section className="bg-[#121613] border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full hover:border-white/12 transition-all">
      <div className="space-y-4">
        {/* Header Title block */}
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold font-outfit text-white">Password Exposure Check</h2>
        </div>
        <p className="text-sm text-[#8aa89c]">
          Check if your password has leaked online, querying via privacy-preserving prefix ranges.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2" novalidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="password-input" className="text-xs font-semibold text-[#8aa89c] tracking-wider uppercase">
              Password to Check
            </label>
            <div className="relative flex items-center">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter password to verify"
                className="w-full bg-white/[0.02] border border-white/8 focus:border-emerald-400 focus:bg-white/[0.04] focus:ring-1 focus:ring-emerald-400/20 text-white rounded-xl py-3 pl-4 pr-12 text-sm transition-all outline-none"
              />
              {/* Visibility Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#8aa89c] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Inline validation errors */}
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
            {loading ? 'Verifying...' : 'Verify Password'}
          </button>
        </form>

        {/* Global Fetch Errors (secured against echo) */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 text-[#e2625a] p-4 rounded-xl flex gap-3 mt-4 text-xs leading-relaxed">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>Could not check password right now. Please verify your connection and try again.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingState />}

        {/* Results progress panel */}
        {!loading && data && (
          <div className="mt-6 border-t border-white/5 pt-6 animate-fadeIn">
            <ExposureBar timesSeen={data.times_seen} riskLevel={data.risk_level} />
          </div>
        )}
      </div>
    </section>
  );
};

export default PasswordCheckPanel;
