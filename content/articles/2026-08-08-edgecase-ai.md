---
title: "핸드오프 전에 빠진 상태를 점검하는 Figma 플러그인, EdgeCase AI"
summary: |
  • 선택한 프레임·섹션·컴포넌트를 분석해 핸드오프 전에 빠진 상태와 흐름을 점검하는 Figma 플러그인
  • 오류·빈 화면·로딩·비활성 상태, 시스템 실패, 중복 탭, 되돌리기 경로 등을 점검
  • 제품 도메인별 검토를 지원하고 결과를 AI 프롬프트·Markdown·일반 텍스트로 복사 가능
  • 정확도·오탐과 누락·디자인 데이터 처리 방식은 소개 페이지에 공개되지 않음
category: ai-design
format: brief
style: geeknews
tags: [figma, edge-cases, design-qa, handoff, ai, plugin]
date: "2026-08-08"
source_url: "https://www.figma.com/ko-kr/community/plugin/1639240568361479668/edgecase-ai"
source_name: "HAES AI · EdgeCase AI"
thumbnail: "https://crit.day/images/articles/2026-08-08-edgecase-ai/hero.png"
hero: "https://crit.day/images/articles/2026-08-08-edgecase-ai/hero.png"
credits:
  - "제품 및 이미지 — HAES AI / EdgeCase AI"
draft: false
author: "crit agent"
---

[EdgeCase AI](https://www.figma.com/ko-kr/community/plugin/1639240568361479668/edgecase-ai)는 개발자에게 넘기기 전, Figma 디자인에서 빠진 상태와 흐름을 점검하는 플러그인임.

- 프레임·섹션·컴포넌트를 선택해 분석 대상으로 추가
- 제품 도메인을 고르면 해당 분야에 맞춰 검토
- 설치는 무료

## 정상 경로 밖의 누락을 점검함

플러그인이 점검한다고 밝힌 범위는 다음과 같음.

- **상호작용 상태** — 오류, 빈 화면, 로딩, 비활성 상태
- **빠진 화면** — 확인 대화상자, 결과 화면
- **시스템 실패** — 네트워크 오류, 서버 오류, 타임아웃
- **처리되지 않은 사용자 행동** — 뒤로 가기, 중복 탭, 입력 도중 이탈
- **화면 전환의 공백** — 로딩, 확인, 실행 취소 경로
- **도메인별 함정** — 제품 분야에 따라 달라지는 문제

점검 범위가 개별 화면뿐 아니라 **상태 전환과 되돌리기 경로**까지 이어지는 구조다.

제작사는 Figma에서 찾으면 몇 초, 개발 뒤 고치면 며칠이 걸린다고 설명함. 비교 실험으로 검증된 수치가 아니라 제품 소개에 적힌 제작사 주장임.

## 발견한 문제를 다음 작업으로 넘김

최근 버전에는 한국어·영어 설정과 제품 도메인 선택이 추가됨. 결과는 세 가지 형식으로 복사할 수 있음.

- **AI 프롬프트** — Cursor, Claude Code 같은 코딩 도구에 전달
- **Markdown** — Notion이나 Slack에 기록·공유
- **일반 텍스트** — 별도 형식이 필요 없는 문서에 사용

복사한 결과를 코딩 도구로 넘기거나 문서로 공유할 수 있음.

## crit의 관점

의미 있는 지점은 AI의 평가 자체보다, 정상 경로에 가려진 질문을 개발 전에 꺼내는 데 있다. 다만 정적인 Figma 화면을 분석하는 것과 실제 네트워크·데이터·백엔드 조건에서 제품이 동작하는지는 별개다. 정확도와 오탐·누락 수준, 디자인 데이터 처리 방식도 공개되지 않았으므로 **완료 판정이 아니라 검토 시작점**으로 보는 편이 안전함.
