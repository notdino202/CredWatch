import React, { useEffect, useState } from 'react';

/**
 * Custom Speedometer-style SVG Arc gauge displaying credential risk levels.
 * Maps categorical risk scores onto illustrative fill percentages:
 * - Safe: ~20% fill
 * - Moderate: ~50% fill
 * - High: ~90% fill
 */
const RiskGauge = ({ riskLevel = "Safe", breachCount = 0 }) => {
  const [animatedOffset, setAnimatedOffset] = useState(125.66); // Default to empty state (offset = arc length)
  
  // Total circumference length of the arc (r=40, from 180deg to 0deg -> PI * r = 125.66)
  const arcLength = 125.66;

  // Map categorical levels to fill percentage
  const getPercentage = (level) => {
    switch (level.toLowerCase()) {
      case 'safe':
        return 0.20;
      case 'moderate':
      case 'weak':
        return 0.50;
      case 'high':
      case 'highly compromised':
      case 'highly-compromised':
        return 0.90;
      default:
        return 0.20;
    }
  };

  // Select color configurations matching visual specifications
  const getColorScheme = (level) => {
    switch (level.toLowerCase()) {
      case 'safe':
        return {
          stroke: '#3ddc84',
          text: 'text-emerald-400',
          baseStroke: '#142a1f'
        };
      case 'moderate':
      case 'weak':
        return {
          stroke: '#e0a030',
          text: 'text-amber-400',
          baseStroke: '#2d2210'
        };
      case 'high':
      case 'highly compromised':
      case 'highly-compromised':
        return {
          stroke: '#e2625a',
          text: 'text-red-400',
          baseStroke: '#2d1614'
        };
      default:
        return {
          stroke: '#3ddc84',
          text: 'text-emerald-400',
          baseStroke: '#142a1f'
        };
    }
  };

  const currentPercent = getPercentage(riskLevel);
  const colorScheme = getColorScheme(riskLevel);
  const targetOffset = arcLength * (1 - currentPercent);

  useEffect(() => {
    // Reset offset first to guarantee visual re-trigger on data swaps
    setAnimatedOffset(arcLength);
    
    // Animate to target fill offset
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 50);

    return () => clearTimeout(timer);
  }, [riskLevel, targetOffset]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Semicircular SVG Meter */}
      <div className="relative w-48 h-28">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Background base arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={colorScheme.baseStroke}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active indicator overlay */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={colorScheme.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={animatedOffset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        
        {/* Centered details block */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={`text-xl font-bold font-outfit uppercase tracking-wide leading-none ${colorScheme.text}`}>
            {riskLevel}
          </span>
          <span className="text-[10px] text-[#8aa89c] font-mono mt-1.5 uppercase tracking-wider">
            {breachCount} {breachCount === 1 ? 'breach' : 'breaches'} detected
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
