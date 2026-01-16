import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SmartMoneyModal from './SmartMoneyModal';

// Compact Smart Money Snapshot for sidebar
export default function SmartMoneySnapshot() {
  const [showModal, setShowModal] = useState(false);
  
  const entities = [
    { name: 'Alameda', status: 'Accumulating', confidence: 69 },
    { name: 'DWF Labs', status: 'Adding', confidence: 73 },
    { name: 'Pantera', status: 'Rotating', confidence: 75 },
    { name: 'a16z', status: 'Accumulating', confidence: 82 },
  ];

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-2.5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900">Smart Money</h3>
        </div>
        
        <div className="space-y-1.5 mb-3 flex-grow">
          {entities.map((entity, i) => (
            <Link
              key={i}
              to={`/entity/${entity.name.toLowerCase().replace(' ', '-')}`}
              className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-xs font-semibold text-gray-900">{entity.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-gray-600">{entity.status}</span>
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Button - всегда внизу */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold transition-colors mt-auto"
        >
          View All Smart Money
        </button>
      </div>
    
      {showModal && <SmartMoneyModal isOpen={showModal} onClose={() => setShowModal(false)} />}
    </>
  );
}
