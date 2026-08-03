# crit design system

`crit`는 디자이너가 좋은 링크를 빠르게 훑고, 읽고, 의견을 남기는 편집형 피드다. Searchable의 블로그처럼 콘텐츠가 먼저 보이고 UI는 읽기를 방해하지 않아야 한다.

## Visual direction

- **Tone**: editorial, sharp, quiet, useful. 둥근 SaaS 대시보드보다 잡지/리서치 아카이브에 가깝게 만든다.
- **Canvas**: light `#fafaf9` / dark `#0a0a0a`. 흰 카드는 콘텐츠 그룹이 필요할 때만 사용한다.
- **Accent**: 현재 crit의 violet `#6c5ce7`. 링크, 카테고리, 활성 상태에만 제한적으로 사용한다.
- **Borders**: `neutral-200` / dark `neutral-800`; 그림자보다 얇은 선과 여백을 우선한다.
- **Radius**: 리스트 컨테이너와 입력은 12–16px, 작은 pill은 full radius. 모든 것을 pill로 만들지 않는다.

## Typography

- 기본 폰트는 Pretendard Variable.
- UI meta: 11–12px, medium/bold, 넓은 tracking.
- 피드 제목: 17–18px, bold, `-0.025em` 정도의 tight tracking.
- 상세 제목: mobile 32px / desktop 44px, `1.3–1.35` line-height.
- 본문: desktop 19px / mobile 17px, `1.85–1.9` line-height.
- 한국어 본문은 `word-break: keep-all`을 유지하되, 긴 URL/코드는 별도 overflow 처리를 한다.

## Layout & spacing

- 데스크톱 상세 페이지는 `220px TOC + 760px reading column` 구조, gap 64px.
- 상세 헤더는 본문보다 넓은 최대 860px. 본문은 읽기 좋은 760px로 제한한다.
- TOC는 데스크톱에서 `top: 88px` sticky. 모바일에서는 본문 시작 전 inline block.
- 긴 글의 h2는 충분한 섹션 간격을 갖고, 문단은 30–42px 간격을 둔다.
- 피드에서는 리스트 탐색 밀도를 유지하고, 상세에서만 읽기 호흡을 크게 한다.

## TOC

- 숫자 카드나 큰 배경 박스를 사용하지 않는다.
- 얇은 세로 라인 + 현재 섹션의 accent line + bold text로 현재 위치를 표현한다.
- 제목은 자동으로 markdown `##`에서 추출하고 `rehype-slug`와 같은 slug 규칙을 사용한다.
- 3개 미만의 heading에는 TOC를 노출하지 않는다.

## Images

- 썸네일은 정보 보조 수단: 피드에서는 작은 `80px` 정사각형, featured에서는 4:3.
- 상세 hero는 제목과 본문 사이에서만 크게 사용하고, 본문 이미지는 markdown 흐름을 따른다.
- 이미지가 하나면 figure + caption, 여러 장이면 2열/3열 gallery.
- 장식 이미지의 alt는 비워두고, 설명이 필요한 이미지에는 짧고 실제적인 alt/caption을 작성한다.
- 이미지가 없을 때는 보라색 radial fallback을 사용하되, 콘텐츠를 가장하지 않는다.

## Interaction

- 링크 hover는 색상 변화로만 처리한다. 과한 scale/애니메이션은 피한다.
- TOC는 IntersectionObserver로 현재 읽는 섹션을 표시한다.
- 모바일에서는 TOC와 본문이 가로 overflow를 만들지 않아야 한다.
- dark mode에서도 동일한 정보 계층을 유지하고 색상 대비만 조정한다.
