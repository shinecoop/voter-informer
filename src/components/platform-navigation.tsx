"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Next restores window scroll, but these pages scroll inside their main element. */
export function PlatformNavigation({ issues = [] }: { issues?: { id: string; label: string }[] }) {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".candidate-page");
    if (!main) return;
    const storageKey = `candidate-scroll:${pathname}`;
    const restore = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target || !main.contains(target)) return;
      target.scrollIntoView({ block: "start" });
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
        if (saved?.hash === hash && typeof saved.top === "number") main.scrollTop = saved.top;
      } catch { /* Hash navigation still works when browser storage is unavailable. */ }
    };
    const save = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a.candidate-name, a.candidate-platform-link');
      const row = link?.closest<HTMLElement>(".candidate-row");
      if (!row || !main.contains(row) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = row.id;
      try { sessionStorage.setItem(storageKey, JSON.stringify({ hash, top: main.scrollTop })); } catch { /* Optional position enhancement. */ }
      window.history.replaceState(window.history.state, "", `${pathname}#${hash}`);
    };
    const frame = requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    main.addEventListener("click", save, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
      main.removeEventListener("click", save, true);
    };
  }, [pathname]);

  if (issues.length === 0) return null;
  return (
    <nav className="platform-navigation" aria-label="Platform issues">
      <ul>{issues.map((issue) => <li key={issue.id}><a href={`#${issue.id}`}>{issue.label}</a></li>)}</ul>
    </nav>
  );
}
