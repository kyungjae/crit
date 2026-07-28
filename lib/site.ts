/**
 * 배포 도메인. 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL (커스텀 도메인 연결 시 설정)
 * 2. Vercel이 주입하는 프로덕션 URL
 * 3. 로컬 개발
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
