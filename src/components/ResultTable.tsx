import { ValidationResult } from '#/features/validator';
import { Button } from './ui/button';

interface ResultTableProps {
  data: ValidationResult[];
}

export function ResultTable({ data }: ResultTableProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-100 sticky top-0">
            <tr>
              <th className="px-6 py-3">NISN</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Detail Selisih</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.nisn + idx} className="bg-white border-b hover:bg-zinc-50">
                <td className="px-6 py-4 font-medium text-zinc-900">{row.nisn}</td>
                <td className="px-6 py-4">
                  {row.status === 'match' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Sesuai</span>}
                  {row.status === 'mismatch' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Selisih Data</span>}
                  {row.status === 'orphan_local' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Hanya di Lokal</span>}
                  {row.status === 'orphan_dapodik' && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">Hanya di Dapodik</span>}
                </td>
                <td className="px-6 py-4 text-red-600">
                  {row.mismatchedColumns.length > 0 ? row.mismatchedColumns.join(', ') : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => {
                    console.log('Row Data:', row);
                    alert('Data Lokal:\n' + JSON.stringify(row.localData, null, 2) + '\n\nData Dapodik:\n' + JSON.stringify(row.dapodikData, null, 2));
                  }}>Lihat Detail</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  Tidak ada data untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
