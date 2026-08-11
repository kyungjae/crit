---
title: "같은 ‘디자인 시스템’, 서로 다른 문제: 한국과 해외는 무엇이 다른가"
summary: "Material, Carbon, Atlassian, Polaris, GOV.UK, NHS를 한국 사례와 같은 기준으로 비교했습니다. 차이는 컴포넌트 완성도가 아니라 플랫폼·조직·업무·공공 책임 중 무엇을 시스템에 고정했는가에서 생깁니다."
category: design
format: deep
style: geeknews
draft: true
tags: [오리지널리서치, 디자인시스템, Material, Carbon, Polaris, GOVUK, 접근성]
date: "2026-08-11"
thumbnail: "https://carbondesignsystem.com/ogimage.png"
hero: "https://carbondesignsystem.com/ogimage.png"
credits:
  - "대표 이미지 — Carbon Design System"
author: "crit editorial"
---

해외 디자인 시스템을 한국 사례의 상위 버전처럼 놓는 비교는 대체로 별 도움이 되지 않는다. Material과 GOV.UK, Carbon과 Polaris는 모두 디자인 시스템이지만 같은 문제를 풀지 않음. OS 생태계, 대기업 제품군, 상인의 업무, 시민의 공공 서비스는 실패했을 때의 비용부터 다르다.

이번 비교는 컴포넌트 수나 사이트 완성도가 아니라 **반복되는 의사결정을 어디에 고정했는가**를 기준으로 삼았다.

- **Material**은 플랫폼별 지원 우선순위를 다르게 운영한다. Compose는 최신 기능을 먼저 받는 반면, Material Web은 공식적으로 유지보수 모드지만 2026년에도 저장소 릴리스가 이어져 정책과 활동을 구분해 읽어야 함
- **Carbon·Atlassian**은 대규모 제품팀의 이탈을 서로 다르게 관리한다. Carbon은 기여·교육·실험 격리, Atlassian은 Figma–React 대응·lint·codemod가 강함
- **Polaris**는 React 라이브러리를 보관하고 여러 Shopify 표면을 잇는 Web Components로 세대교체했다. 컴포넌트보다 상인의 업무 흐름이 중심임
- **GOV.UK·NHS**는 공통 컴포넌트·패턴으로 출판할 제안을 사용자 연구, 장애인·보조기술 검증, NHS의 경우 임상 안전 증거로 심사함
- 한국 시스템은 이 모델을 뒤따르기만 하지 않는다. **SEED·우아한공방·네이버파이낸셜**은 `llms.txt`, MCP, AST, Code Connect처럼 기계가 읽는 운영 지식에서 빠르게 움직이고 있음

## 같은 기준으로 비교하되 같은 목적이라고 가정하지 않았다

비교 축은 다음과 같다.

- 적용 범위: 플랫폼 / 기업 제품군 / 특정 업무 / 공공 서비스
- 공개 수준: 원칙 / 문서 / 패키지 / 소스 / 운영 자료
- 채택 장치: 교육 / 기여 / lint / migration / 서비스 평가
- 이탈 복구: deprecation / codemod / 호환 계층 / 지원 운영
- 증거: 사용 데이터 / 접근성 검증 / 공개 로드맵 / 제품 지표
- AI 대응: `llms.txt` / MCP / 기계가 읽는 API와 변경 기록

이 축은 우열표를 만들기 위한 것이 아니다. 시스템이 실패를 무엇으로 정의하는지 보기 위한 질문임.

## 플랫폼형: Material은 UI 규칙과 투자 순서를 함께 고정한다

