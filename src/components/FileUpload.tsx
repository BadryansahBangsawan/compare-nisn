import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ label, accept = ".csv, .xlsx, .xls", onFileSelect, selectedFile }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClear = () => {
    onFileSelect(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
        <h3 className="font-medium text-lg">{label}</h3>
        {selectedFile ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-md border border-green-200 text-center break-all">
              ✓ {selectedFile.name}
            </div>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Ganti File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="h-10 w-10 text-zinc-400 mb-3" />
            <p className="text-sm text-zinc-500 mb-4 text-center max-w-[200px]">
              Drag & drop file di sini atau klik untuk memilih file
            </p>
            <Button asChild variant="secondary">
              <label className="cursor-pointer">
                Pilih File
                <input type="file" className="hidden" accept={accept} onChange={handleFileChange} />
              </label>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
