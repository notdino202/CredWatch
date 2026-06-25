import React, { useEffect, useState } from 'react';

/**
 * Horizontal Progress Bar representing password leak severity.
 * Fills dynamically based on exposure threat level:
 * - Safe: 5% (thin sliver)
 * - Weak: 45%
 * - Highly Compromised: 95%
 */
const ExposureBar = ({ timesSeen = 0, riskLevel = "Safe" }) => {
  const [fillPercent, setFillPercent] = useState(0);

  // Map levels to target visual widths
  const getTargetPercent = (level) => {
    switch (level.toLowerCase()) {
      case 'safe':
        return 5;
      case 'weak':
        return 45;
      case 'highly compromised':
      case 'highly-compromised':
        return 95;
      default:
        return 5;
    }
  };

  // Select color profiles
  const getColorProfile = (level) => {
    switch (level.toLowerCase()) {
      case 'safe':
        return {
          fill: 'bg-[#3ddc84]',
          text: 'text-emerald-400',
          desc: 'This password has not appeared in any known breaches.'
        };
      case 'weak':
        return {
          fill: 'bg-[#e0a030]',
          text: 'text-amber-400',
          desc: 'This password has been leaked occasionally. Change it to secure your accounts.'
        };
      case 'highly compromised':
      case 'highly-compromised':
        return {
          fill: 'bg-[#e2625a]',
          text: 'text-red-400',
          desc: 'Avoid using this password! It is extremely common and widely compromised.'
        };
      default:
        return {
          fill: 'bg-[#3ddc84]',
          text: 'text-emerald-400',
          desc: 'This password has not appeared in any known breaches.'
        };
    }
  };

  const targetWidth = getTargetPercent(riskLevel);
  const profile = getColorProfile(riskLevel);

  useEffect(() => {
    // Reset to empty state to ensure animation re-triggers on input swaps
    setFillPercent(0);
    
    // Trigger transition to target percentage
    const timer = setTimeout(() => {
      setFillPercent(targetWidth);
    }, 50);

    return () => clearTimeout(timer);
  }, [riskLevel, targetWidth]);

  return (
    <div className="w-full mt-4 p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
      {/* Metric details label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="text-xs text-[#8aa89c] font-medium uppercase tracking-wider">
          Exposure Statistics
        </span>
        <span className="text-xs font-mono font-bold text-white">
          Seen <span className={profile.text}>{Number(timesSeen).toLocaleString()}</span> times
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${profile.fill}`}
          style={{ width: `${fillPercent}%` }}
        ></div>
      </div>

      {/* Explanatory description summary */}
      <p className="text-xs text-[#8aa89c] leading-relaxed">
        <strong className={`font-semibold uppercase tracking-wide mr-1 ${profile.text}`}>
          {riskLevel}:
        </strong> 
        {profile.desc}
      </p>
    </div>
  );
};

export default ExposureBar;
