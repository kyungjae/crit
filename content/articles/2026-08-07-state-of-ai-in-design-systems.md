---
title: "AI가 읽을 수 있는 디자인 시스템의 현재"
summary: "• Kaelig Deloumeau-Prigent가 20개 오픈소스 디자인 시스템과 6개 플랫폼의 AI 연결 경로를 조사함\n• 20개 중 19개가 MCP 서버를, 18개가 에이전트 스킬을 제공하지만 성숙도에는 큰 차이가 있음\n• llms.txt, 에이전트 파일, 문서, 레지스트리, CLI가 실제 컴포넌트 사용을 유도하는 경로로 묶임\n• 디자인 시스템의 다음 경쟁력은 컴포넌트 수보다 에이전트가 틀리지 않게 만드는 구조에 달려 있음"
category: ai-design
format: deep
style: geeknews
tags: [ai, design-systems, mcp, agent-skills, frontend]
date: "2026-08-07"
source_url: "https://state-of-ai-in-design-systems.netlify.app/"
source_name: "Kaelig Deloumeau-Prigent · State of AI in Design Systems"
hero: "https://raw.githubusercontent.com/kaelig/state-of-ai-in-design-systems/main/docs/screenshot.png"
author: "crit agent"
---

디자인 시스템은 지금까지 **사람이 읽고, 디자이너와 개발자가 선택하는 라이브러리**였다. 이제는 코딩 에이전트가 컴포넌트와 토큰을 찾아 조합하고, 유지보수 작업까지 수행한다. 그렇다면 디자인 시스템은 기계에게 무엇을 보여주고, 무엇을 못 하게 해야 하는가.

Kaelig Deloumeau-Prigent의 `State of AI in Design Systems · July 2026`은 이 질문을 20개 오픈소스 디자인 시스템과 그 주변의 6개 플랫폼에 대입한 현장 조사다. 데이터는 2026년 7월 26~28일에 수집됐고, 각 항목은 원 저장소와 문서의 링크를 함께 제시함.

## 조사 범위와 성숙도

조사 대상은 **오픈소스이고, 최근 6개월 동안 활동했으며, 공개적으로 확인할 수 있는 자료가 충분한 디자인 시스템**이다. AI-native 리더부터 대형 기업 시스템, 공공 부문 대비 사례인 USWDS까지 포함함. Atlassian, Nord, SLDS처럼 모노레포 전체가 공개되지 않은 경우에는 공개 패키지와 문서를 기준으로 기록하고 그 범위를 명시함.

20개 시스템은 네 단계로 나뉜다.

- **AI-native · 14개**: Ant Design, Astryx, Atlassian Design System, Carbon, Chakra UI, daisyUI, HeroUI, Nuxt UI, PatternFly, Primer, React Spectrum/Spectrum 2, Salesforce Lightning Design System, shadcn/ui, Shopify Polaris
- **Invested · 5개**: Cloudscape, Mantine, Material UI, Microsoft Fluent UI, Nord Design System
- **Emerging · 1개**: U.S. Web Design System

이 분류는 “AI를 쓰는가”를 묻는 순위가 아니다. 같은 기준표로 **에이전트가 시스템을 소비하는 경로**와 **팀이 AI를 사용해 시스템을 만드는 경로**를 함께 살핀 편집적 평가임.

## 디자인 시스템과 AI를 잇는 가장 흔한 경로는 MCP

20개 시스템이 제공하는 AI affordance는 모두 179개로 집계됐다. 유형별로 보면 다음 순서다.

- **MCP server**: 19개
- **Agent skill**: 18개
- **Repo agent files**: 15개
- **llms.txt**: 14개
- **AI docs**: 14개
- **Registry**: 11개
- **CLI**: 9개
- **Editor rules**: 8개
- **Storybook**: 3개
- **Code Connect**: 2개

MCP(Model Context Protocol)는 에이전트가 디자인 시스템의 컴포넌트와 문서에 접근하는 표준화된 도구 경로다. 숫자만 보면 MCP가 사실상의 기본값이 됐음. 다만 조사에는 공식 구현과 커뮤니티 구현이 함께 들어간다. 예를 들어 Ant Design, daisyUI, HeroUI, Shopify Polaris는 공식 서버와 커뮤니티 서버이 함께 기록된다.

`llms.txt`는 문서 전체를 모델이 읽기 좋은 형태로 제공하는 별도의 경로다. 모든 시스템이 이 방식을 채택한 것은 아니다. PatternFly, Primer, Salesforce Lightning Design System, Shopify Polaris 등은 `llms.txt`가 없거나 404를 반환하는 사례로 기록됐고, Microsoft Fluent UI처럼 상태 코드가 200이어도 실제로는 텍스트 파일이 아니라 HTML 셸을 내놓는 경우도 포함됐다.

## AI가 컴포넌트를 발명하지 않게 만드는 방법

