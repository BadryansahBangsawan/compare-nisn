import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { validationData } from '#/lib/store'
import { Button } from '#/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import * as xlsx from 'xlsx'
import { useState, useMemo } from 'react'
import { SummaryCards } from '#/components/SummaryCards'
import { ResultTable } from '#/components/ResultTable'
import { MatchStatus } from '#/features/validator'

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

  const [filter, setFilter] = useState<'all' | MatchStatus>('all')

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

        <SummaryCards 
          data={validationData} 
          activeFilter={filter} 
          onFilterChange={setFilter} 
        />

        <ResultTable data={filteredData} />

      </div>
    </div>
  )
}
