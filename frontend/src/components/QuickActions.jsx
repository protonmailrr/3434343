import { Bell, Eye, TrendingUp, Target } from 'lucide-react';
import { useState } from 'react';

// Compact Quick Actions - 4 icons horizontally with tooltips
export default function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState(null);
  
  const actions = [
    { 
      icon: Bell, 
      label: 'Alert', 
      description: 'Set up custom alerts',
      action: () => console.log('Alert')
    },
    { 
      icon: Eye, 
      label: 'Watch', 
      description: 'Add to watchlist',
      action: () => console.log('Watch')
    },
    { 
      icon: TrendingUp, 
      label: 'Strategy', 
      description: 'View trading strategies',
      action: () => window.location.href = '/strategies'
    },
    { 
      icon: Target, 
      label: 'Explorer', 
      description: 'Deep dive into flows',
      action: () => console.log('Flow')
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <div key={i} className="relative">
              <button
                onClick={action.action}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                className="w-full flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </button>
              
              {/* Tooltip */}
              {hoveredAction === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  {action.description}
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
