import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from './init';

export const ptkinRouter = {
  fetchDapodikData: publicProcedure
    .input(z.object({
      nisns: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const username = process.env.PTKIN_TOKEN_USERNAME;
      const password = process.env.PTKIN_TOKEN_PASSWORD;
      const tokenUrl = process.env.PTKIN_TOKEN_URL;

      if (!username || !password || !tokenUrl) {
        throw new Error('Kredensial API PTKIN belum diatur di server.');
      }

      try {
        // 1. Get Token (Example implementation, adjust based on actual API spec)
        /*
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (!tokenResponse.ok) {
           throw new Error('Gagal mendapatkan token PTKIN');
        }
        const tokenData = await tokenResponse.json();
        const token = tokenData.token; // adjust property name
        */

        // 2. Fetch Data for each NISN
        // Since we don't have the actual data endpoint URL yet, 
        // we will simulate the fetch based on the requested NISNs.
        
        // MOCK IMPLEMENTATION (Replace with actual fetch when API spec is known)
        const results = input.nisns.map(nisn => ({
          nisn: nisn,
          namaLengkap: `Nama Siswa ${nisn}`,
          tempatLahir: 'Jakarta',
          tanggalLahir: '2005-01-01',
          jenisKelamin: parseInt(nisn) % 2 === 0 ? 'L' : 'P',
          namaIbuKandung: 'Ibu ' + nisn
        }));

        return results;
      } catch (error: any) {
        throw new Error(`Terjadi kesalahan saat memanggil API: ${error.message}`);
      }
    }),
} satisfies import('@trpc/server').TRPCRouterRecord;
