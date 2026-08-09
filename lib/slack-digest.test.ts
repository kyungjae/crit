import assert from "node:assert/strict";
import test from "node:test";

import {
  claimSlackDeliveries,
  markSlackDeliveriesSent,
  runSlackDigest,
  type DigestArticle,
  type SlackDeliveryClaimStore,
} from "./slack-digest";

const articles: DigestArticle[] = [
  {
    title: "오늘 공개한 글",
    summary: "요약",
    slug: "today",
    dateKey: "2026-08-09",
  },
  {
    title: "실행 뒤 공개되어 어제 놓친 글",
    summary: "요약",
    slug: "missed-yesterday",
    dateKey: "2026-08-08",
  },
];

type DeliveryRow = {
  installationId: string;
  slug: string;
  status: "pending" | "sent";
  claimToken: string | null;
  claimedAt: Date;
  sentAt: Date | null;
};

function createClaimStore(initial: DeliveryRow[] = []) {
  const rows = initial.map((row) => ({ ...row }));

  const store: SlackDeliveryClaimStore = {
    async createMany({ data }) {
      let count = 0;
      for (const candidate of data) {
        if (rows.some((row) => row.installationId === candidate.installationId && row.slug === candidate.slug)) continue;
        rows.push({ ...candidate, sentAt: null });
        count += 1;
      }
      return { count };
    },
    async updateMany({ where, data }) {
      let count = 0;
      for (const row of rows) {
        if (row.installationId !== where.installationId) continue;
        if (where.slug && row.slug !== where.slug) continue;
        if (where.slugIn && !where.slugIn.includes(row.slug)) continue;
        if (where.status && row.status !== where.status) continue;
        if (where.claimToken !== undefined && row.claimToken !== where.claimToken) continue;
        if (where.claimedBefore && row.claimedAt >= where.claimedBefore) continue;
        Object.assign(row, data);
        count += 1;
      }
      return { count };
    },
    async findMany({ where }) {
      return rows
        .filter((row) => row.installationId === where.installationId)
        .filter((row) => !where.slugIn || where.slugIn.includes(row.slug))
        .filter((row) => !where.status || row.status === where.status)
        .filter((row) => where.claimToken === undefined || row.claimToken === where.claimToken)
        .filter((row) => !where.claimedBefore || row.claimedAt < where.claimedBefore)
        .map(({ slug, status, claimToken, claimedAt }) => ({ slug, status, claimToken, claimedAt }));
    },
  };

  return { rows, store };
}

test("동시에 같은 설치/글을 claim해도 한 실행만 발송 권한을 얻는다", async () => {
  const { store } = createClaimStore();
  const now = new Date("2026-08-09T01:00:00.000Z");

  const [first, second] = await Promise.all([
    claimSlackDeliveries(store, "installation-1", ["today"], "claim-a", now),
    claimSlackDeliveries(store, "installation-1", ["today"], "claim-b", now),
  ]);

  assert.deepEqual(
    [first, second].flatMap((claimed) => claimed?.slugs ?? []),
    ["today"],
  );
});

test("오래된 pending claim은 회수하지만 sent 및 새 pending은 건드리지 않는다", async () => {
  const now = new Date("2026-08-09T01:30:00.000Z");
  const { rows, store } = createClaimStore([
    {
      installationId: "installation-1",
      slug: "stale",
      status: "pending",
      claimToken: "crashed-run",
      claimedAt: new Date("2026-08-09T01:00:00.000Z"),
      sentAt: null,
    },
    {
      installationId: "installation-1",
      slug: "fresh",
      status: "pending",
      claimToken: "active-run",
      claimedAt: new Date("2026-08-09T01:29:00.000Z"),
      sentAt: null,
    },
    {
      installationId: "installation-1",
      slug: "delivered",
      status: "sent",
      claimToken: null,
      claimedAt: new Date("2026-08-09T00:00:00.000Z"),
      sentAt: new Date("2026-08-09T00:01:00.000Z"),
    },
  ]);

  const claimed = await claimSlackDeliveries(
    store,
    "installation-1",
    ["fresh", "delivered", "brand-new"],
    "recovery-run",
    now,
  );

  assert.deepEqual(claimed, { slugs: ["stale"], claimToken: "crashed-run" });
  assert.equal(rows.some((row) => row.slug === "brand-new"), false);
  assert.equal(rows.find((row) => row.slug === "fresh")?.claimToken, "active-run");
  assert.equal(rows.find((row) => row.slug === "delivered")?.status, "sent");
});

test("활성 pending이 있으면 같은 설치의 다음 batch를 claim하지 않는다", async () => {
  const now = new Date("2026-08-09T01:10:00.000Z");
  const { rows, store } = createClaimStore([
    {
      installationId: "installation-1",
      slug: "active",
      status: "pending",
      claimToken: "active-run",
      claimedAt: new Date("2026-08-09T01:09:00.000Z"),
      sentAt: null,
    },
  ]);

  const claimed = await claimSlackDeliveries(
    store,
    "installation-1",
    ["active", "brand-new"],
    "parallel-run",
    now,
  );

  assert.equal(claimed, null);
  assert.equal(rows.some((row) => row.slug === "brand-new"), false);
});

