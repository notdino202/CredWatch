import React from 'react';

/**
 * Timeline component displaying database breaches chronologically.
 * Line items are color-coded (red/amber) depending on the breach severity
 * (e.g., whether passwords or financial records were exposed).
 */
const BreachTimeline = ({ breaches = [] }) => {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  // Sort chronologically (oldest first)
  const sortedBreaches = [...breaches].sort((a, b) => {
    const yearA = parseInt(a.date) || 0;
    const yearB = parseInt(b.date) || 0;
    return yearA - yearB;
  });

  // Evaluate single breach hazard severity to color timeline dots
  const getSeverityColor = (exposedFields) => {
    const fields = exposedFields || [];
    const highRiskKeywords = ["password", "credit card", "bank", "financial"];
    
    const isHigh = fields.some(field => {
      const fieldLower = field.toLowerCase();
      return highRiskKeywords.some(kw => fieldLower.includes(kw));
    });

    return isHigh 
      ? { dot: 'bg-[#e2625a] shadow-[0_0_8px_rgba(226,98,90,0.5)]', border: 'border-red-400/20' }
      : { dot: 'bg-[#e0a030] shadow-[0_0_8px_rgba(224,160,48,0.5)]', border: 'border-amber-400/20' };
  };

  return (
    <div className="w-full mt-4">
      <h3 className="text-xs font-semibold font-outfit uppercase tracking-wider text-[#8aa89c] mb-4">
        Breach History Timeline
      </h3>
      
      {/* Scrollable Timeline Container */}
      <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6 py-2">
          {sortedBreaches.map((breach, index) => {
            const exposed = breach.exposed_data || breach.exposedData || [];
            const color = getSeverityColor(exposed);
            const displayDate = breach.date && breach.date !== "Unknown" ? breach.date : "Date unknown";

            return (
              <div key={index} className="relative group">
                {/* Visual Timeline Dot */}
                <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125 ${color.dot}`}></span>
                
                {/* Breach Details */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {breach.name}
                    </h4>
                    <span className="text-xs font-mono text-[#8aa89c]">
                      {displayDate}
                    </span>
                  </div>
                  
                  {/* Exposed data categories lists */}
                  {exposed.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exposed.map((field, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] bg-white/[0.02] border border-white/5 text-[#8aa89c] px-1.5 py-0.5 rounded"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/40 italic">
                      Exposed categories details unavailable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BreachTimeline;
