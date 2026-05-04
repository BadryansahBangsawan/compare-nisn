import { z } from 'zod';
import { publicProcedure } from './init';
import { ptkinApiService } from '#/features/api/ptkinService';

export const ptkinRouter = {
  fetchDapodikData: publicProcedure
    .input(z.object({
      nisns: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        return await ptkinApiService.fetchStudents(input.nisns);
      } catch (error: any) {
        throw new Error(`Terjadi kesalahan saat memanggil API: ${error.message}`);
      }
    }),
} satisfies import('@trpc/server').TRPCRouterRecord;
