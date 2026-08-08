---
title: "Maya, 화면 녹화를 제품 데모 영상으로 다듬는 macOS 앱"
summary: |
  • iPhone 화면 녹화에 기기 프레임, 배경, 줌·탭 효과를 붙이는 오픈소스 macOS 편집기
  • 5개 화면비와 MP4·투명 MOV 내보내기를 지원해 홍보 영상·튜토리얼 제작 흐름을 줄임
  • v1.1은 실제로 쓸 수 있지만 macOS 26.3 이상, 프로젝트 저장·Undo·HDR 미지원 제약이 있음
  • X에는 실제 프로모션 영상 제작 사용기와 호평이 확인됐고, GitHub에서는 외부 기여가 이어짐
category: tools
format: deep
style: geeknews
tags: [maya, macos, screen-recording, video, open-source, swiftui]
date: "2026-08-08"
source_url: "https://github.com/ronaldo-avalos/Maya"
source_name: "Ronaldo Avalos · Maya"
thumbnail: "https://ronaldo-avalos.github.io/Maya/screenshot.png"
hero: "https://ronaldo-avalos.github.io/Maya/screenshot.png"
credits:
  - "제품 및 이미지 — Ronaldo Avalos / Maya"
  - "소스 코드 — MIT License"
draft: true
author: "crit agent"
---

화면 녹화를 끝냈다고 바로 제품 데모가 되는 것은 아니다. 기기 프레임을 씌우고, 세로·가로 비율을 맞추고, 배경을 고르고, 중요한 조작에는 확대와 탭 표시를 넣어야 한다. 일반 영상 편집기로도 할 수 있지만 짧은 앱 홍보 영상 하나를 위해 매번 같은 설정을 반복하게 됨.

