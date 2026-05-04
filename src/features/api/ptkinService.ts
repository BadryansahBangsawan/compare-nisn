/**
 * Service for interacting with PTKIN/Dapodik API
 */

export interface PtkinStudent {
  nisn: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  namaIbuKandung: string;
}

class PtkinApiService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  private getCredentials() {
    const username = process.env.PTKIN_TOKEN_USERNAME;
    const password = process.env.PTKIN_TOKEN_PASSWORD;
    const tokenUrl = process.env.PTKIN_TOKEN_URL;
    const apiUrl = process.env.PTKIN_API_URL; // Assuming there's a base API URL

    if (!username || !password || !tokenUrl) {
      throw new Error('Kredensial API PTKIN belum diatur (Username/Password/TokenURL).');
    }

    return { username, password, tokenUrl, apiUrl };
  }

  async getAccessToken(): Promise<string> {
    const { username, password, tokenUrl } = this.getCredentials();

    // Check if current token is still valid (with 1 min buffer)
    if (this.token && this.tokenExpiry && Date.now() < (this.tokenExpiry - 60000)) {
      return this.token;
    }

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Gagal autentikasi ke PTKIN (${response.status})`);
      }

      const data = await response.json();
      
      // Adjust based on actual API response structure
      this.token = data.access_token || data.token;
      
      // Set expiry if provided, otherwise default to 1 hour
      const expiresIn = data.expires_in || 3600;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);

      if (!this.token) throw new Error('Token tidak ditemukan dalam respon API.');

      return this.token;
    } catch (error: any) {
      console.error('PtkinApiService.getAccessToken Error:', error);
      throw new Error(`Gagal mendapatkan token: ${error.message}`);
    }
  }

  async fetchStudents(nisns: string[]): Promise<PtkinStudent[]> {
    const { apiUrl } = this.getCredentials();
    const token = await this.getAccessToken();

    if (!apiUrl) {
      // If no API URL provided, we'll still use the mock for data fetching part
      // but the auth part is now "real" (tries to fetch token)
      console.warn('PTKIN_API_URL tidak diatur. Menggunakan data simulasi.');
      return nisns.map(nisn => ({
        nisn,
        namaLengkap: `Nama Siswa ${nisn} (Simulasi)`,
        tempatLahir: 'Jakarta',
        tanggalLahir: '2005-01-01',
        jenisKelamin: parseInt(nisn) % 2 === 0 ? 'L' : 'P',
        namaIbuKandung: 'Ibu ' + nisn
      }));
    }

    try {
      // This is a generic implementation. Actual API might support batch or single fetch.
      // Example for batch:
      const response = await fetch(`${apiUrl}/students/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nisns })
      });

      if (!response.ok) {
        throw new Error(`Gagal menarik data dari PTKIN (${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('PtkinApiService.fetchStudents Error:', error);
      throw new Error(`Gagal menarik data siswa: ${error.message}`);
    }
  }
}

export const ptkinApiService = new PtkinApiService();
