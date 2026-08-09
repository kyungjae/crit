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

## 5. 일일 발송

이 라우트를 배포하기 전에 반드시 `prisma db push`(또는 동등한 스키마 배포 절차)를
Production `DATABASE_URL`에 실행해 `SlackDelivery` 테이블을 먼저 생성해야 한다.
Vercel 빌드에서 자동 적용하려면 `PRISMA_DB_PUSH_ON_BUILD=true`를 설정한다. 이 값이
없으면 `npm run build`는 DB 스키마를 변경하지 않으므로 라우트를 먼저 배포하면 안 된다.

`.github/workflows/slack-digest.yml`이 매일 10:00 KST에
`/api/slack/digest`를 호출한다. API는 오늘과 전날 공개된 글 중 워크스페이스별로
아직 발송하지 않은 글만 골라 선택 채널에 제목 링크 + bullet 요약을 보낸다.
실행 뒤 공개된 글은 다음 날 보충 발송하며, 발송 이력으로 중복을 막는다.
이 변경을 처음 배포한 날에는 스키마와 Production 배포를 확인한 뒤 GitHub Actions에서
`days=2`로 한 번 수동 실행해 전날 누락분을 즉시 보충하고 발송 이력을 만든다.

`.github/workflows/slack-report.yml`은 같은 시각에 `/api/slack/report`를 호출한다.
활성화된 Slack 워크스페이스 수는 DB에서, 사이트 방문자 수와 아티클 페이지뷰는
Vercel Web Analytics API에서 전날 기준으로 조회해 보낸다. 아티클 페이지뷰는
`/articles/`로 시작하는 `requestPath`를 필터링한다. Vercel Analytics 환경변수가
없으면 해당 두 항목은 `Vercel Analytics API 설정 필요`로 표시된다.
