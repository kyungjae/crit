import Link from "next/link";

const footerLinks = [
  { href: "/", label: "피드" },
  { href: "/links", label: "링크" },
  { href: "/submit", label: "아티클 제보" },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 pb-24 md:flex-row md:items-center md:justify-between md:px-6 md:pb-8">
        <div>
          <Link href="/" className="text-[18px] font-extrabold tracking-[-0.04em]">
            crit<span className="text-brand">.</span>
          </Link>
          <p className="mt-1 text-[12px] text-neutral-400 dark:text-neutral-500">
            디자인과 AI의 변화를 읽다
          </p>
        </div>

        <nav aria-label="푸터 메뉴" className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-medium text-neutral-500 transition hover:text-brand dark:text-neutral-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} crit
        </p>
      </div>
    </footer>
  );
}
