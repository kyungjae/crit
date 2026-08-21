---
title: "스펙 주도 UI 컴포넌트 개발"
summary: |
  • Specs는 Figma·프로토타입·코드·문서의 설계 의도를 정규화·동기화하는 허브임
  • 생성 스펙은 API·Variants·Examples를 담고, 동작·접근성·고급 레이아웃은 사람이 보완함
  • Figma↔Specs↔프로토타입의 네 변환 경로는 손실 없고 빠른 왕복을 목표로 함
  • 버전·스키마·ADR·자동 분석이 변경을 관리하며, React·iOS·Android 구현은 설계 의도를 다시 위로 보냄
  • 모든 경로가 완성된 것은 아니며 Figma의 미래와 한 코드 구현을 기준으로 삼을지는 열려 있음
category: design
format: deep
style: geeknews
tags: [design-system, ui-components, specs, figma, design-to-code]
date: "2026-08-21"
source_url: "https://nathanacurtis.substack.com/p/spec-driven-ui-component-development"
source_name: "Nathan Curtis"
thumbnail: "https://crit.day/images/articles/spec-driven-ui-component-development/hero.png"
hero: "https://crit.day/images/articles/spec-driven-ui-component-development/hero.png"
credits:
  - "대표 및 본문 이미지 — Nathan Curtis / 원문"
draft: true
author: "crit agent"
---

Nathan Curtis가 말하는 Specs는 디자이너가 엔지니어에게 넘기는 문서를 자동으로 만드는 Figma 플러그인에서 출발했다. 지금 그가 만드는 것은 Figma·프로토타입·코드 라이브러리·문서에 흩어진 설계 의도를 기록하고 변환하며 동기화하는 더 넓은 허브임.

이 허브가 곧 하나의 진실 공급원(source of truth)이라는 뜻은 아니다. 각 도구는 여전히 의도가 시작되는 여러 진실의 기원(origins of truth)이고, Specs는 그 사이에서 표현을 정규화하고 버전을 붙인다. 한 사람이나 한 팀이 전체를 소유하지 않기 때문에, Curtis는 각 시스템을 잇는 경계에서 일이 가장 어려워진다고 봄.

![Specs가 Figma·프로토타입과 React·Android·iOS 라이브러리 사이에서 설계 의도를 잇는 구조](/images/articles/spec-driven-ui-component-development/specs-hub.png "여러 구현 표면의 설계 표현을 잇는 Specs 허브. 출처: Nathan Curtis")

## 01. 생성한 스펙을 우선하되 사람이 써야 할 부분을 남긴다

Specs의 콘텐츠는 두 종류다.

- **생성 스펙(Generated specs)** — 결정론적 변환으로 Figma에서 추출함
- **작성 스펙(Authored specs)** — 사람이나 에이전트가 쓰고 함께 검토함

Curtis는 작성보다 생성을 선호한다. 같은 입력에서 예측 가능한 결과를 얻고, 시간이 갈수록 더 많은 항목을 자동 생성하는 방향임. Figma에서 추출하는 컴포넌트 스펙은 세 묶음으로 나뉜다.

- **API** — 컴포넌트 이름, props, elements처럼 외부에서 설정하고 재정의하는 표면
- **Variants** — 스타일, 토큰, prop binding, slot, composition, layout, structure 등을 CSS처럼 겹쳐 선언한 규칙
- **Examples** — 중첩 slot, 콘텐츠, 이미지로 만든 조합 관계. 문서·테스트 케이스·재사용 scaffold에 활용함

하지만 Figma만으로 모든 설계 의도를 표현할 수는 없다. Curtis가 함께 일한 디자이너들은 동작과 접근성을 Figma에 담지 않고, discriminated union이나 prop 사이의 관계 같은 고급 레이아웃·설정도 Figma의 표현 범위를 벗어남.

팀은 이 빈자리를 스펙 저장소의 보완 요구사항으로 채운다. 모든 컴포넌트에 적용하는 규칙도 있고 `card.accessibility.android.md`처럼 플랫폼과 컴포넌트를 특정한 파일도 있다. 디자이너는 에이전트와 skill로 자료를 조사하고 생성 스펙을 분석한 뒤, `MUST`, `SHOULD`, `COULD` 형식의 요구사항을 작성해 PR로 검토받음.

토큰·폰트·아이콘·이미지 같은 foundation도 컴포넌트 바깥의 별도 기반이다. 기업마다 이를 하나의 저장소에 모으기도 하고, 여러 브랜드의 아이콘과 테마 토큰을 관리하는 전용 UI·데이터베이스를 만들기도 한다. 원문은 이 부분이 고객마다 크게 달라 별도의 글이 필요하다고 선을 긋는다.

## 02. 하나의 파이프라인보다 네 개의 왕복 경로를 만든다

디자이너가 date picker는 Figma에서, product card는 웹 기반 프로토타이핑 키트에서 먼저 만들 수 있다. 의도가 시작되는 곳이 다르다면 한쪽을 정답으로 고정하기보다, 그 의도를 다른 표면으로 빠르고 정확하게 옮겨야 함.

