import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { validationData } from '#/lib/store'
import { Button } from '#/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import * as xlsx from 'xlsx'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
})

function ResultsPage() {
  const navigate = useNavigate()
  
  if (!validationData) {
    // If no data, redirect to upload
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Tidak ada data hasil validasi</h2>
          <p className="text-zinc-500">Silakan lakukan upload dan pemetaan data terlebih dahulu.</p>
          <Button asChild><Link to="/upload">Kembali ke Upload</Link></Button>
        </div>
      </div>
    )
  }

  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch' | 'orphan_local' | 'orphan_dapodik'>('all')

  const stats = useMemo(() => {
    return {
      total: validationData.length,
      match: validationData.filter(d => d.status === 'match').length,
      mismatch: validationData.filter(d => d.status === 'mismatch').length,
      orphanLocal: validationData.filter(d => d.status === 'orphan_local').length,
      orphanDapodik: validationData.filter(d => d.status === 'orphan_dapodik').length,
    }
  }, [])

  const filteredData = useMemo(() => {
    if (filter === 'all') return validationData;
    return validationData.filter(d => d.status === filter);
  }, [filter])

  const handleExport = () => {
    const exportData = validationData.map(row => {
      return {
        NISN: row.nisn,
        Status: row.status === 'match' ? 'Sesuai' :
                row.status === 'mismatch' ? 'Selisih Data' :
                row.status === 'orphan_local' ? 'Hanya di Lokal (Tidak ada di Dapodik)' :
                'Hanya di Dapodik (Tidak ada di Lokal)',
        'Kolom Selisih': row.mismatchedColumns.join(', '),
        // We can inject the local data for context
        ...row.localData,
        // And tag dapodik data with a prefix
        ...Object.fromEntries(Object.entries(row.dapodikData || {}).map(([k, v]) => [`[Dapodik] ${k}`, v]))
      }
    });

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Hasil Validasi");
    xlsx.writeFile(workbook, "Laporan_Validasi_Siswa.xlsx");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/upload">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hasil Validasi</h1>
              <p className="text-zinc-500">Ringkasan hasil komparasi data sekolah dan Dapodik.</p>
            </div>
          </div>
          <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <CardStat title="Total Diproses" value={stats.total} color="bg-blue-50 text-blue-700 border-blue-200" onClick={() => setFilter('all')} active={filter==='all'} />
          <CardStat title="✅ Sesuai" value={stats.match} color="bg-green-50 text-green-700 border-green-200" onClick={() => setFilter('match')} active={filter==='match'} />
          <CardStat title="⚠️ Selisih" value={stats.mismatch} color="bg-yellow-50 text-yellow-700 border-yellow-200" onClick={() => setFilter('mismatch')} active={filter==='mismatch'} />
          <CardStat title="❌ Hanya Lokal" value={stats.orphanLocal} color="bg-red-50 text-red-700 border-red-200" onClick={() => setFilter('orphan_local')} active={filter==='orphan_local'} />
          <CardStat title="❌ Hanya Dapodik" value={stats.orphanDapodik} color="bg-purple-50 text-purple-700 border-purple-200" onClick={() => setFilter('orphan_dapodik')} active={filter==='orphan_dapodik'} />
        </div>

        {/* Table View */}
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
                {filteredData.map((row, idx) => (
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
                      {/* Placeholder for detail view if needed */}
                      <Button variant="ghost" size="sm" onClick={() => {
                        console.log('Row Data:', row);
                        alert('Data Lokal:\n' + JSON.stringify(row.localData, null, 2) + '\n\nData Dapodik:\n' + JSON.stringify(row.dapodikData, null, 2));
                      }}>Lihat Detail</Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
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

      </div>
    </div>
  )
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
  )
}
