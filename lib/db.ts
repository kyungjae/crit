import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * DATABASE_URL이 설정되지 않은 배포(예: DB 연결 전의 Vercel 프리뷰)에서도
 * 사이트가 동작하도록 null을 반환한다. API 라우트는 null이면 기능을
 * "준비 중"으로 안내한다.
 */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