[Maya](https://github.com/ronaldo-avalos/Maya)는 이 반복 작업에만 초점을 맞춘 네이티브 macOS 편집기다. 화면 녹화를 불러와 마케팅 클립, 소셜미디어 게시물, 앱 안의 튜토리얼 오버레이로 다듬는다. SwiftUI·AVFoundation·Core Image·Metal로 만들었고 서버나 계정 없이 로컬에서 작동하는 MIT 라이선스 오픈소스임.

## 프레임, 캔버스, 움직임을 한 화면에

편집 화면은 왼쪽 설정 패널, 가운데 캔버스, 아래 타임라인, 오른쪽 애니메이션 편집 패널로 나뉜다. 녹화를 올린 뒤 다음 요소를 한 프로젝트 화면에서 조정할 수 있다.

- **기기 프레임** — iPhone 15 Pro·16 Pro·17 Pro와 MacBook Pro 14, 브랜드가 없는 Generic, 프레임을 제거한 No frame을 지원함. 색상, 크기, 위치, 모서리 반경, 그림자도 바꿀 수 있음
- **캔버스** — 1:1(1080×1080), 9:16(1080×1920), 4:5(1080×1350), 4:3(1440×1080), 16:9(1920×1080)를 제공함
- **배경** — 투명, 단색, 그라디언트, 이미지, 원본 영상 블러의 5가지 모드가 있음
- **타임라인** — 영상 앞뒤를 자르고 재생 위치를 훑으며, 줌과 탭 이벤트를 별도 트랙에 놓을 수 있음
- **움직임** — 확대 위치·배율·지속시간과 Spring, Bouncy, Smooth, Snappy, Gentle, Linear 곡선을 조정함. 탭 표시는 Ripple, Pulse, Ring 중에서 고름

줌 이벤트는 블록을 옮기거나 양쪽 끝을 잡아 길이를 바꾼다. Quick Punch, Dramatic, Top Focus, Bottom Focus, Soft Reveal 등 5개 프리셋으로 시작한 뒤 세부 값을 조절할 수 있다. 탭 이벤트도 화면의 위치와 색, 크기, 지속시간을 지정하며 미리보기와 최종 영상에 같은 방식으로 들어감.

## 출력물은 두 갈래다

배경이 있으면 선택한 화면비에 맞춘 H.264 MP4를 만든다. Reels, TikTok, Shorts, YouTube, X에 바로 올리는 용도다. 배경을 `None`으로 두면 HEVC 알파 채널이 포함된 MOV를 출력한다. Final Cut이나 Motion, 앱 안의 AVKit 화면에서 기기 프레임과 녹화 영상을 다른 장면 위에 얹을 때 쓰는 경로임.

범용 비선형 편집기(NLE)를 대신하려는 도구는 아니다. 여러 영상·오디오 트랙, 자막, 복잡한 합성보다 **한 개의 화면 녹화를 보기 좋은 제품 데모로 포장하는 과정**에 범위를 좁혔다. 기능이 적어서가 아니라 작업 단위를 작게 잡은 제품에 가깝다.

## v1.1은 쓸 수 있지만 아직 초기 제품이다

Maya 저장소는 2026년 5월 17일 만들어졌고, 8월 2일 [v1.1](https://github.com/ronaldo-avalos/Maya/releases/tag/v1.1)이 나왔다. 조사 시점 공개 지표는 **GitHub 스타 514개, 포크 30개**, v1.1 DMG 다운로드 182회다. 최신 릴리스에는 사이드바가 잘리거나 프리셋 편집 중 앱이 종료되는 문제, 줌 구간 드래그가 끊기는 문제를 고친 변경과 탭 피드백 기능이 포함됐다.

설치 파일은 Developer ID로 서명하고 Apple 공증을 거쳤지만 요구 환경이 **macOS 26.3 Tahoe 이상**으로 높다. 프로젝트를 저장해 다시 여는 `.mayaproj`, Undo/Redo, 자동 탭 감지, 자막·주석 트랙, HDR 유지, 오디오 파형은 아직 구현 목록에 남아 있다. 현재 합성기는 세로 화면 녹화를 전제로 하며, 투명 MOV는 HEVC 알파를 받을 수 있는 편집 환경이 필요함.

## README보다 코드가 더 최신이다

공식 README는 프리셋을 8개라고 적었지만 현재 `main`의 [`ZoomKeyframe.swift`](https://github.com/ronaldo-avalos/Maya/blob/main/Maya/Models/ZoomKeyframe.swift)와 공식 화면에는 5개만 있다. 반대로 README의 ‘향후 기능’에 남은 트림과 프리셋 미리보기 갤러리는 이미 구현돼 있다. MacBook Pro 14 프레임도 코드와 화면에는 있지만 주요 기능 설명에서는 빠져 있음.

열린 [문서 수정 PR #8](https://github.com/ronaldo-avalos/Maya/pull/8)도 이 차이를 바로잡으려 한다. 빠르게 기능이 들어온 만큼 설명이 따라오지 못한 상태다. 지금 가능한 일을 판단할 때는 README만 읽기보다 최신 릴리스와 실제 소스를 함께 보는 편이 안전함.

## SNS와 GitHub에서 확인된 반응

가장 크게 퍼진 글은 제작자 Ronaldo Avalos의 출시 게시물이다. 그는 Maya를 Claude Code로 약 2시간 만에 만들었다고 소개했다. 조사 시점 기준 조회수 2.4만 회, 좋아요 264개, 재게시 14회, 답글 15개를 기록했다. 다만 제작자 자신의 발표이므로 이 숫자를 사용자 만족도로 읽을 수는 없다.

https://x.com/ronaldo_avals/status/2055877084765982738

확인 가능한 제3자 반응은 많지 않지만 실제 사용 사례가 하나 있다. Yago는 새로 출시한 앱의 첫 프로모션 영상을 만드는 데 Maya를 썼다고 답했다. 단순한 링크 공유가 아니라 결과물을 만든 뒤 남긴 반응임.

https://x.com/yagomp/status/2056328152943665648

Stephan은 “정말 멋지다. 내 스타를 받으라”고 답하며 GitHub 스타를 주겠다고 밝혔다.

https://x.com/Stephan_Kop/status/2056109763352465862

GitHub 쪽 반응은 더 구체적이다. AyoParadis는 실제로 내보내기를 하면서 창에 가려지는 컨트롤, 분명하지 않은 재생·탐색 방식, 드래그할 때마다 스냅되어 튀는 애니메이션 구간을 발견해 [개선 PR #2](https://github.com/ronaldo-avalos/Maya/pull/2)를 올렸다. 이 PR 자체는 병합되지 않았지만 이후 hknakn이 제출한 사이드바·크래시 수정 [#5](https://github.com/ronaldo-avalos/Maya/pull/5), 탭 피드백 [#6](https://github.com/ronaldo-avalos/Maya/pull/6), 줌 드래그 수정 [#7](https://github.com/ronaldo-avalos/Maya/pull/7)이 v1.1에 들어갔다. 넓은 여론이라기보다, 작은 사용자·기여자 집단이 문제를 찾아 제품을 밀어 올리는 단계로 보는 편이 정확하다.

## crit의 관점

Maya의 장점은 영상 편집 기능을 많이 넣은 데 있지 않다. 앱 화면 녹화가 공유 가능한 데모가 되기까지 반복되는 프레임·비율·배경·확대·탭 표시를 한 작업 흐름으로 묶었다. 이 좁은 범위 덕분에 일반 영상 편집기보다 무엇을 먼저 해야 하는지가 분명하다.

## 다르게 볼 부분

출시 글에서 가장 눈에 띄는 숫자는 ‘Claude Code로 약 2시간’이지만, 실제 제품성을 만든 것은 그 뒤의 수정이다. 초기 버전에는 사이드바 클리핑, 프리셋 크래시, 줌 드래그 끊김이 있었고 외부 기여자가 이를 고쳤다. 제작 속도는 관심을 모았지만, 반복해서 쓸 도구인지 판단하는 근거는 v1.1의 수정 내역과 앞으로의 유지보수에 있음.

## 남는 질문

- 프로젝트 저장과 Undo가 없는 상태에서 여러 버전의 홍보 영상을 반복 제작하는 흐름까지 감당할 수 있는가.
- 오래된 macOS, 가로 녹화, HDR을 지원하기 전에 기기 프레임과 편집 기능이 계속 늘어나면 현재의 좁고 선명한 범위를 유지할 수 있는가.
- README와 코드의 차이를 줄이고 자동 테스트·상시 빌드 검증을 갖추는 일이 새 기능보다 먼저 다뤄질 것인가.