Curtis의 작업은 네 경로로 확장되고 있다.

1. **Figma → Specs**
2. **Specs → Figma**
3. **Specs → 프로토타입 코드**
4. **프로토타입 코드 → Specs**

![Figma와 프로토타입에서 시작된 컴포넌트 의도를 Specs와 양방향으로 변환하는 네 경로](/images/articles/spec-driven-ui-component-development/multiple-origins.png "여러 컴포넌트 의도의 기원을 양방향 변환으로 연결한 구조. 출처: Nathan Curtis")

### Figma에서 스펙으로

현재 Figma 스펙은 세 방식으로 생성한다.

- 디자이너가 asset을 만들고 검토할 때 플러그인으로 캔버스 보고서를 생성
- 명령줄·GitHub Action·LLM 채팅에서 Figma REST API를 호출해 `READY_FOR_DEV` 컴포넌트를 찾고, 라이브러리 전체 스펙을 **1분 미만에** 생성
- 플러그인 UI의 bridge를 거쳐 현재 선택한 항목의 스펙을 생성

Plugin API와 REST API는 서로 다르다. 그래서 어느 경로를 택해도 byte-equivalent, 즉 바이트 단위로 같은 스펙을 내도록 skill·fixture·반복 검증·harness를 함께 관리함.

### 스펙에서 Figma로

반대 방향에서는 render 명령이 스펙으로 Figma asset을 다시 만든다. **50개가 넘는 style property**, props, tokens, Figma styles, variant별 prop binding, layout, 기본 콘텐츠가 들어 있는 slot까지 복원한다. 원문의 예시는 컴포넌트 하나를 **1초에** 렌더링함.

![명령줄의 Specs render와 bridge를 거쳐 Figma에 Badge 컴포넌트를 다시 만든 화면](/images/articles/spec-driven-ui-component-development/specs-to-figma.png "Specs render 명령으로 컴포넌트를 Figma에 1초 만에 렌더링한 예시. 출처: Nathan Curtis")

에이전트도 이 작업을 할 수 있지만 Curtis는 추론 비용과 부정확성을 문제로 본다. 계층이 많은 스펙을 추론으로 옮기면 손실이 생길 수밖에 있다는 판단이다. 대신 단일 스크립트로 Specs → Figma → Specs 왕복을 실행하고, variant·style·element·layout이 빠지거나 흐려지지 않은 **byte-identical 결과를** 확인한다.

### 스펙과 프로토타입 사이

Specs의 transform 명령은 CSS, TypeScript contract, React component scaffold, Storybook story를 생성한다. Figma에 표현된 상태와 컴포넌트·element 역할을 이용해 Figma만으로 작성하기 어려운 동작까지 붙임.

이 코드는 프로덕션용이 아니다. 개발을 앞당기는 시작점이나, 충분한 테스트와 엔지니어링 여력을 기다리지 않아도 되는 프로토타이핑 키트의 기반에 가깝다.

반대 방향인 프로토타입 → Specs는 아직 초기 단계다. 에이전트와 스크립트를 섞어 데이터를 추출하되, `generated.css`, `extensions.css`, `overrides.css`처럼 스펙으로 옮길 결정과 플랫폼 전용 코드를 분리하는 구상을 시험 중이다. 특히 layout tree는 단순하지 않으며, Curtis는 초기 단계지만 결과는 유망하다고 설명함.

네 방향의 변환이 손실 없이 저렴하고 빠르게 동작해야 그다음 목표인 표면 간 reconciliation과 synchronization을 시작할 수 있다. 아직은 모든 경로가 그 기준에 도달하지 않았다.

## 03. 스펙 파일 바깥에 변경의 구조를 세운다

스펙은 현재 상태만 담지 않는다. 버전은 설계 의도가 시간에 따라 어떻게 바뀌었는지 보여주고, 각 릴리스에는 changelog·change set·skill이 만든 release note가 붙는다. 팀은 이 자료로 원하는 변경이 맞는지 확인하고 소비자에게 달라진 점을 알림.

![latest와 1.1.0·1.0.1·1.0.0 릴리스, changelog와 release notes를 함께 둔 Specs 폴더 구조](/images/articles/spec-driven-ui-component-development/versioned-releases.png "연속된 Specs 릴리스와 changelog·release notes의 구성. 출처: Nathan Curtis")

명시적 schema에 맞춰 스펙을 검증하면 변경의 크기도 구조로 판별할 수 있다.

- `component.props.prop`을 바꾸거나 제거함 — **Breaking**
- `component.anatomy.element`를 추가함 — **Minor**
- 특정 variant의 element에 연결한 token 값을 바꿈 — **Patch**

Curtis는 breaking change인지 두고 취향에 기대어 오래 논쟁하는 대신, 스키마로 바로 판별하는 상태를 기대한다. schema와 그 안의 콘텐츠가 결합하면 스펙 소비자가 예측 가능하게 구현하고 변경을 점진적으로 받아들이는 contract가 됨.

