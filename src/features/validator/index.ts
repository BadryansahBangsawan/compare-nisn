export type MatchStatus = 'match' | 'mismatch' | 'orphan_local' | 'orphan_dapodik';

export interface ValidationResult {
  nisn: string;
  localData?: any;
  dapodikData?: any;
  status: MatchStatus;
  mismatchedColumns: string[];
}

export function validateData(
  localData: any[],
  dapodikData: any[],
  nisnColLocal: string,
  nisnColDapodik: string,
  columnsToCompare: { localCol: string, dapodikCol: string }[]
): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Map dapodik data by NISN for quick lookup
  const dapodikMap = new Map<string, any>();
  for (const row of dapodikData) {
    const nisn = String(row[nisnColDapodik] || '').trim();
    if (nisn) dapodikMap.set(nisn, row);
  }

  const localProcessedNisn = new Set<string>();

  // Compare local data against dapodik
  for (const localRow of localData) {
    const nisn = String(localRow[nisnColLocal] || '').trim();
    if (!nisn) continue;

    localProcessedNisn.add(nisn);
    const dapodikRow = dapodikMap.get(nisn);

    if (!dapodikRow) {
      results.push({
        nisn,
        localData: localRow,
        status: 'orphan_local',
        mismatchedColumns: [],
      });
      continue;
    }

    // Found in both, compare fields
    const mismatchedColumns: string[] = [];
    for (const { localCol, dapodikCol } of columnsToCompare) {
      const localVal = String(localRow[localCol] || '').trim().toLowerCase();
      const dapodikVal = String(dapodikRow[dapodikCol] || '').trim().toLowerCase();
      
      if (localVal !== dapodikVal) {
        mismatchedColumns.push(localCol); // Note: we push localCol name as the reference
      }
    }

    results.push({
      nisn,
      localData: localRow,
      dapodikData: dapodikRow,
      status: mismatchedColumns.length > 0 ? 'mismatch' : 'match',
      mismatchedColumns,
    });
  }

  // Find orphans in dapodik
  for (const [nisn, dapodikRow] of dapodikMap.entries()) {
    if (!localProcessedNisn.has(nisn)) {
      results.push({
        nisn,
        dapodikData: dapodikRow,
        status: 'orphan_dapodik',
        mismatchedColumns: [],
      });
    }
  }

  return results;
}
