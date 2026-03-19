import React, { useState, useEffect, useMemo } from 'react';
import { Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { db } from '@/src/lib/db';
import { HusbandryLog } from '@/src/types';

interface Props {
  animalId: string;
}

export const HusbandryLogs: React.FC<Props> = ({ animalId }) => {
  const [logs, setLogs] = useState<HusbandryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'FEED', 'WEIGHT', 'FLIGHT', 'TRAINING', 'TEMPERATURE'];

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setIsOffline(false);
      try {
        const { data, error } = await supabase
          .from('husbandry_logs')
          .select('*')
          .eq('animal_id', animalId)
          .order('date', { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error('Supabase fetch failed, falling back to cache:', err);
        setIsOffline(true);
        // Offline Failover: Retrieve from local cache (Dexie/IndexedDB)
        const cachedLogs = await db.husbandry_logs
          .where('animal_id')
          .equals(animalId)
          .reverse()
          .sortBy('date');
        setLogs(cachedLogs || []);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [animalId]);

  const filteredLogs = useMemo(() => {
    if (filter === 'ALL') return logs;
    return logs.filter(log => log.type === filter);
  }, [logs, filter]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FEED': return 'bg-emerald-100 text-emerald-800';
      case 'WEIGHT': return 'bg-blue-100 text-blue-800';
      case 'FLIGHT': return 'bg-purple-100 text-purple-800';
      case 'TRAINING': return 'bg-amber-100 text-amber-800';
      case 'TEMPERATURE': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Offline Failover & Legal Compliance Banner */}
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle size={16} />
          <span>Viewing cached compliance data (14-day local cache active).</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
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
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="animate-spin mx-auto" size={24} />
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{log.value}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{log.author}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