test("성공한 현재 claim만 sent로 바꾸고 다른 pending은 건드리지 않는다", async () => {
  const now = new Date("2026-08-09T01:00:00.000Z");
  const { rows, store } = createClaimStore();
  await claimSlackDeliveries(store, "installation-1", ["sent", "retry"], "current-run", now);
  rows.push({
    installationId: "installation-1",
    slug: "other",
    status: "pending",
    claimToken: "other-run",
    claimedAt: now,
    sentAt: null,
  });

  await markSlackDeliveriesSent(store, "installation-1", "current-run", ["sent"], now);

  assert.deepEqual(rows.map((row) => ({ slug: row.slug, status: row.status, claimToken: row.claimToken })), [
    { slug: "sent", status: "sent", claimToken: null },
    { slug: "retry", status: "pending", claimToken: "current-run" },
    { slug: "other", status: "pending", claimToken: "other-run" },
  ]);
});

test("sent 상태 갱신 건수가 claim 수와 다르면 기록 실패로 처리한다", async () => {
  const now = new Date("2026-08-09T01:00:00.000Z");
  const { store } = createClaimStore();
  await claimSlackDeliveries(store, "installation-1", ["today"], "current-run", now);

  const partialStore: SlackDeliveryClaimStore = {
    ...store,
    async updateMany(args) {
      if (args.data.status === "sent") return { count: 0 };
      return store.updateMany(args);
    },
  };

  await assert.rejects(
    markSlackDeliveriesSent(partialStore, "installation-1", "current-run", ["today"], now),
    /sent 상태를 모두 기록하지 못했습니다/,
  );
});

test("기본 요청은 게시일과 무관하게 모든 공개 글에서 미발송 글만 보내고 sent 처리한다", async () => {
  const events: string[] = [];
  let firstClaim = true;
  const result = await runSlackDigest(new URL("https://crit.day/api/slack/digest"), {
    allArticles() {
      events.push("all");
      return articles;
    },
    articlesBySlugs() {
      throw new Error("명시적 slug 선택을 사용하면 안 됨");
    },
    async installations() {
      return [{ id: "installation-1", teamId: "team-1" }];
    },
    async claim(_installationId, slugs) {
      events.push(`claim:${slugs.join(",")}`);
      if (!firstClaim) return null;
      firstClaim = false;
      return { slugs: ["missed-yesterday"], claimToken: "persisted-claim" };
    },
    async send(_installation, selected) {
      events.push(`send:${selected.map((article) => article.slug).join(",")}`);
    },
    async markSent(_installationId, slugs) {
      events.push(`sent:${slugs.join(",")}`);
    },

  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    ok: true,
    sent: 1,
    results: [{ teamId: "team-1", ok: true, sent: true }],
  });
  assert.deepEqual(events, [
    "all",
    "claim:today,missed-yesterday",
    "send:missed-yesterday",
    "sent:missed-yesterday",
    "claim:today",
  ]);
});

test("미발송 글이 Slack block 한도를 넘으면 여러 메시지로 나눠 모두 발송한다", async () => {
  const backlog = Array.from({ length: 95 }, (_, index): DigestArticle => ({
    title: `글 ${index + 1}`,
    summary: "요약",
    slug: `article-${String(index + 1).padStart(3, "0")}`,
    dateKey: "2026-08-09",
  }));
  const unclaimed = new Set(backlog.map((article) => article.slug));
  const sentBatchSizes: number[] = [];
  const markedBatchSizes: number[] = [];
  const messageIds: string[] = [];

  const result = await runSlackDigest(new URL("https://crit.day/api/slack/digest"), {
    allArticles: () => backlog,
    articlesBySlugs: () => [],
    async installations() {
      return [{ id: "installation-1", teamId: "team-1" }];
    },
    async claim(_installationId, slugs, claimToken) {
      const claimed = slugs.filter((slug) => unclaimed.has(slug)).slice(0, 40);
      claimed.forEach((slug) => unclaimed.delete(slug));
      return claimed.length > 0 ? { slugs: claimed, claimToken } : null;
    },
    async send(_installation, selected, clientMessageId) {
      sentBatchSizes.push(selected.length);
      messageIds.push(clientMessageId);
    },
    async markSent(_installationId, slugs) {
      markedBatchSizes.push(slugs.length);
    },

  });

  assert.equal(result.status, 200);
  assert.equal(result.body.sent, 1);
  assert.deepEqual(sentBatchSizes, [40, 40, 15]);
  assert.deepEqual(markedBatchSizes, [40, 40, 15]);
  assert.equal(new Set(messageIds).size, 3);
});

