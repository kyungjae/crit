/**
 * 아티클의 글쓰기 문체 프로필.
 * `format`은 렌더링 레이아웃이고, `style`은 원문을 어떻게 편집해 전달할지다.
 */
export const EDITORIAL_STYLES = [
  "geeknews",
  "source-faithful",
  "interview",
  "reference",
  "showcase",
] as const;

export type EditorialStyle = (typeof EDITORIAL_STYLES)[number];

export const EDITORIAL_STYLE_LABELS: Record<EditorialStyle, string> = {
  geeknews: "긱뉴스",
  "source-faithful": "원문 충실형",
  interview: "인터뷰",
  reference: "레퍼런스",
  showcase: "쇼케이스",
};

export type EditorialStyleProfile = {
  label: string;
  when: string;
  rules: readonly string[];
};

export const EDITORIAL_STYLE_PROFILES: Record<EditorialStyle, EditorialStyleProfile> = {
  geeknews: {
    label: "긱뉴스",
    when: "뉴스, 발표, 기술·디자인 아티클처럼 30초 안에 읽을 가치와 핵심 주장을 판단해야 하는 원문",
    rules: [
      "제목은 핵심 사실이 드러나는 명사형으로 재구성함",
      "상단에 결론을 압축한 3~5개 불릿을 둠",
      "본문은 원문 논지 단위의 ## 섹션과 개조식 문장으로 구성함",
      "사실과 crit의 의견을 분리하고, 개인 의견은 에디터 노트에서만 씀",
      "원문 용어·숫자·예시·순서·긴장을 보존하고 각색하지 않음",
    ],
  },
  "source-faithful": {
    label: "원문 충실형",
    when: "에세이, 편지, 선언문처럼 화자의 목소리·호칭·전개 자체가 의미인 원문",
    rules: [
      "저자와 독자의 I/you 관계와 직접 호칭을 유지함",
      "반복만 압축하고 화자의 순서, 질문, 망설임, 결말을 보존함",
      "제3자가 원문을 해설하는 문체로 바꾸지 않음",
      "crit의 해석은 짧은 별도 영역으로 분리하거나 생략함",
    ],
  },
  interview: {
    label: "인터뷰",
    when: "인터뷰, 대담, 팟캐스트처럼 발화자와 대화의 순서가 핵심인 원문",
    rules: [
      "발화자 attribution과 질문-답변의 전환을 보존함",
      "한 사람의 주장을 일반적 사실처럼 바꾸지 않음",
      "반복 답변은 줄이되 입장 변화와 의견 충돌은 남김",
      "핵심 발언에는 짧은 직접 인용과 맥락을 함께 둠",
    ],
  },
  reference: {
    label: "레퍼런스",
    when: "규칙, 체크리스트, 사용법, 비교표처럼 나중에 다시 꺼내 볼 원문",
    rules: [
      "병렬적인 항목은 번호 카드나 불릿으로 구조화함",
      "각 항목의 조건·예외·구체적 예시를 생략하지 않음",
      "원문 전체 개수와 실제로 옮긴 항목 수를 혼동하지 않음",
      "설명이 길어지면 항목을 무리하게 줄이지 않고 deep 형식을 검토함",
    ],
  },
  showcase: {
    label: "쇼케이스",
    when: "브랜드, 제품, 캠페인, 작업 사례처럼 과정·적용물·비주얼이 논지를 구성하는 원문",
    rules: [
      "작업 주체, 재료·과정, 적용 사례와 원문 주장을 먼저 전달함",
      "이미지는 설명하는 문단 가까이에 배치하고 출처·맥락을 표시함",
      "대표 이미지와 본문 이미지를 재사용하지 않음",
      "작품의 의도와 crit의 해석·추정을 구분함",
    ],
  },
};
