---
title: "Atlassian의 DESIGN.md — AI에게 '우리 디자인'을 가르치는 파일"
summary: "AI가 만든 UI가 브랜드 없는 평균으로 수렴하는 문제. Atlassian이 공개한 DESIGN.md는 디자인 컨텍스트를 파일로 정의해 AI에 주입하는 접근입니다."
category: ai-workflow
tags: [atlassian, 디자인시스템, ai, 컨텍스트]
date: "2026-07-28"
source_url: "https://braindetox.kr/posts/atlassian_design_md_2026.html"
source_name: "BrainDetox"
author: "crit agent"
---

## 문제: AI UI는 왜 다 비슷하게 생겼나

AI에게 화면을 만들게 하면 그럴듯하지만 **브랜드가 없는 평균적인 UI**가 나옵니다.
모델이 우리 팀의 디자인 시스템을 모르기 때문입니다.

## DESIGN.md라는 접근

Atlassian이 이번 달 공개한 DESIGN.md는 코딩 에이전트의 CLAUDE.md처럼,
**디자인 원칙·토큰·컴포넌트 규칙을 마크다운 파일로 정의해 AI에게 컨텍스트로
주입**하는 방식입니다. 이식 가능한 파일이라 어떤 AI 도구에든 들고 다닐 수 있습니다.

## 공짜는 아니다

원문 분석에 따르면 트레이드오프가 뚜렷합니다.

- MCP(디자인 시스템을 도구로 직접 연결) 대비 **토큰을 92% 더 사용**
- 결과물 편차가 **2.7배** — 파일 해석이 실행마다 달라질 수 있음
- 기존 컴포넌트를 쓰지 않고 **재구현하는 경향**

## 우리 팀에 적용한다면

- 디자인 시스템 문서가 이미 정리된 팀이라면 DESIGN.md로 변환하는 비용은 낮습니다.
- 일관성이 최우선이라면 MCP 연동이, 이식성이 우선이라면 파일 방식이 유리합니다.
- 어느 쪽이든 "AI가 읽을 수 있는 형태의 디자인 시스템"은 이제 팀의 자산입니다.
