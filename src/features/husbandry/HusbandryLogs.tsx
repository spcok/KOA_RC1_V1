import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export const HusbandryLogs: React.FC = () => {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'FEED', 'WEIGHT', 'FLIGHT', 'TRAINING', 'TEMPERATURE'];

  return (
    <div className="space-y-4">
      {/* Offline Failover & Legal Compliance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
        Logs are cached locally for 14 days if the Supabase connection is interrupted.
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold ${filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
        <Plus size={16} /> + ADD HUSBANDRY LOG
      </button>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-500">DATE</th>
              <th className="px-4 py-3 font-bold text-slate-500">TYPE</th>
              <th className="px-4 py-3 font-bold text-slate-500">VALUE</th>
              <th className="px-4 py-3 font-bold text-slate-500">AUTH & ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Data rows would be mapped here */}
          </tbody>
        </table>
      </div>
    </div>
  );
};