[Material 3](https://m3.material.io/)는 토큰, 컴포넌트, 모션, 접근성, Figma Kit를 하나의 플랫폼 언어로 제공한다. 디자인 토큰을 디자인·도구·코드에서 같은 이름으로 쓰는 building block으로 정의하고 reference–system–component 계층으로 나눔.

그러나 Material을 하나의 균일한 구현으로 보면 현재 상태를 놓친다. 공식 정책은 **Compose-first**다. [Android Compose 문서](https://m3.material.io/develop/android/jetpack-compose)는 Compose가 최신 Material 업데이트를 먼저 받는 구현임을 밝힌다. M2→M3와 Views→Compose migration도 별도 경로로 제공함.

반면 [Material Web](https://m3.material.io/develop/web)은 유지보수 모드이며 현재 Material 팀의 새 기능 계획이 없다고 명시한다. [공식 roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md)도 신규 컴포넌트와 M3 Expressive 계획의 중단을 적고 있다.

공식 정책과 저장소 활동은 직접 어긋난다. Material Web 페이지와 roadmap은 신규 기능·컴포넌트에 대한 계획된 투자가 없다고 밝힌다. 그러나 [공식 GitHub 릴리스](https://github.com/material-components/material-web/releases)에는 2026년 7월 14일 `v2.5.0`이 배포됐고 manifest·utility class와 `expressive` 명칭의 기능도 포함됐다. 따라서 유지보수 모드를 코드 동결로 해석할 수도, 이 릴리스만으로 Material 팀의 Web 투자 재개를 단정할 수도 없다. 현재 확인 가능한 사실은 **공식 지원 정책과 저장소 활동이 완전히 일치하지 않는다는 것**임.

한국의 One UI와 Pleos도 플랫폼형에 가깝다. One UI는 Galaxy 기기군의 레이아웃·모션·사운드·햅틱까지 규정하고, Pleos는 차량 앱의 개발·문서·배포 생태계 안에 디자인 규칙을 둔다. 이런 시스템의 중심 질문은 “우리 회사 버튼은 무엇인가”보다 **여러 기기와 제3자 앱이 플랫폼답게 동작하려면 무엇을 강제해야 하는가**다.

## 기업 공용형: Carbon과 Atlassian은 이탈을 다른 층에서 다룬다

### Carbon은 시스템을 연합형 조직으로 운영한다

[Carbon](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/)은 IBM이 자금을 대고 회사 제품 요구를 위해 만들지만 외부에는 오픈소스로 공개한다. IBM 내부 일부는 inner source로 운영함. 브랜드와 접근성, 제품용 컴포넌트, 데이터 시각화, 콘텐츠 가이드를 공통 기반에 두되 도메인별 지침이 위에 올라갈 수 있다.

제품팀의 이탈을 막는 장치는 조직적이다.

- 누구나 코드·디자인·문서 아이디어를 제안하고 maintainer review를 거침
- 신규 자산은 usage·style·code·accessibility 문서와 생애주기 기준을 통과함
- 교육·인증·office hours·guild·meetup·design review로 채택을 지원
- 실험 자산은 **Carbon Labs** 같은 별도 공간에서 안정 자산과 구분해 검증
- SemVer, 격주 minor 릴리스, migration 문서로 변경 시점을 제공

Carbon의 반복 결정은 하나의 중앙 컴포넌트 API보다 **누가 실험하고 누가 안정 자산으로 승격할 수 있는가**에 고정돼 있다.

### Atlassian은 도구 안에서 이탈을 발견한다

[Atlassian Design System](https://atlassian.design/)은 외부 기여보다 내부 중앙 조율이 강하다. 공개 [기여 정책](https://atlassian.design/contact-us)은 실제 코드 기여를 Atlassian 직원의 버그 수정과 작은 개선으로 제한하고, 신규 컴포넌트·패턴과 큰 변경은 받지 않음.

대신 설계와 코드 도구의 연결이 촘촘하다.

- [직원용 최신 Figma 라이브러리](https://atlassian.design/get-started/design/figma-libraries)는 React 컴포넌트와 1:1 대응한다고 명시
- ESLint가 deprecated API와 디자인 시스템 위반, 아이콘 레이블 등 일부 접근성 문제를 코드에서 탐지
- Stylelint가 오래된 토큰과 fallback 없는 사용을 탐지
- codemod가 코드 migration을 자동화
- Early Access, Beta, GA, Intent to Deprec, Deprecated의 기대치를 구분
- deprecated 자산에는 대안과 이동 방법을 제공

Carbon이 기여·교육·커뮤니티로 채택을 유지한다면 Atlassian은 **Figma, IDE, CI, migration 도구 안에 준수와 복구를 넣는다.** 우아한공방의 AST Tracker와 codemod, TDS의 CLI·호환 토큰도 이 두 번째 방식과 닿아 있음.

## 업무형: Polaris는 상인이 일을 끝내는 순서를 시스템화한다

[Shopify Polaris](https://shopify.dev/docs/api/polaris)의 현재 공식 문서는 App Home, Admin, POS, Checkout, Customer Accounts처럼 Shopify 앱이 놓이는 표면별 Web Components API를 중심으로 구성된다. 한편 보관된 이전 Polaris 가이드는 landing page와 settings page, data table, empty state, setup flow와 상인 대상 콘텐츠 원칙을 상세히 다뤘다. Polaris를 업무형으로 분류한 것은 **과거에 축적한 상인 업무 가이드와 현재 app-surface별 런타임 구조를 함께 본 해석**이다.

이 점은 11번가나 SEED와 다른 비교 축을 만든다. 브랜드와 범용 UI를 일관되게 만드는 것만으로는 상거래 운영의 복잡한 순서를 설명할 수 없다. 다만 과거 Polaris 가이드의 업무·콘텐츠 원칙이 현재 Web Components 세대에서 같은 공개 운영 체계로 유지된다고 단정해서는 안 됨.

### React의 종료는 시스템의 종료가 아니었다

과거 `@shopify/polaris`의 공식 저장소는 현재 [`polaris-react-archive`](https://github.com/Shopify/polaris-react-archive)로 이름이 바뀌었고 deprecated·unmaintained 상태다. 그러나 Shopify가 Polaris 자체를 끝낸 것은 아님.

2025년 10월 Shopify는 [Unified Web Components의 안정 버전](https://shopify.dev/changelog/polaris-unified-web-components-are-now-stable)을 발표했다. Admin/App Home, POS, Checkout, Customer Accounts를 공통 Web Components로 지원하고 Shopify CDN에서 배포함. React 패키지 중심에서 여러 앱 표면의 공통 런타임으로 이동한 세대교체다.

2026년 6월에는 [Checkout과 Customer Account UI extensions를 위한 AI Toolkit migration](https://shopify.dev/changelog/shopify-ai-toolkit-for-upgrading-extensions-to-polaris-web-components)을 공개했다. React→Preact 변환, 레거시 컴포넌트 치환, extension API 업데이트를 돕는다. 2026년 10월 1일 이후에는 API 버전이 1년 넘게 오래된 extension을 포함한 앱의 업데이트가 제한될 수 있음. 이는 Polaris 전체를 자동 이전하는 도구가 아니라 **해당 extension 표면에 한정된 migration 지원과 종료 시점**의 사례다.

여기서 주의할 점은 과거 Figma–Polaris React 동기화와 토큰 패키지의 공개 운영 방식을 현재 Web Components에 그대로 이어졌다고 말할 수 없다는 것이다. 현재 세대는 공개 구현 저장소보다 Shopify 관리 CDN, 버전별 개발 문서, changelog가 중심으로 보임.

## 공공형: GOV.UK와 NHS는 기여를 증거 심사로 만든다

### GOV.UK는 시스템, 서비스 표준, 평가를 한 루프로 묶는다

[GOV.UK Design System](https://design-system.service.gov.uk/)은 스타일과 컴포넌트뿐 아니라 신청·확인·개인정보·주소 같은 서비스 패턴을 제공한다. 공통 자산으로 출판할 제안은 여러 서비스에서 쓸 수 있고 기존 항목과 중복되지 않아야 함.

출판 기준은 더 까다롭다. [기여 기준](https://design-system.service.gov.uk/community/contribution-criteria/)은 사용성·일관성·범용성과 함께 장애인을 포함한 사용자 연구, 보조기술·브라우저 검증 근거를 요구한다. 중앙 GDS 팀이 최종 검토하지만 범정부 서비스팀의 연구가 자산의 공급망이 됨.

[GOV.UK Service Standard 13](https://www.gov.uk/service-manual/service-standard/point-13-use-common-standards-components-patterns)은 공통 표준·컴포넌트를 사용하고 새 패턴을 다시 공유하도록 서비스팀에 요구한다. 서비스 단계와 위험에 따라 평가 방식은 달라질 수 있지만, **라이브러리, 서비스 표준, 서비스 평가, 공개 기여**가 연결된다는 점은 기업용 라이브러리와 다르다.

### NHS는 같은 구조에 임상 안전을 추가한다

[NHS Design System](https://service-manual.nhs.uk/design-system)은 GOV.UK 기반을 재사용하면서 건강 서비스의 위험을 더한다. [NHS 기여 기준](https://service-manual.nhs.uk/community-and-contribution/contribution-criteria)은 공통 자산으로 출판할 제안에 사용성·일관성·범용성 외에 **임상 안전성**을 별도 게이트로 둔다. 적절한 임상의의 피드백을 반영하고 임상 안전 훈련을 받은 구성원이 검토함.

이 차이는 색이나 코드 스타일에서 나오지 않는다. 잘못된 패턴이 의료 위해로 이어질 수 있기 때문에 중앙 시스템의 품질 기준에 임상 판단이 들어간다. 접근성도 WCAG 2.2 AA, 보조기술, 접근 요구가 있는 사용자의 연구 참여, 접근성 선언과 법적 의무를 함께 연결함.

한국의 KRDS도 공공 서비스형이다. 토큰·컴포넌트·HTML 키트·Figma와 접근성 지침을 공개한다. 다만 이번에 확인한 공개 자료만으로는 제안이 어떤 사용자 연구와 검증을 거쳐 공통 패턴으로 승격되는지, 서비스 평가 결과가 시스템 개선으로 어떻게 환류되는지까지 동일한 수준으로 추적하기 어려웠다. 이는 운영의 부재가 아니라 **공개된 증거 사슬의 차이**로 한정해 비교해야 함.

## AI 대응: 사람이 읽는 문서에서 실행 가능한 지식으로

디자인 시스템의 AI 대응을 ‘AI 버튼이 있는가’로 보면 핵심을 놓친다. 에이전트가 올바른 컴포넌트를 찾고 금지 조건과 migration을 이해하려면 안정된 이름, 타입, 예제, 변경 기록이 먼저 필요함.

현재 공식 자료에서 확인되는 방식은 다음과 같다.

| 시스템 | 기계가 읽는 장치 | 현재 한계 |
|---|---|---|
| **Carbon** | `llms.txt`, Carbon MCP Public Preview | Preview 단계이며 migration 등 일부 기능은 향후 계획으로 제시됨 |
| **Atlassian ADS** | 분할 `llms.txt`, ADS MCP의 공개 remote endpoint·로컬 패키지, lint·codemod | 공식 문서에는 지원 단계·SLA·생성 품질 지표가 명시되지 않음 |
| **Polaris** | Markdown 문서, Shopify dev MCP, AI migration toolkit | 현재 Web Components의 공개 Figma·토큰 운영은 불명확 |
| **SEED** | `llms.txt`, 문서 MCP, Figma MCP, Codegen | 실제 생성 정확도·채택 개선 지표는 공개되지 않음 |
| **우아한공방** | 문서·Figma·Storybook·type·changelog를 MCP로 연결 | 공개 발표는 데모 중심이며 문의 감소율 미공개 |
| **네이버파이낸셜** | Code Connect, instruction, AI 마크업 흐름 | 전체 시스템과 제품 적용 범위는 비공개 |

이 표에서 두드러지는 차이는 국적보다 공개 범위와 검증 수준이다. 해외 사례도 Preview 단계이거나 SLA·효과 지표가 공개되지 않았고, 한국 사례 역시 데모와 도구 공개에 비해 생성 정확도·문의 감소·채택 개선 지표는 제한적임.

그러나 MCP가 있다고 운영 지식이 자동으로 좋아지지는 않는다. 문서가 오래됐거나 Figma와 코드가 어긋나면 에이전트는 그 불일치를 더 빠르게 복제할 수 있다. AI 대응의 선행 조건은 모델이 아니라 **시스템 자산의 동기화와 변경 계약**이다.

## 비교하면 네 가지 시스템 유형이 보인다

| 유형 | 대표 사례 | 시스템에 고정한 결정 | 실패 신호 |
|---|---|---|---|
| **플랫폼형** | Material, One UI, Pleos | 기기·입력·플랫폼별 동작과 지원 우선순위 | 플랫폼별 구현 단절, 생태계 파편화 |
| **기업 공용형** | Carbon, Atlassian, SEED, TDS, 우아한공방 | 브랜드·토큰·기여·배포·migration | detach, fork, 버전 고착, 중앙팀 병목 |
| **업무형** | Polaris | 역할별 과업과 콘텐츠·상태·흐름 | 업무 단절, host 제품과의 불일치 |
| **공공형** | GOV.UK, NHS, KRDS | 공공 UI 표준·접근성·서비스 패턴과 구현 자산. 사용자 연구·안전 증거의 공개 범위는 시스템별로 다름 | 서비스 배제, 접근성·임상 위해, 기관별 중복 |

하나의 시스템이 여러 유형을 가질 수 있다. SEED는 기업 공용형이지만 지역 커뮤니티 제품의 패턴을 품고, Polaris는 기업 시스템이면서 특정 업무에 깊게 들어간다. 분류의 목적은 이름을 고정하는 것이 아니라 비교 질문을 맞추는 데 있음.

## 반가운 지점: 한국 시스템의 강점은 크기보다 운영 문제를 구체적으로 드러내는 데 있다

해외 사례는 공개 코드와 거버넌스, migration 계약을 오래 축적한 경우가 많다. 다만 기업 내부의 실제 채택률과 지원 비용은 공개되지 않는 경우도 많아 문서의 양을 운영 성숙도로 곧바로 환산할 수는 없다. 한국 사례에서 특히 반가운 부분은 TDS가 detach와 fork를 API 실패의 신호로 보고, 우아한공방이 지원 문의와 하드코딩을 측정하는 등 각 조직의 병목을 구체적으로 공개한 대목임.

글로벌 시스템을 그대로 복제하지 않고 조직의 실제 병목을 공개한 자료는 충분히 독자적이다. ‘Material만큼 큰가’보다 ‘우리 제품팀이 왜 공통 시스템에서 이탈했는가’를 설명하는 편이 더 유용함.

## 다르게 볼 부분: 해외 공개성이 곧 더 나은 운영을 뜻하지 않는다

GOV.UK의 기여 기준이나 Carbon의 공개 lifecycle은 외부에서 검증하기 쉽다. 기업 내부 시스템은 채택률과 우선순위를 공개하지 않는 경우가 많다. 이 차이를 그대로 성숙도 차이로 바꾸면 안 된다.

또 공공 시스템의 공개성은 홍보 선택이 아니라 여러 기관이 공동으로 사용하고 시민에게 책임져야 하는 구조에서 나온다. 기업 시스템에 같은 공개 모델을 요구하기 전에 법적 책임, 경쟁 정보, 제품 속도라는 조건을 함께 봐야 함.

## 엇갈리는 지점: 중앙 기준과 제품 자율성은 동시에 커진다

해외와 한국 사례 모두 더 정교한 중앙 도구를 만든다. lint, AST, codemod, MCP, CDN은 기준을 빠르게 전달한다. 동시에 Compound API, Labs, 도메인 계층처럼 제품팀이 공통 컴포넌트 밖에서 실험할 공간도 마련함.

좋은 시스템은 중앙집중과 분산 중 하나를 고르는 것이 아니다. **무엇은 반드시 공유하고, 무엇은 제품이 먼저 탐색하며, 언제 공통 계층으로 돌아오는가**를 명시하는 쪽으로 이동하고 있다.

## 남는 문제: 기계가 읽는 문서의 책임자는 누구인가

사람이 문서를 잘못 읽으면 질문하고 수정할 수 있다. 에이전트가 오래된 토큰이나 deprecated API를 수백 개 화면에 생성하면 오류 규모가 달라짐. `llms.txt`와 MCP의 존재보다 다음 계약이 중요해진다.

- 어떤 버전의 문서와 코드를 함께 제공하는가
- 금지·deprecated·실험 상태를 기계가 구분할 수 있는가
- 생성 결과가 실제 제품에 들어가기 전 어떤 검증을 거치는가
- 잘못된 제안과 사용 데이터를 시스템 개선으로 어떻게 환류하는가

## 남는 질문

한국 디자인 시스템이 해외 사례에서 가져올 것은 더 큰 컴포넌트 카탈로그보다 세 가지 운영 계약에 가깝다.

첫째, 플랫폼과 버전별로 무엇을 적극 지원하고 무엇을 유지보수만 하는지 밝히는 **지원 계약**이다. 둘째, deprecated 자산마다 대안·자동화 도구·종료 시점을 함께 제시하는 **migration 계약**이다. 셋째, 공통 패턴으로 승격할 때 필요한 사용자 연구·접근성·안전 근거를 명시하는 **증거 계약**이다.

`llms.txt`와 MCP는 이 계약을 에이전트가 읽게 만드는 전달 계층일 뿐이다. 문서·Figma·코드의 버전이 맞지 않거나 생성 결과를 멈출 검증 절차가 없다면 AI는 시스템의 일관성보다 오류의 배포 속도를 높일 수 있음.

같은 ‘디자인 시스템’이라는 이름 아래에는 서로 다른 조직 문제가 있다. 비교의 기준은 어느 사이트가 더 완성돼 보이는지가 아니라 **실패했을 때 누가 비용을 부담하는지, 지원 종료와 예외를 누가 결정하는지, 그 결정을 어떤 공개 증거로 검증할 수 있는지**다.
