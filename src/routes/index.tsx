import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { FileSearch } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="bg-blue-100 text-blue-600 p-4 rounded-full inline-block mb-4">
          <FileSearch className="h-12 w-12" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900">
          Validasi Data Siswa
        </h1>
        <p className="text-xl text-zinc-600 max-w-xl mx-auto">
          Bandingkan data siswa dari sistem sekolah (lokal) dengan data resmi dari Dapodik dengan mudah, cepat, dan aman karena diproses sepenuhnya di dalam browser.
        </p>
        
        <div className="pt-8 flex justify-center space-x-4">
          <Button asChild size="lg" className="px-8 text-lg">
            <Link to="/upload">
              Mulai Validasi
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 text-lg">
            Pelajari Cara Kerja
          </Button>
        </div>
      </div>
    </div>
  )
}
