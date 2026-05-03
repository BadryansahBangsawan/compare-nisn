import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FileUpload } from '#/components/FileUpload'
import { Button } from '#/components/ui/button'
import { ArrowLeft, ArrowRight, Settings, Loader2 } from 'lucide-react'
import { parseFile } from '#/features/parser/excelParser'
import { validateData } from '#/features/validator'
import { setValidationData, setHeaders } from '#/lib/store'
import { useTRPC } from '#/integrations/trpc/react'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  const navigate = useNavigate()
  const trpc = useTRPC()
  const fetchDapodik = useMutation(trpc.ptkin.fetchDapodikData.mutationOptions())
  
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  
  // Mapping state
  const [localData, setLocalData] = useState<any[]>([])
  const [localCols, setLocalCols] = useState<string[]>([])

  // Selections
  const [primaryLocal, setPrimaryLocal] = useState<string>('')
  
  // Mapping for API comparison
  const [mappings, setMappings] = useState<{ localCol: string, dapodikCol: string }[]>([
    { localCol: '', dapodikCol: 'namaLengkap' },
    { localCol: '', dapodikCol: 'tempatLahir' },
    { localCol: '', dapodikCol: 'tanggalLahir' },
    { localCol: '', dapodikCol: 'jenisKelamin' },
    { localCol: '', dapodikCol: 'namaIbuKandung' },
  ])

  // Hardcoded standard API columns for the UI
  const availableApiCols = [
    { value: 'namaLengkap', label: 'Nama Lengkap' },
    { value: 'tempatLahir', label: 'Tempat Lahir' },
    { value: 'tanggalLahir', label: 'Tanggal Lahir' },
    { value: 'jenisKelamin', label: 'Jenis Kelamin (L/P)' },
    { value: 'namaIbuKandung', label: 'Nama Ibu Kandung' },
  ];

  const handleParse = async () => {
    if (!localFile) return;
    setIsProcessing(true);
    try {
      const pLocal = await parseFile(localFile);
      setLocalData(pLocal);

      const lCols = pLocal.length > 0 ? Object.keys(pLocal[0]) : [];
      setLocalCols(lCols);
      
      // Auto-guess primary key
      setPrimaryLocal(lCols.find(c => c.toLowerCase().includes('nisn')) || lCols[0] || '');

      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Gagal membaca file. Pastikan formatnya benar (.csv atau .xlsx).');
    } finally {
      setIsProcessing(false);
    }
  }

  const updateMapping = (index: number, val: string) => {
    const newMappings = [...mappings];
    newMappings[index].localCol = val;
    setMappings(newMappings);
  }

  const handleValidate = async () => {
    if (!primaryLocal) {
      alert('Pilih primary key (NISN) untuk data sekolah!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Ekstrak semua NISN dari data lokal
      const nisns = localData
        .map(row => String(row[primaryLocal] || '').trim())
        .filter(n => n.length > 0);

      if (nisns.length === 0) {
        throw new Error('Tidak ada NISN yang valid ditemukan di kolom yang dipilih.');
      }

      // 2. Fetch data dari API PTKIN
      const dapodikData = await fetchDapodik.mutateAsync({ nisns });

      // 3. Proses Validasi (Bandingkan)
      // Note: Dapodik NISN column is hardcoded as 'nisn' in our API response
      const results = validateData(
        localData,
        dapodikData,
        primaryLocal,
        'nisn', 
        mappings.filter(m => m.localCol && m.dapodikCol) // only valid mappings
      );
      
      setHeaders(localCols, availableApiCols.map(c => c.value));
      setValidationData(results);
      
      navigate({ to: '/results' });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat memvalidasi data dengan API.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full space-y-8 flex-1">
        
        {step === 1 && (
          <>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload Data Sekolah</h1>
                <p className="text-zinc-500">Pilih file data dari sistem sekolah. Sistem akan otomatis memvalidasinya ke server PTKIN.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <FileUpload
                label="Data Sekolah (Excel/CSV)"
                selectedFile={localFile}
                onFileSelect={setLocalFile}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={handleParse}
                disabled={!localFile || isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Memproses File...' : 'Lanjut Pemetaan Kolom'}
                {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Pemetaan Kolom</h1>
                <p className="text-zinc-500">Tentukan kolom dari file lokal untuk dicocokkan dengan atribut Dapodik/PTKIN.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">1. Primary Key (Wajib)</h3>
                <div className="max-w-md">
                  <label className="block text-sm font-medium mb-2">Kolom NISN di Data Sekolah</label>
                  <select className="w-full border rounded-md p-2 bg-zinc-50" value={primaryLocal} onChange={e => setPrimaryLocal(e.target.value)}>
                    <option value="">-- Pilih Kolom --</option>
                    {localCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">Kolom ini akan digunakan untuk menarik data siswa dari API PTKIN.</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold">2. Atribut yang Dibandingkan (Opsional)</h3>
                </div>
                
                <div className="space-y-4">
                  {mappings.map((m, i) => (
                    <div key={i} className="flex space-x-4 items-center bg-zinc-50 p-3 rounded-lg border">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Data Lokal</label>
                        <select className="w-full border rounded-md p-2 bg-white" value={m.localCol} onChange={e => updateMapping(i, e.target.value)}>
                          <option value="">-- Abaikan (Tidak dicek) --</option>
                          {localCols.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="pt-5 text-zinc-400 font-bold">Mencocokkan ➔</div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Data PTKIN (API)</label>
                        <div className="w-full border rounded-md p-2 bg-zinc-100 text-zinc-600 font-medium">
                          {availableApiCols.find(c => c.value === m.dapodikCol)?.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={handleValidate}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menarik Data & Validasi...</>
                ) : (
                  <><Settings className="mr-2 h-5 w-5" /> Tarik Data API & Validasi</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
