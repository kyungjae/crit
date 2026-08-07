import type { Metadata } from "next";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "행사",
  description: "디자인, 제품, AI와 관련된 컨퍼런스·강의·밋업 모음",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Seoul",
});

function formatEventDate(start: string, end?: string) {
  const startLabel = dateFormatter.format(new Date(`${start}T00:00:00+09:00`));
  if (!end || end === start) return startLabel;
  return `${startLabel} — ${dateFormatter.format(new Date(`${end}T00:00:00+09:00`))}`;
}

export default function EventsPage() {
  const events = getEvents();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Events & meetups
        </p>
        <h1 className="text-xl font-bold">행사</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          디자인·제품·AI를 만드는 사람들이 만나는 컨퍼런스, 강의, 밋업
        </p>
      </div>

      {events.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          현재 등록된 행사가 없습니다.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              {event.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.image}
                  alt=""
                  className="aspect-[1.91/1] w-full object-cover"
                />
              ) : null}
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-brand">{event.type}</span>
                  <span aria-hidden="true">·</span>
                  <span>{event.organizer}</span>
                </div>
                <h2 className="text-lg font-bold leading-snug tracking-[-0.02em]">
                  {event.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {event.description}
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
                  <dt className="text-neutral-400">일정</dt>
                  <dd>{formatEventDate(event.date, event.end_date)}</dd>
                  <dt className="text-neutral-400">장소</dt>
                  <dd>{event.location}</dd>
                </dl>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-full bg-neutral-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand dark:bg-brand dark:hover:bg-brand-dark"
                >
                  행사 페이지 열기 ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
