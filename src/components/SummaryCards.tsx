import { MatchStatus, ValidationResult } from '#/features/validator';
import { useMemo } from 'react';

interface SummaryCardsProps {
  data: ValidationResult[];
  activeFilter: 'all' | MatchStatus;
  onFilterChange: (filter: 'all' | MatchStatus) => void;
}

export function SummaryCards({ data, activeFilter, onFilterChange }: SummaryCardsProps) {
  const stats = useMemo(() => {
    return {
      total: data.length,
      match: data.filter(d => d.status === 'match').length,
      mismatch: data.filter(d => d.status === 'mismatch').length,
      orphanLocal: data.filter(d => d.status === 'orphan_local').length,
      orphanDapodik: data.filter(d => d.status === 'orphan_dapodik').length,
    }
  }, [data]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <CardStat 
        title="Total Diproses" 
        value={stats.total} 
        color="bg-blue-50 text-blue-700 border-blue-200" 
        onClick={() => onFilterChange('all')} 
        active={activeFilter === 'all'} 
      />
      <CardStat 
        title="✅ Sesuai" 
        value={stats.match} 
        color="bg-green-50 text-green-700 border-green-200" 
        onClick={() => onFilterChange('match')} 
        active={activeFilter === 'match'} 
      />
      <CardStat 
        title="⚠️ Selisih" 
        value={stats.mismatch} 
        color="bg-yellow-50 text-yellow-700 border-yellow-200" 
        onClick={() => onFilterChange('mismatch')} 
        active={activeFilter === 'mismatch'} 
      />
      <CardStat 
        title="❌ Hanya Lokal" 
        value={stats.orphanLocal} 
        color="bg-red-50 text-red-700 border-red-200" 
        onClick={() => onFilterChange('orphan_local')} 
        active={activeFilter === 'orphan_local'} 
      />
      <CardStat 
        title="❌ Hanya Dapodik" 
        value={stats.orphanDapodik} 
        color="bg-purple-50 text-purple-700 border-purple-200" 
        onClick={() => onFilterChange('orphan_dapodik')} 
        active={activeFilter === 'orphan_dapodik'} 
      />
    </div>
  );
}

function CardStat({ title, value, color, onClick, active }: { title: string, value: number, color: string, onClick: () => void, active: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 border rounded-xl text-left transition-all ${color} ${active ? 'ring-2 ring-offset-2 ring-blue-400 scale-[1.02]' : 'hover:scale-[1.01] opacity-80 hover:opacity-100'}`}
    >
      <div className="text-sm font-medium mb-1 opacity-80">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </button>
  );
}