test("Slack 실패 시 현재 claim을 유지하고 전체 응답을 비-2xx로 만든다", async () => {
  const events: string[] = [];
  const result = await runSlackDigest(new URL("https://crit.day/api/slack/digest"), {
    allArticles: () => articles,
    articlesBySlugs: () => [],
    async installations() {
      return [{ id: "installation-1", teamId: "team-1" }];
    },
    async claim() {
      return { slugs: ["today"], claimToken: "failed-send-claim" };
    },
    async send() {
      events.push("send");
      throw new Error("Slack unavailable");
    },
    async markSent() {
      events.push("sent");
    },

  });

  assert.equal(result.status, 502);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.sent, 0);
  assert.deepEqual(events, ["send"]);
});

test("Slack 전송 뒤 sent 기록이 실패하면 claim을 유지하고 같은 메시지 ID로 재시도한다", async () => {
  const events: string[] = [];
  const messageIds: Array<string | undefined> = [];
  const dependencies = {
    allArticles: () => [articles[0]],
    articlesBySlugs: () => [],
    async installations() {
      return [{ id: "installation-1", teamId: "team-1" }];
    },
    async claim() {
      return { slugs: ["today"], claimToken: "11111111-1111-4111-8111-111111111111" };
    },
    async send(
      _installation: { id: string; teamId: string },
      _selected: DigestArticle[],
      clientMessageId?: string,
    ) {
      events.push("send");
      messageIds.push(clientMessageId);
    },
    async markSent() {
      events.push("mark-failed");
      throw new Error("DB unavailable after Slack accepted the message");
    },

  };

  const first = await runSlackDigest(new URL("https://crit.day/api/slack/digest"), dependencies);
  const second = await runSlackDigest(new URL("https://crit.day/api/slack/digest"), dependencies);

  assert.equal(first.status, 502);
  assert.equal(second.status, 502);
  assert.deepEqual(events, ["send", "mark-failed", "send", "mark-failed"]);
  assert.match(
    messageIds[0] ?? "",
    /^11111111-1111-4111-8111-111111111111$/,
  );
  assert.equal(messageIds[0], messageIds[1]);
});

test("특정 slug가 40건을 넘으면 부분 재발송 대신 요청을 거부한다", async () => {
  const articles = Array.from({ length: 41 }, (_, index): DigestArticle => ({
    title: `글 ${index + 1}`,
    summary: "요약",
    slug: `article-${index + 1}`,
    dateKey: "2026-08-09",
  }));
  const query = articles.map((article) => `slug=${article.slug}`).join("&");
  const result = await runSlackDigest(new URL(`https://crit.day/api/slack/digest?${query}`), {
    allArticles: () => [],
    articlesBySlugs: () => articles,
    async installations() {
      throw new Error("설치 조회 전에 거부해야 함");
    },
    async claim() {
      return null;
    },
    async send() {
      throw new Error("발송하면 안 됨");
    },
    async markSent() {},
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.ok, false);
  assert.match(result.body.error ?? "", /40건/);
});

test("특정 slug 중 공개 글이 아닌 값이 있으면 나머지도 재발송하지 않는다", async () => {
  const result = await runSlackDigest(
    new URL("https://crit.day/api/slack/digest?slug=today&slug=typo"),
    {
      allArticles: () => [],
      articlesBySlugs: () => [articles[0]],
      async installations() {
        throw new Error("설치 조회 전에 거부해야 함");
      },
      async claim() {
        return null;
      },
      async send() {
        throw new Error("발송하면 안 됨");
      },
      async markSent() {},
    },
  );

  assert.equal(result.status, 400);
  assert.match(result.body.error ?? "", /typo/);
});

test("명시적 slug 재발송은 delivery 이력을 읽거나 변경하지 않고 실행마다 새 메시지 ID를 쓴다", async () => {
  const events: string[] = [];
  const messageIds: string[] = [];
  const dependencies = {
    allArticles() {
      throw new Error("최근 글 선택을 사용하면 안 됨");
    },
    articlesBySlugs(slugs: string[]) {
      events.push(`target:${slugs.join(",")}`);
      return [articles[0]];
    },
    async installations() {
      return [{ id: "installation-1", teamId: "team-1" }];
    },
    async claim() {
      events.push("claim");
      return null;
    },
    async send(
      _installation: { id: string; teamId: string },
      selected: DigestArticle[],
      clientMessageId: string,
    ) {
      events.push(`send:${selected.map((article) => article.slug).join(",")}`);
      messageIds.push(clientMessageId);
    },
    async markSent() {
      events.push("sent");
    },

  };
  const url = new URL("https://crit.day/api/slack/digest?slug=today");

  const first = await runSlackDigest(url, dependencies);
  const second = await runSlackDigest(url, dependencies);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.deepEqual(events, [
    "target:today",
    "send:today",
    "target:today",
    "send:today",
  ]);
  assert.match(messageIds[0] ?? "", /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(messageIds[1] ?? "", /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(messageIds[0], messageIds[1]);
});
