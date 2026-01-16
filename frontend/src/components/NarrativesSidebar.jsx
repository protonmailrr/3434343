import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import NarrativesModal from './NarrativesModal';

// Compact Narratives for sidebar
export default function NarrativesSidebar() {
  const [showModal, setShowModal] = useState(false);
  
  const narratives = [
    { name: 'AI & Infrastructure', stage: 'Early', action: 'Monitor & Accumulate' },
    { name: 'Layer 2', stage: 'Confirmed', action: 'Strong Position' },
    { name: 'RWA', stage: 'Crowded', action: 'Consider Exit' },
  ];

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-2.5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Top Narratives</h3>
        </div>
      
        <div className="space-y-1.5 mb-3 flex-grow">
          {narratives.map((n, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-gray-900">{n.name}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                  {n.stage}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {n.action}
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Button - всегда внизу */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold transition-colors mt-auto"
        >
          View All Narratives
        </button>
      </div>
    
      {showModal && <NarrativesModal isOpen={showModal} onClose={() => setShowModal(false)} />}
    </>
  );
}
