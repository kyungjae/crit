---
title: "Gemma Translator, 라즈베리 파이 5 안에서 끝나는 오프라인 음성 통역기"
summary: |
  • Gemma Translator는 음성 인식부터 번역·음성 출력까지 기기 안에서 처리하며, 설치 뒤에는 인터넷이 필요 없음
  • Moonshine이 음성을 받아 적고 Gemma 4가 번역한 뒤 moonshine-voice가 읽어주는 구조로, 한국어를 포함한 6개 언어를 지원함
  • 두 사람이 마주 보는 2개 언어 레인과 1인 조작·2인 조작 모드를 480×320 화면에 맞춰 설계함
  • 배포 스크립트와 3D 프린트용 STL까지 제공하지만 현재 조작은 키보드 전용이며 품질·지연시간 수치는 공개하지 않음
category: tools
format: deep
style: geeknews
tags: [gemma, raspberry-pi, offline-ai, voice-translation, open-source, edge-ai]
date: "2026-08-08"
source_url: "https://github.com/google-gemma/gemma-translator"
source_name: "Google Creative Lab · Gemma Translator"
thumbnail: "https://crit.day/images/articles/gemma-translator/hero.png"
hero: "https://crit.day/images/articles/gemma-translator/hero.png"
credits:
  - "제품·이미지 — Google Creative Lab / Gemma Translator"
  - "소스 코드 — Apache License 2.0"
draft: true
author: "crit agent"
---

번역 앱을 여는 대신 작은 기기를 두 사람 사이에 놓는다. 한쪽이 말하면 기기가 음성을 받아 적고, 번역하고, 상대 언어로 다시 읽는다. [Gemma Translator](https://github.com/google-gemma/gemma-translator)는 이 과정을 라즈베리 파이 안에서 끝내는 오픈소스 음성 통역기다.

## 음성 입력부터 출력까지 로컬에서

처리 순서는 세 단계다. 브라우저가 마이크 음성을 녹음해 **16kHz 모노 데이터로 리샘플링**하면 Moonshine이 텍스트로 바꾼다. 로컬에서 실행 중인 `gemma4-e2b` 모델이 이를 번역하고, moonshine-voice가 상대 언어의 음성으로 합성함.

Gemma 4는 LiteRT-LM으로 구동되며, 프런트엔드는 로컬 API만 호출한다. 모델과 의존성을 처음 내려받은 뒤에는 인터넷 연결 없이 작동한다는 것이 프로젝트의 핵심이다. 지원 언어는 **아랍어·영어·스페인어·일본어·중국어·한국어** 6개다.

필요한 하드웨어도 구체적이다. **8GB 메모리의 Raspberry Pi 5**, 마이크, 스피커나 헤드폰, 디스플레이를 요구하며 README는 480×320 키오스크 화면을 예로 든다. 단순한 웹 데모보다 작은 독립형 장치를 전제로 한 구성임.

## 화면을 두 사람 사이의 경계로 나눔

인터페이스에는 서로 마주 보는 두 개의 언어 레인이 있다. 각 레인은 회전식 리볼버처럼 언어를 바꾸며, 두 레인에는 같은 언어를 동시에 놓을 수 없다. 말한 사람의 레인에서 녹음을 시작하면 결과는 반대편 레인의 언어로 나온다.

조작 방식은 두 가지다.

- **Landscape 모드** — 한 번에 한 사람을 활성화함. `Space`로 사람을 바꾸고 `Z`를 누르는 동안 녹음하며, 좌우 화살표로 언어를 고름
- **Vertical 모드** — 두 레인에 키를 따로 배정함. 첫 번째 사람은 `Z`와 좌우 화살표, 두 번째 사람은 `X`와 `−`·`+`를 사용함

Landscape 모드에서는 활성 레인을 네 모서리의 브래킷으로 표시하고, 녹음 중에는 색을 반전한다. 작은 화면에서 긴 안내문 대신 **누가 말할 차례인지, 어느 언어가 선택됐는지**를 상태 변화로 보여주는 설계다.

## 모델 데모를 하나의 장치로 묶었다

저장소에는 프런트엔드와 Python API뿐 아니라 설치·모델 다운로드·실행 스크립트가 함께 들어 있다. `deploy-pi.sh`를 실행하면 필요한 패키지를 설치하고 UI를 빌드하며, LiteRT 모델을 내려받고 systemd 서비스를 등록한다. Chromium이 `localhost:3000`을 여는 키오스크 설정까지 이어진다.

![Gemma Translator의 화면·본체·스피커 지지대를 설계하는 CAD 화면](/images/articles/gemma-translator/enclosure-cad.png "3D 프린트 케이스 설계. 출처: Google Creative Lab / Gemma Translator 저장소")

물리적 외형도 소스에 포함했다. `front-face`, `main-body`, `speaker-support` 세 개의 STL 파일을 내려받아 케이스를 출력할 수 있음. 화면, 로컬 모델, 음성 입출력, 부팅 뒤 자동 실행, 외형까지 하나의 제작 단위로 묶은 셈이다.

다만 현재 빌드에서 녹음과 언어 변경은 **키보드로만** 할 수 있다. 화면 속 화살표는 레이아웃용으로 숨겨져 있고 터치 조작은 활성화되지 않았다. 저장소는 번역 정확도, 음성 인식 품질, 전체 지연시간, 배터리 지속시간을 제시하지 않음.

이 프로젝트는 Google Creative Lab의 Alan Yam, Shashwath Santosh, Dan Motzenbecker가 만들었고 Apache 2.0으로 공개했다. README는 동시에 **공식 지원되는 Google 제품이 아니며**, Google의 오픈소스 보안 취약점 보상 프로그램 대상도 아니라고 명시한다.

## crit의 관점

이 프로젝트에서 눈여겨볼 지점은 Gemma 자체보다 음성 인식·번역·음성 합성을 오프라인 대화 기기 하나로 통합한 방식이다. 다만 키보드 없이 두 사람이 바로 쓸 수 있는 조작과 소음 환경의 인식률·왕복 지연시간이 확인돼야, 인상적인 프로토타입을 넘어 통역 도구로 판단할 수 있음.
