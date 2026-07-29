# crit 운영 안내 (에이전트용)

hermes를 비롯해 이 저장소를 처음 맡는 에이전트를 위한 문서. 이것만 읽고
바로 일할 수 있게 썼다. 세부 규칙은 마지막의 "더 읽을 것"으로 넘긴다.

## 1. 이게 뭔가

**crit — 디자이너를 위한 데일리 큐레이션 사이트.** 해외 디자인 뉴스레터·미디어·
VC·유튜브에서 새 글을 골라 한국어 아티클로 옮기고, 국내 채용 공고와 영감
이미지를 함께 싣는다. 독자는 댓글과 박수로 반응한다.

- 스택: Next.js 15 (App Router) + Tailwind 4 + Prisma(Postgres)
- 배포: Vercel — `main`에 푸시하면 자동 배포
- 라이브: https://crit-gamma.vercel.app

## 2. 가장 중요한 원칙

> **콘텐츠 = 파일 = git 커밋.**

관리자 CMS는 없다. 기본은 `content/` 아래 파일을 만들고 커밋해서 푸시하면
그게 발행이다. `/drafts`의 발행 버튼도 결국 GitHub에 `draft: true` 제거 커밋을
만드는 얇은 도구다. 되돌리려면 revert 하면 된다.

DB(Prisma)는 **댓글과 박수에만** 쓴다. 아티클은 절대 DB에 넣지 않는다.

## 3. 저장소 지도

건드릴 곳과 건드리지 말 곳이 명확히 갈린다.

```
content/               ← 여기만 고치면 콘텐츠 작업이 끝난다
  articles/*.md          아티클 (frontmatter + 마크다운)
  jobs/YYYY-MM-DD.json   채용 공고 (하루 1파일)
  inspiration.json       영감 피드 이미지
  links.json             디자이너 필수 링크 모음
config/sources.json    ← 수집 소스 레지스트리 (해외만)

app/                   ← 화면. 콘텐츠 작업 중에는 손대지 않는다
  page.tsx               피드 (카테고리 탭)
  articles/[slug]/       아티클 상세 + 박수 + 댓글
  inspiration/ links/ jobs/ drafts/
  api/comments/ api/ratings/ api/og/ api/admin/publish/
components/  lib/      ← 렌더링·스키마. 기능 변경 때만
lib/schema.ts          ← 콘텐츠 스키마 원본(zod). 필드 추가는 여기부터
scripts/               ← 검증·수집·에셋 도구
docs/                  ← AGENT.md, WRITING.md, 이 파일
```

## 4. 명령어

| 명령 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 (DB 없이도 뜬다) |
| `npm run validate` | **콘텐츠 스키마 검증 — 커밋 전 필수** |
| `npm run sources:check -- --days 2` | 등록 소스의 새 글 목록 |
| `npm run assets:find -- <URL>` | 페이지에서 이미지·영상 URL 추출 |
| `npm run new:article -- <category> <slug> "제목"` | 아티클 템플릿 생성 |
| `npm run build` | 프로덕션 빌드 (CI와 동일) |

## 5. 데일리 큐레이션 (핵심 업무)

```bash
git pull origin main
npm run sources:check -- --days 2   # 후보 수집. [게시됨] 표시는 건너뛴다
# → 후보 중 3~7건 선별, 원문 읽고 아티클 작성
# → 국내 채용 공고 조사해서 content/jobs/<오늘>.json 작성
npm run validate                     # 실패하면 고치고 다시
git add content/ && git commit -m "content: 2026-07-29 데일리 큐레이션 (아티클 4건, 채용 3건)"
git push origin main
```

포맷은 글의 성격에 맞게 고른다 — `brief`(짧은 소식) / `deep`(긴 글, 목차) /
`rules`(규칙 카드) / `showcase`(브랜드 케이스 스터디, 히어로+비주얼).
**모든 글에 같은 섹션 뼈대를 쓰지 않는다.** 자세한 기준은 WRITING.md.

## 6. 초안 워크플로

확신이 없거나 이미지·영상을 못 구했으면 frontmatter에 `draft: true`.
피드·사이트맵·검색엔진에서 빠지고 URL로만 열린다.

