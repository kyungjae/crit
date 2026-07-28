# crit

**디자이너를 위한 데일리 큐레이션.**
뉴스 · AI 워크플로우 · 도구 추천 · AI 사용법 · 포트폴리오 리뷰 · 채용 정보를
AI 에이전트가 매일 수집해 게시하고, 독자는 댓글과 별점으로 토론합니다.

## 구조 한눈에

```
content/               ← 콘텐츠 저장소 (에이전트가 여기에만 씀)
  articles/*.md        ← 아티클 (frontmatter + 마크다운)
  jobs/*.json          ← 채용 공고 (하루 1파일)
app/                   ← Next.js App Router
  page.tsx             ← 피드 (카테고리 탭 필터)
  articles/[slug]/     ← 아티클 상세 + 별점 + 댓글
  jobs/                ← 채용 목록
  api/comments/        ← 댓글 GET/POST
  api/ratings/         ← 별점 GET/POST (기기당 1표, 수정 가능)
components/            ← UI 컴포넌트 (모바일 퍼스트)
lib/schema.ts          ← 콘텐츠 zod 스키마 (단일 소스)
prisma/                ← 댓글/별점 DB (기본 SQLite)
scripts/               ← 콘텐츠 검증·생성 스크립트
docs/AGENT.md          ← 에이전트 포스팅 가이드 ★
.github/workflows/
  ci.yml               ← push마다 콘텐츠 검증 + 빌드
  daily-curation.yml   ← 매일 07:30 KST 큐레이션 에이전트 실행
```

### 핵심 설계: 콘텐츠 = 파일 = git 커밋

에이전트는 DB나 관리자 API 없이 `content/`에 파일을 추가하고 push하면 끝입니다.

- 모든 게시물이 git 히스토리로 남고, 잘못된 게시는 revert로 되돌립니다.
- `npm run validate`(및 CI)가 스키마를 강제하므로 에이전트 실수가 배포되지 않습니다.
- 댓글/별점처럼 사용자 상태가 필요한 것만 DB(Prisma)를 씁니다.

## 시작하기

```bash
npm install
cp .env.example .env        # DATABASE_URL 설정 (기본: SQLite)
npx prisma db push          # 댓글/별점 테이블 생성
npm run dev                 # http://localhost:3000
```

## 자주 쓰는 명령

| 명령 | 설명 |
|---|---|
| `npm run validate` | content/ 전체 스키마 검증 (게시 전 필수) |
| `npm run new:article -- <category> <slug> "제목"` | 아티클 템플릿 생성 |
| `npm run build` | 프로덕션 빌드 |
| `npx prisma studio` | 댓글/별점 데이터 브라우저 |

## 에이전트 자동 포스팅

`docs/AGENT.md`가 에이전트용 단일 가이드입니다 — 파일 포맷, 카테고리 기준,
게시 절차, 큐레이션 원칙이 정의되어 있습니다.

`.github/workflows/daily-curation.yml`이 매일 아침 Claude Code Action으로
에이전트를 실행합니다. 활성화하려면 리포지토리 시크릿에 `ANTHROPIC_API_KEY`를
등록하세요. 수동 실행은 Actions 탭 → Daily Curation → Run workflow.

## 배포

- **Vercel 권장.** push하면 자동 배포되므로 에이전트의 커밋이 곧 게시입니다.
- 서버리스 환경에서는 SQLite 대신 Postgres를 사용하세요:
  `prisma/schema.prisma`의 provider를 `postgresql`로 바꾸고 `DATABASE_URL` 설정
  (Vercel Postgres, Neon, Supabase 등).

## 로드맵

- [x] 뉴스/워크플로우/도구/가이드/포트폴리오 큐레이션 피드
- [x] 채용 공고 피드
- [x] 댓글 · 별점
- [ ] 대댓글, 댓글 좋아요
- [ ] 포트폴리오 제출 → AI 1차 리뷰 → 에디터 리뷰 파이프라인
- [ ] 채용 연계 (지원자 프로필 ↔ 공고 매칭)
- [ ] 뉴스레터 발송 (주간 다이제스트)
