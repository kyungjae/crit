# crit

**디자이너를 위한 데일리 큐레이션.**
디자인 · AI × 디자인 · 툴 · 케이스 · 커리어 · 채용 정보를
AI 에이전트가 매일 수집해 게시하고, 독자는 댓글과 박수로 반응합니다.

## 구조 한눈에

```
content/               ← 콘텐츠 저장소 (에이전트가 여기에만 씀)
  articles/*.md        ← 아티클 (frontmatter + 마크다운)
  jobs/*.json          ← 채용 공고 (하루 1파일)
app/                   ← Next.js App Router
  page.tsx             ← 피드 (카테고리 탭 필터)
  articles/[slug]/     ← 아티클 상세 + 박수 + 댓글/대댓글
  jobs/                ← 채용 목록
  inspiration/         ← 영감 피드 (핀터레스트식 매소너리)
  links/               ← 디자이너 필수 링크 모음
  drafts/              ← 초안 검수 목록 (noindex, 피드에 없음)
  api/comments/        ← 댓글/대댓글 GET/POST
  api/ratings/         ← 박수 GET/POST (기기별 누른 횟수 저장)
  api/og/              ← 링크 카드용 OG 메타데이터 추출
components/            ← UI 컴포넌트 (모바일 퍼스트)
lib/schema.ts          ← 콘텐츠 zod 스키마 (단일 소스)
prisma/                ← 댓글/박수 DB (Postgres)
scripts/               ← 콘텐츠 검증·생성 스크립트
docs/HERMES.md         ← 에이전트 운영 안내 (처음 맡으면 여기부터) ★
docs/AGENT.md          ← 파일 포맷·스키마·게시 절차 정본
docs/WRITING.md        ← 작성 가이드 (포맷, 임베드, 문체)
.github/workflows/
  ci.yml               ← push마다 콘텐츠 검증 + 빌드
  daily-curation.yml   ← 매일 07:30 KST 큐레이션 에이전트 실행
```

### 핵심 설계: 콘텐츠 = 파일 = git 커밋

에이전트는 DB나 관리자 API 없이 `content/`에 파일을 추가하고 push하면 끝입니다.

- 모든 게시물이 git 히스토리로 남고, 잘못된 게시는 revert로 되돌립니다.
- `npm run validate`(및 CI)가 스키마를 강제하므로 에이전트 실수가 배포되지 않습니다.
- 댓글/박수처럼 사용자 상태가 필요한 것만 DB(Prisma)를 씁니다.

## 시작하기

```bash
npm install
npm run dev                 # http://localhost:3000
```

DB 없이 바로 실행됩니다 (댓글/박수만 "준비 중" 표시).
실제 DB로 테스트하려면 `.env`에 Postgres `DATABASE_URL`을 설정하고
`npx prisma db push`로 테이블을 만드세요.

## 자주 쓰는 명령

| 명령 | 설명 |
|---|---|
| `npm run validate` | content/ 전체 스키마 검증 (게시 전 필수) |
| `npm run new:article -- <category> <slug> "제목"` | 아티클 템플릿 생성 |
| `npm run build` | 프로덕션 빌드 |
| `npx prisma studio` | 댓글/박수 데이터 브라우저 |

## 에이전트 자동 포스팅

에이전트가 이 저장소를 처음 맡으면 **`docs/HERMES.md`** 부터 읽으면 됩니다 —
저장소 지도, 명령어, 데일리 운영 절차, 절대 규칙, 자주 걸리는 함정이
한 장에 정리되어 있습니다. 세부 규칙은 `docs/AGENT.md`(포맷·스키마·절차)와
`docs/WRITING.md`(작성 가이드)에 있습니다.

`.github/workflows/daily-curation.yml`이 매일 아침 Claude Code Action으로
에이전트를 실행합니다. 활성화하려면 리포지토리 시크릿에 `ANTHROPIC_API_KEY`를
등록하세요. 수동 실행은 Actions 탭 → Daily Curation → Run workflow.

## 배포 (Vercel)

push하면 자동 배포되므로 **에이전트의 커밋이 곧 게시**입니다.

### 1단계 — 사이트 띄우기 (환경 변수 불필요)

1. [vercel.com/new](https://vercel.com/new) → GitHub 연동 → `crit` 리포지토리 Import
2. 설정은 기본값 그대로 **Deploy** (Next.js 자동 감지, `postinstall`이 Prisma 클라이언트를 생성)
3. 배포 후 Settings → Git에서 Production Branch를 원하는 브랜치로 지정

`DATABASE_URL` 없이도 사이트 전체가 동작합니다. 댓글/박수 영역만
"준비 중"으로 표시됩니다.

### 2단계 — 댓글/박수 활성화 (DB 연결)

1. Vercel 프로젝트 → **Storage** 탭 → **Create Database** → **Neon** (Postgres, 무료)
2. 생성 후 **Connect Project** 로 이 프로젝트에 연결
   → `DATABASE_URL`이 환경 변수로 자동 등록됨
3. **Deployments** 탭에서 최신 배포의 ⋯ 메뉴 → **Redeploy**

끝. 빌드 시 `scripts/ensure-db.mjs`가 Postgres 연결을 감지하면 테이블을
자동 생성하므로 별도의 마이그레이션 명령이 필요 없습니다.

로컬 개발: `DATABASE_URL` 없이 돌리면 댓글/박수만 "준비 중"으로 표시됩니다.
실제 DB로 테스트하려면 `.env`에 Postgres URL(예: Neon의 dev 브랜치)을 넣으세요.

## 로드맵

- [x] 디자인/AI × 디자인/툴/케이스/커리어 큐레이션 피드
- [x] 채용 공고 피드
- [x] 댓글 · 대댓글 · 박수
- [ ] 댓글 좋아요
- [ ] 포트폴리오 제출 → AI 1차 리뷰 → 에디터 리뷰 파이프라인
- [ ] 채용 연계 (지원자 프로필 ↔ 공고 매칭)
- [ ] 뉴스레터 발송 (주간 다이제스트)