- 검수 화면: **`/drafts`** — placeholder 이미지, "교체 필요" 표시, 히어로 누락,
  원문 링크 누락이 경고 칩으로 뜬다.
- 검수 후 카드의 **발행** 버튼을 누르면 `draft: true`를 제거하는 커밋이 만들어진다.
  라이브에서 쓰려면 Vercel 환경변수 `CRIT_GITHUB_TOKEN`(또는 `GITHUB_TOKEN`)과
  선택적으로 `CRIT_ADMIN_TOKEN`, `CRIT_CONTENT_BRANCH`가 필요하다.
- **칩이 하나도 없을 때** 발행하는 것이 원칙이다. 경고가 남으면 버튼에서 다시 확인한다.

반쯤 된 글을 피드에 올리지 않는다. 사람 검수를 기다리는 게 정상 경로다.

## 7. 절대 규칙

1. **검증 없이 커밋하지 않는다.** `npm run validate` 통과가 조건이다.
2. **콘텐츠 커밋은 `content/`만** 건드린다. 코드 변경과 섞지 않는다.
3. **`config/sources.json`에 없는 소스에서 임의로 수집하지 않는다.**
   소스 추가는 이 파일 수정으로만. 국내 미디어는 신뢰 소스에 넣지 않는다
   (해외 글을 한국어로 옮기는 것이 crit의 기본값). 도구 공식 블로그의 대형
   발표는 예외.
4. **확인된 사실만 쓴다.** 검색 스니펫만으로 수치·날짜·기능명을 단정하지 않는다.
5. **시점을 확인한다.** 스튜디오·기업이 과거 작업을 늦게 공개하는 일이 흔하다.
   2년 전 리브랜드를 "런칭했습니다"로 쓰면 안 된다 — 케이스 스터디로 쓴다.
6. **중복 금지.** 이미 다룬 소식은 다시 쓰지 않는다 (`sources:check`가
   `[게시됨]`으로 표시). 채용 공고 `id`는 과거 파일과도 겹치면 안 된다.
7. **이미지는 출처가 명확한 것만.** 공식 프레스킷, 스튜디오 프로젝트 페이지,
   퍼블릭 도메인. `credits`에 밝힌다. 문제 제기 시 즉시 제거.
8. **네트워크 차단을 우회하지 않는다.** 아래 참고.

## 8. 자주 걸리는 함정

**외부 사이트 접근이 막힐 수 있다.** 실행 환경에 따라 조직 egress 정책이
호스트를 차단한다(프록시가 `403 to CONNECT`로 기록). 이때는
`curl -sS "$HTTPS_PROXY/__agentproxy/status"`로 차단 사실을 확인하고,
**차단된 호스트를 그대로 보고한 뒤 `draft: true`로 남긴다.** 캐시·미러·다른
프록시로 우회하지 않는다. GitHub Actions는 이 제약이 없어서, Actions의
**Find Assets** 워크플로를 수동 실행하면 에셋 URL을 받을 수 있다.

**DB 없이도 사이트는 돌아간다.** `DATABASE_URL`이 없으면 댓글·박수만
"준비 중"으로 표시되고 나머지는 정상이다. 로컬에서 DB 오류가 나도 콘텐츠
작업은 그대로 진행하면 된다.

**frontmatter `date`와 파일명 날짜는 반드시 같아야 한다.** validate가 잡는다.

**`sources:check`는 피드가 없는 소스를 "수동 확인 필요"로 안내한다.**
그 소스들은 홈 URL을 직접 방문해서 새 글을 확인한다.

## 9. 자동화 현황

- `.github/workflows/ci.yml` — 푸시마다 콘텐츠 검증 + 빌드
- `.github/workflows/daily-curation.yml` — 매일 07:30 KST 큐레이션 실행
  (`ANTHROPIC_API_KEY` 시크릿 등록 시 동작)
- `.github/workflows/find-assets.yml` — 수동 실행, 에셋 URL 추출

## 더 읽을 것

- **[AGENT.md](./AGENT.md)** — 파일 포맷·스키마·게시 절차의 정본
- **[WRITING.md](./WRITING.md)** — 포맷 선택, 리치 콘텐츠 문법, 기계적 글쓰기
  안티패턴, 문체
- **[../README.md](../README.md)** — 사람용 개요, 배포·DB 설정
