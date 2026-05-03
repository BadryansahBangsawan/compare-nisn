import * as xlsx from 'xlsx';
import Papa from 'papaparse';

export async function parseFile(file: File): Promise<any[]> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  if (fileExt === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } else if (fileExt === 'xlsx' || fileExt === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = xlsx.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error('Unsupported file format');
}