Schema·도구·모델의 변화는 ADR(Architecture Decision Record)로 남긴다. ADR은 metadata, context, problem, alternatives, decision, consequences, other concerns의 익숙한 형식을 사용한다. 작성자는 LLM과 대안을 넓혀보고 가정을 반박한 뒤 권고안으로 좁히며, 동료는 같은 형식에서 의견을 달고 승인함.

구조화된 데이터는 분석에도 쓰인다. 매 릴리스마다 `specs analyze`가 token과 style 사용처, prop model, dependency, prop와 layer·element의 이름 `key`를 정리한 보고서를 자동 생성한다.

- `text-tertiary` token은 어느 컴포넌트와 element에서 쓰이는가
- 컴포넌트마다 `state` 옵션은 어떻게 다른가
- icon 컴포넌트의 API를 바꾸면 무엇이 영향을 받는가

이 질문은 에이전트가 MCP로 라이브러리를 호출해 매번 데이터를 추출하고 재구성하지 않아도 보고서에서 바로 답할 수 있다. Curtis는 보고서 추가 비용이 매우 낮고, 이미 **5~10개를** 더 계획하고 있다고 적음.

## 04. 엔지니어도 설계 의도를 위로 보낸다

구조화된 Specs는 React·iOS·Android 컴포넌트 코드의 입력이 된다. 엔지니어링팀은 다음 하위 시스템을 만들고 있다.

- 스펙 데이터와 기존 코드를 비교해 CSS·contract·React TSX를 변환하는 cross-platform factory
- 사람과 에이전트가 스펙을 바탕으로 컴포넌트를 마무리하는 플랫폼별 skill과 workflow
- 플랫폼 사이의 gap과 약점을 찾고 Specs 자체의 개선점도 되돌리는 학습 기능
- variant·content·example을 이용해 디자이너 검토와 검증을 빠르게 하는 테스트 기능

흐름은 아래로만 내려가지 않는다. 엔지니어도 API를 확장하고 접근성 문제를 고치며, 디자이너가 생각하지 못한 동작의 빈틈을 메운다. Curtis는 이를 디자이너가 하지 않았을 뿐 분명한 디자인 작업으로 본다. 일부 선택은 이미 요구사항으로 위에 올라가 디자이너의 승인을 받음.

코드 팩토리와 플랫폼 workflow에서 생긴 요청은 schema, transformer, 보완 요구사항, Figma 컴포넌트 작성법까지 바꾼다. Curtis는 티켓을 알맞은 팀에 보내거나 직접 고치면서 어느 부분이 안정적으로 돌고, 어디가 휘고, 어디서 새는지 관찰한다.

## 05. Specs가 문서까지 모두 가져가지는 않는다

Specs도 문서에 정보를 주지만 현재 역할은 제한적이다. 이름과 변경 이력은 스펙에 남아도 React·iOS·Android의 prop table과 사용법은 실제 코드 구현에서 만드는 편이 더 적합하다. 예시 이미지는 계속 Figma asset에서 생성함.

Curtis가 구분한 경계는 간단하다. Specs는 컴포넌트를 **어떻게 잘 만들지에** 더 가깝고, 문서는 컴포넌트를 **어떻게 사용할지를** 다루는 별도 작업이다. 후자는 파트너 팀이 맡는다.

![Figma와 프로토타입, Component Specs, React·Android·iOS 라이브러리를 잇는 전체 구조](/images/articles/spec-driven-ui-component-development/current-state.png "2026년 8월 기준 스펙 주도 UI 컴포넌트 개발의 현재 상태. 출처: Nathan Curtis")

## 06. 동기화보다 먼저 남아 있는 질문들

팀은 설계 표면으로 Figma와 프로토타입을, 개발 표면으로 React·Android·iOS를 지원하기로 했다. Specs를 어디까지 최적화할지도 이 선택에 따라 달라진다. 그러나 원문은 이 구성을 최종 답으로 닫지 않음.

- 디자이너가 Figma 없이 프로토타입에서만 의도를 표현하는 미래가 올까
- 코드 구현끼리 설계 의도를 transpile할 수 있다면 디자이너용 표면은 가치를 잃을까
- 한 코드 구현을 다른 플랫폼이 따르는 대표 구현으로 삼을까, 모든 구현을 동등한 peer로 동기화할까
- AI가 이 일을 전부 맡게 될까

Curtis도 마지막 질문에는 지금 그릴 수 없는 방식으로 가능할 수 있다고 답한다. 다만 도구와 시스템이 설계 의도를 **보이게 하고, 관리할 수 있게 하며, 검증 가능하게 해야 한다는** 기준은 유지한다. 결정을 내리고 그 영향을 확인하며 의도를 가지고 시스템을 바꿀 수 있어야 한다는 결론임.

## crit의 관점

원문이 말한 byte-identical 왕복은 구현 손실을 찾지만, 판단의 이유까지 자동으로 보존하지는 않는다. Figma와 코드 중 어디에서 변경이 시작됐고 누가 검토·승인했는지를 ADR과 PR에 함께 남겨야, 동기화가 설계 책임까지 흐리지는 않는다.
