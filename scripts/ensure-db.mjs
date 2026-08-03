// 빌드 시 Postgres가 연결되어 있으면 테이블을 생성/동기화한다.
// DATABASE_URL이 없거나 Postgres가 아니면 조용히 건너뛰므로
// DB 연결 전 배포도 실패하지 않는다.
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";
const allowPush = process.env.PRISMA_DB_PUSH_ON_BUILD === "true";

if (!/^postgres(ql)?:\/\//.test(url) || !allowPush) {
  console.log("[ensure-db] 빌드 중 자동 db push 건너뜀");
  process.exit(0);
}

console.log("[ensure-db] prisma db push 실행");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
