/**
 * 아티클 템플릿 생성 헬퍼.
 * 사용: npm run new:article -- <category> <slug> "제목"
 * 예:  npm run new:article -- design figma-update "Figma 업데이트"
 */
import fs from "fs";
import path from "path";
import { CATEGORIES } from "../lib/schema";

const [category, slug, title] = process.argv.slice(2);

if (!category || !slug || !title) {
  console.error('사용법: npm run new:article -- <category> <slug> "제목"');
  console.error(`카테고리: ${CATEGORIES.join(", ")}`);
  process.exit(1);
}

if (!(CATEGORIES as readonly string[]).includes(category)) {
  console.error(`유효하지 않은 카테고리: ${category}`);
  console.error(`가능한 값: ${CATEGORIES.join(", ")}`);
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error("slug는 소문자 영문/숫자/하이픈만 사용할 수 있습니다");
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const file = path.join(
  process.cwd(),
  "content",
  "articles",
  `${date}-${slug}.md`
);

if (fs.existsSync(file)) {
  console.error(`이미 존재하는 파일: ${file}`);
  process.exit(1);
}

const template = `---
title: "${title}"
summary: "한두 문장 요약 (300자 이내)"
category: ${category}
tags: []
date: "${date}"
author: "crit agent"
---

본문을 작성하세요.
`;

fs.writeFileSync(file, template);
console.log(`생성됨: ${file}`);
