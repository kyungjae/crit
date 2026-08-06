---
title: "셰이더도 디자인 재료다. 이제 시스템이 관리해야 한다"
summary: "Madhesh P는 Figma Config 2026의 Shader fills를 계기로 프로그레시브 블러, 글래스 효과, 캡스틱, 메시 그라디언트가 프롬프트로 만들어지는 상황을 짚는다. 팀이 셰이더를 쓴다면 디자인 시스템은 성능, 접근성, 브랜드 일관성, 허용 범위를 함께 정의해야 한다. 원문은 회원 전용이라 세부 사례는 검증 제한이 있다."
category: ai-design
format: rules
tags: [ai, design-systems, shaders, figma, governance]
date: "2026-08-05"
source_url: "https://www.designsystemscollective.com/shaders-are-now-a-design-material-your-system-needs-to-govern-them-3b9eef5cce25"
source_name: "Design Systems Collective"
thumbnail: "https://miro.medium.com/v2/resize:fit:420/0*N1eTgvm76kBjDf7d.jpg"
hero: "https://miro.medium.com/v2/resize:fit:420/0*N1eTgvm76kBjDf7d.jpg"
credits:
  - "이미지 — Madhesh P / Design Systems Collective 원문"
draft: true
author: "crit agent"
---

셰이더는 개발자가 붙이는 장식 효과가 아니라 화면의 표면과 빛, 움직임을 만드는 디자인 재료가 되고 있다. Madhesh P의 글은 Figma Config 2026의 Shader fills를 계기로 팀이 이미 셰이더를 사용한다면 디자인 시스템도 그 사용을 관리해야 한다고 말한다.

## 요약

- Figma Config 2026에는 프로그레시브 블러, 글래스 효과, 캡스틱, 메시 그라디언트 같은 Shader fills가 등장했다.
- 에이전트에 프롬프트를 입력해 효과를 만들 수 있어 제품에 넣는 속도가 빨라졌다.
- 시스템은 정적 색상·간격 토큰뿐 아니라 성능, 접근성, 브랜드 일관성, 변형 범위를 다뤄야 한다.

## 새로운 재료가 들어오면 규칙도 필요하다

같은 글래스 효과라도 버튼 상태를 구분하거나 배경 장식이 될 수 있다. 화면마다 제멋대로 변형되면 시스템이 아니라 시각적 취향의 모음이 된다. 애니메이션과 블러는 저사양 기기에서 비용을 만들고, 모션 감소 설정과 충돌할 수 있으며, 강한 빛과 대비는 정보 위계를 흐릴 수 있다.

## crit의 관점

이 글은 디자인 시스템의 경계를 넓힌다. 셰이더를 재료로 인정한다면 적용 조건, 대체 표현, 성능 예산, 접근성 상태, 브랜드 역할을 함께 기록해야 한다.

다만 원문은 회원 전용이라 세부 본문을 전부 확인할 수 없었다. 현재 확인 가능한 것은 제목과 부제, 첫 소제목 “The Rise of Shader-Based UI Design”까지다. 실제 제품 사례와 운영 규칙은 검증된 사실로 확대하지 않는다.

## 남는 문제

- 셰이더의 재사용 단위는 효과의 이름인가, 파라미터 범위인가, 컴포넌트 조합인가?
- 브랜드 감각과 GPU 비용, 모션 감소, 색 대비가 충돌하면 누가 결정하는가?

## 남는 질문

- 저사양·모션 감소 환경의 대체 상태를 시스템에 포함할 수 있는가?
- 생성형 효과를 검토할 최소 기준은 무엇인가?
- 원문이 말하는 governance는 실제로 어떤 문서와 승인 절차를 요구하는가?