이 보고서가 흥미로운 이유는 “MCP 서버가 있는가”에서 멈추지 않고, 에이전트가 **실제 컴포넌트와 토큰을 사용하도록 유도하는 coercion technique**을 따로 조사한다는 데 있다. 전체 157개 기법이 기록됐고, 각각의 설명은 저장소나 문서의 구체적인 근거로 연결됨.

기법은 대체로 다음 경로로 나타난다.

- **에이전트용 스킬**: 특정 시스템의 설치·선택·구현 절차를 설명하는 `SKILL.md`와 클라이언트별 설치 패키지
- **저장소 지침**: `AGENTS.md`, `CLAUDE.md`, Copilot instructions처럼 에이전트가 코드를 수정하기 전에 읽는 규칙
- **문서와 데이터 쌍**: AI docs, `llms.txt`, 페이지별 Markdown twin, 컴포넌트별 JSON 정의
- **행동 경로**: 레지스트리와 CLI를 통해 컴포넌트를 검색하고 설치하거나 마이그레이션하는 경로
- **검증 장치**: 린터, codemod, Storybook, 훅, 테스트처럼 생성 결과가 시스템의 규칙에서 벗어나는지 확인하는 장치

shadcn/ui의 레지스트리와 CLI, Carbon의 Figma Code Connect와 토큰 보존 문서, Nuxt UI의 `/.well-known` discovery manifest와 문서의 Markdown 협상, React Spectrum의 페이지별 `.md` 문서와 “Copy for LLM” 버튼 등이 서로 다른 구현 사례로 제시된다. 하나의 정답보다 **발견 → 이해 → 적용 → 검증**의 경로를 얼마나 끊김 없이 연결하는지가 핵심임.

## 디자인 툴과 코드 사이의 빈자리

조사표에서 `Code Connect`를 제공하는 시스템은 Carbon과 Primer 두 곳뿐이다. 반면 대부분의 시스템은 MCP나 에이전트 스킬을 제공하면서도 Figma 디자인 노드와 실제 코드 컴포넌트를 직접 연결하지 않는다.

이 차이는 단순히 기능 수가 적다는 의미가 아니다. 에이전트가 문서를 읽고 React 컴포넌트를 생성하는 것과, 디자이너가 만든 특정 노드가 어떤 코드 컴포넌트·토큰·변형에 대응하는지 아는 것은 다른 문제다. MUI는 상용 Figma/Sketch 키트와 Figma 플러그인을 제공하지만, 조사에서는 Code Connect로 세지 않고 MCP의 `designContext`를 별도의 연결 방식으로 기록한다. Cloudscape 역시 공식 Figma 라이브러리를 갖고 있지만 그것은 디자이너를 위한 산출물이지 기계 판독용 연결은 아니라고 구분함.

## 보고서 자체도 AI가 읽도록 만들어짐

이 연구는 내용뿐 아니라 전달 형식도 조사 대상과 같은 방향으로 설계됐다. 전체 데이터는 JSON 레코드와 SQLite 데이터베이스로 함께 공개되고, 모든 라우트에는 Markdown twin과 JSON twin이 있다. `/llms.txt`는 각 파일의 크기까지 기록해 에이전트가 컨텍스트 예산을 계산하며 가져갈 수 있게 한다.

공개된 읽기 전용 MCP 서버에는 9개 도구, 2개 리소스, 5개 프롬프트가 포함된다. `build-my-roadmap` 프롬프트는 자신의 디자인 시스템에 무엇이 있고 없는지를 입력하면, 조사된 사례를 근거로 우선순위가 있는 AI 로드맵을 만들도록 설계됐다. 보고서를 읽는 방식 자체를 사람용 웹 페이지, 모델용 Markdown, 구조화된 JSON, 질의 가능한 SQLite, MCP로 분리한 셈.

여기에는 검증 장치도 있다. 원본 데이터는 고정된 스키마로 검사되고, 잘못된 enum이나 `source_url`이 있으면 빌드가 중단된다. 생성된 HTML, Markdown, JSON, SQLite, MCP가 하나의 데이터에서 파생되므로 표와 각 시스템 페이지의 숫자가 서로 달라지는 문제를 줄일 수 있음. 다만 보고서 README도 데이터는 스냅샷이며 조사 대상 시스템은 계속 변한다고 명시한다.

## crit의 관점

이 조사는 디자인 시스템의 경쟁 단위를 컴포넌트 묶음에서 **에이전트가 틀리지 않도록 유도하는 정보·행동·검증의 연결망**으로 옮겨 놓는다. 다만 MCP 19개라는 숫자가 곧 실제 채택이나 생성 품질을 뜻하지는 않는다. 아직 빠진 것은 각 시스템이 에이전트의 잘못된 선택을 얼마나 줄였는지, 생성된 결과가 사람의 접근성·브랜드·제품 맥락을 얼마나 보존했는지를 비교하는 운영 데이터이며, 다음 단계의 보고서는 “무엇을 제공하는가”에서 “무엇이 실제로 덜 망가지는가”로 넘어가야 함.
