# TMSS에서 crit에 옮긴 원칙

기준 사이트: <https://www.tmssmag.com/>

TMSS의 화면을 복제하지 않고, 빠르게 느껴지는 구조와 편집 규칙만 crit의 콘텐츠·기능에 맞게 옮긴다.

## 1. 확인한 기술적 특징

- React 19 + Vite 계열 SPA, Wouter, TanStack Query를 사용한다.
- Node.js/Express API가 Google Cloud 계열 인프라에서 동작한다.
- 기사 이동은 문서 전체를 다시 받지 않고 작은 JSON을 가져오는 client-side navigation이다.
- 해시된 JS/CSS를 1년 immutable cache로 전달하고, 이미지는 lazy loading한다.
- Pretendard Variable을 자체 호스팅하며, 이미지 비율을 미리 잡아 layout shift를 줄인다.

TMSS 자체의 초기 JS·CSS와 홈 API payload는 작지 않다. 체감 속도는 단순히 번들이 작아서라기보다 **전환 방식, 캐시, 이미지 로딩, 안정된 정보 구조**가 함께 만든 결과다.

## 2. crit에 적용한 화면 원칙

### 첫 화면에서 우선순위를 고정한다

데스크톱 첫 화면을 세 구역으로 나눈다.

1. **많이 읽는 글** — 조회수 기준 5개
2. **오늘의 대표 글** — 최신 글 한 개를 큰 3:2 이미지와 함께 표시
3. **새로 올라온 글** — 다음 최신 글 3개

모든 글을 같은 카드로 놓는 대신 무엇을 먼저 읽을지 편집자가 정한 구조다. 모바일에서는 대표 글이 먼저 오고 두 레일이 뒤따른다.

### 카드 장식을 줄이고 선과 타입으로 나눈다

- 둥근 박스, 그림자, 반복 배경을 제거한다.
- 섹션은 얇은 선, 여백, 제목 크기로 구분한다.
- 피드 썸네일은 정사각형에서 3:2로 바꿔 기사 이미지의 맥락을 더 보존한다.
- source → title → date/response metrics의 위치를 모든 행에서 고정한다.
- 정렬과 더보기는 pill button 대신 텍스트와 underline 상태로 표현한다.

### crit의 정체성은 유지한다

- TMSS의 따뜻한 아이보리 캔버스는 light mode에만 가져오고, crit의 dark mode와 orange accent는 유지한다.
- Community, Submit, Weekly 기능을 없애지 않고 장식적인 카드에서 조용한 utility rail로 바꾼다.
- 테마 전환 버튼은 흰 원형 컨트롤을 없애고 배경 없는 text/icon control로 만든다.

## 3. crit에 적용한 속도 원칙

### 홈에서 본문을 보내지 않는다

홈 피드는 client component에서 정렬·더보기를 처리한다. 이전에는 이 props에 모든 글의 `body`까지 포함되어 RSC payload로 직렬화될 수 있었다. `FeedArticle` 타입을 두고 홈에서는 본문을 제거한 메타데이터만 전달한다.

### 첫 이미지와 나머지 이미지를 다르게 취급한다

- 대표 글 이미지만 priority loading한다.
- 피드 이미지는 Next Image 기본 lazy loading을 유지한다.
- 모든 위치에서 `sizes`와 고정 aspect ratio를 지정해 불필요한 큰 이미지와 layout shift를 줄인다.
- 상세 hero도 일반 `<img>` 대신 Next Image를 사용한다.

### 유지한 것

crit는 Next.js server rendering으로 초기 HTML에 내용을 보낸다. TMSS의 빈 SPA shell로 바꾸지 않는다. 링크 prefetch도 피드처럼 링크 수가 많은 화면에서는 계속 끈다.

## 4. 글쓰기 톤앤매너

`format`은 화면 레이아웃, `style: geeknews`는 문장 리듬으로 분리한다.

- summary에서 3~5개 결론을 먼저 보여 30초 안에 핵심을 파악하게 한다.
- 짧은 문단, 논지를 말하는 소제목, 건조한 `-다`/`-함`/`-임`을 사용한다.
- 제목은 직역하지 않지만 원문의 뜻과 긴장은 보존한다.
- source-faithful body는 원문의 주장·사례·숫자·순서를 보존한다.
- crit의 해석은 원문 요약과 섞지 않고 뒤에 분리한다.
- 비평은 글의 가치를 먼저 인정한 뒤 `다르게 볼 부분`, `엇갈리는 지점`, `남는 문제`, `남는 질문`처럼 구체적으로 끝낸다.

톤을 비슷하게 만드는 일은 가능하지만 모든 글을 같은 문체로 덮지는 않는다. 편지, 인터뷰, 에세이는 화자의 목소리와 원문 전개가 우선이다.

## 5. 일부러 가져오지 않은 것

- TMSS의 client-only SPA 구조
- 공개 화면과 CMS가 섞인 큰 단일 번들
- 홈에서 수십 개 글의 본문까지 한 번에 받는 API
- 모든 화면을 TMSS와 같은 색·열 수·컴포넌트로 복제하는 방식

참고 사이트의 기술보다 **독자가 다음 시선을 어디로 옮길지 예측할 수 있는 반복 규칙**을 가져오는 것이 핵심이다.
