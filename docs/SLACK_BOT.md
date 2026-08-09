# 공개형 Slack Bot 설정

## 1. Slack App 만들기

Slack API에서 새 앱을 만들고 다음 OAuth Redirect URL을 등록한다.

```text
https://crit.day/api/slack/oauth/callback
```

Bot Token Scopes에는 다음을 추가한다.

- `chat:write`
- `chat:write.public`
- `channels:read`
- `groups:read`

`SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`는 Vercel Production 환경변수에 등록한다.

## 2. Vercel 환경변수

- `DATABASE_URL`: 설치된 워크스페이스와 암호화된 Bot Token 저장
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_REDIRECT_URI=https://crit.day/api/slack/oauth/callback`
- `SLACK_TOKEN_ENCRYPTION_KEY`: 32바이트 랜덤 값을 base64로 인코딩한 값
- `SLACK_CRON_SECRET`: GitHub Actions와 API 사이의 호출 인증값
- `VERCEL_ANALYTICS_TOKEN`: Vercel Web Analytics API access token
- `VERCEL_ANALYTICS_PROJECT_ID`: Vercel 프로젝트 ID
- `VERCEL_ANALYTICS_TEAM_ID`: 팀 프로젝트의 Vercel 팀 ID

키 생성 예시:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

hex 값을 사용할 경우에도 base64로 변환해서 등록해야 한다.

## 3. GitHub Secret

저장소 Actions Secret에 다음 값을 등록한다.

```text
SLACK_CRON_SECRET
```

## 4. 설치

`https://crit.day/slack`에서 **Add to Slack**을 누르면 OAuth 설치가 시작된다.
설치가 끝나면 봇이 접근할 채널을 선택한다. 봇이 참여하지 않은 비공개 채널은 목록에 나오지 않는다.

## 5. 발송

이 라우트를 배포하기 전에 반드시 `prisma db push`(또는 동등한 스키마 배포 절차)를
Production `DATABASE_URL`에 실행해 `SlackDelivery` 테이블과 `digestInitializedAt` 필드를 먼저 생성해야 한다.
Vercel 빌드에서 자동 적용하려면 `PRISMA_DB_PUSH_ON_BUILD=true`를 설정한다. 이 값이
없으면 `npm run build`는 DB 스키마를 변경하지 않으므로 라우트를 먼저 배포하면 안 된다.

`.github/workflows/slack-digest.yml`은 `main`의 `content/articles/**` 변경 직후 배포 시간을
고려해 30초 간격으로 digest를 다시 호출하고, 매일 10:00 KST에도 같은 API를 호출한다.
따라서 새 글은 배포가 끝나는 대로 발송하며, 즉시 호출이 실패하거나 지연돼도 일일 실행이 보충한다.
API는 게시 날짜와 관계없이 전체 공개 글을 확인하고, 워크스페이스별로 아직 발송하지 않은 글만
골라 선택 채널에 제목 링크 + bullet 요약을 보낸다. 과거 날짜로 게시해도 발송 이력으로 누락과 중복을 막는다.
기존 설치에 이 방식을 처음 적용할 때는 현재 공개 글을 `SlackDelivery`의 `sent` 기준선으로
한 번 등록해야 과거 글 전체가 다시 발송되지 않는다. 새 스키마를 배포하면 기준선이 없는 설치는
일반 발송에서 자동 제외된다. 이어 workflow를 `query=baseline=current`로 한 번 실행하면
Slack 메시지 없이 활성 상태이며 채널이 연결된 기존 설치의 현재 공개 글을 기준선으로 등록하고 발송을 활성화한다.
새로 채널을 연결하는 설치는 setup 단계에서 당시 공개 글을 자동 기준선으로 등록한다.
미발송 글이 40건을 넘으면 Slack block 한도를 피하도록 여러 메시지로 나눠 같은 실행에서 모두 보낸다.
운영자용 특정 slug 재발송은 부분 성공을 피하기 위해 한 요청당 최대 40건으로 제한한다.

`.github/workflows/slack-report.yml`은 같은 시각에 `/api/slack/report`를 호출한다.
활성화된 Slack 워크스페이스 수는 DB에서, 사이트 방문자 수와 아티클 페이지뷰는
Vercel Web Analytics API에서 전날 기준으로 조회해 보낸다. 아티클 페이지뷰는
`/articles/`로 시작하는 `requestPath`를 필터링한다. Vercel Analytics 환경변수가
없으면 해당 두 항목은 `Vercel Analytics API 설정 필요`로 표시된다.
