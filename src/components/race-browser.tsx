"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { BrowserState } from "../repositories/navigation";

type Level = { stateId?: string; raceId?: string; districtId?: string };
type Choice = { id: string; label: string; detail?: string; href?: string; next?: Level };

function Chevron({ direction = "forward" }: { direction?: "forward" | "down" | "back" }) {
  return <svg className={`race-chevron race-chevron-${direction}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function RaceBrowser({ coverage }: { coverage: BrowserState[] }) {
  const pathname = usePathname();
  const activeState = coverage.find((state) => state.races.some((race) => race.destination?.href === pathname || race.districts.some((district) => district.href === pathname)));
  const activeRace = activeState?.races.find((race) => race.destination?.href === pathname || race.districts.some((district) => district.href === pathname));
  const activeDistrict = activeRace?.districts.find((district) => district.href === pathname);
  const [level, setLevel] = useState<Level>({});
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const browse = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const restoreDistrictFocus = useRef(false);
  const state = coverage.find((entry) => entry.id === level.stateId);
  const race = state?.races.find((entry) => entry.id === level.raceId);
  const district = race?.districts.find((entry) => entry.id === level.districtId);
  const title = district || race?.destination ? "View candidates" : race ? "Choose a district" : state ? "Choose a race" : "Choose a state";
  const description = race?.destination ? `See the candidates for ${race.label}.` : district ? `See the candidates for ${district.label}.` : race ? "Select a district to see its candidates." : state ? "Select the office you want to explore." : "Only states with available races are shown.";
  const choices: Choice[] = district ? [{ ...district, label: "Candidates" }] : race?.destination ? [race.destination] : race ? race.districts : state ? state.races.map((entry) => ({
    id: entry.id, label: entry.label, href: entry.destination?.href,
    detail: entry.destination ? "View candidates" : `${entry.districts.length} ${entry.districts.length === 1 ? "district" : "districts"}`,
    next: { stateId: state.id, raceId: entry.id },
  })) : coverage.map((entry) => ({
    id: entry.id, label: entry.label, detail: `${entry.races.length} ${entry.races.length === 1 ? "race" : "races"}`,
    next: { stateId: entry.id },
  }));

  function go(next: Level) {
    if (next.stateId !== level.stateId || next.raceId !== level.raceId || next.districtId !== level.districtId) setLevel(next);
  }

  function close() {
    dialog.current?.close();
    setOpen(false);
    (opener.current?.isConnected ? opener.current : browse.current)?.focus({ preventScroll: true });
  }

  function selectDestination(event: MouseEvent<HTMLAnchorElement>) {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) close();
  }

  function show(next: Level, source: HTMLElement) {
    opener.current = source;
    restoreDistrictFocus.current = source === browse.current;
    setLevel(next);
    setOpen(true);
    dialog.current?.showModal();
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function navigateChoices(event: KeyboardEvent<HTMLUListElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]"));
    const current = controls.findIndex((control) => control === document.activeElement);
    if (current < 0) return;
    const next = event.key === "Home" ? 0 : event.key === "End" ? controls.length - 1 : Math.max(0, Math.min(controls.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
    event.preventDefault();
    controls[next]?.focus();
  }

  useEffect(() => {
    const navigation = header.current;
    const page = navigation?.parentElement;
    if (!navigation || !page?.classList.contains("candidate-page")) return;
    const updateOffset = () => {
      page.style.setProperty("--race-navigation-height", `${navigation.getBoundingClientRect().height}px`);
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(navigation);
    return () => {
      observer.disconnect();
      page.style.removeProperty("--race-navigation-height");
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (options.current) options.current.scrollTop = 0;
    const current = options.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (restoreDistrictFocus.current && current) current.focus();
    else {
      dialog.current?.querySelector<HTMLElement>(".race-panel-body")?.scrollTo(0, 0);
      heading.current?.focus();
    }
    restoreDistrictFocus.current = false;
  }, [open, level]);

  return (
    <header ref={header} className="race-navigation">
      <a className="race-skip-link" href="#race-page-content">Skip navigation</a>
      <nav className="race-topbar" aria-label="Main navigation">
        <button ref={browse} className="browse-button" aria-haspopup="dialog" aria-expanded={open} aria-controls="race-browser" onClick={(event) => show({ stateId: activeState?.id, raceId: activeRace?.id }, event.currentTarget)}>Browse races<Chevron direction="down" /></button>
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Map</Link>
      </nav>
      {activeState && activeRace && (
        <nav className="race-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><button onClick={(event) => show({}, event.currentTarget)}>States</button></li>
            <li><button onClick={(event) => show({ stateId: activeState.id }, event.currentTarget)}>{activeState.label}</button></li>
            <li><button onClick={(event) => show({ stateId: activeState.id, raceId: activeRace.id }, event.currentTarget)}>{activeRace.label}</button></li>
            {activeDistrict && <li><button onClick={(event) => show({ stateId: activeState.id, raceId: activeRace.id, districtId: activeDistrict.id }, event.currentTarget)}>{activeDistrict.label}</button></li>}
            <li><span aria-current="page">Candidates</span></li>
          </ol>
        </nav>
      )}
      <dialog id="race-browser" ref={dialog} className="race-dialog" aria-labelledby="race-browser-title" aria-describedby="race-browser-description" onKeyDown={containFocus} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="race-panel">
          <div className="race-panel-controls">
            <div>{state && <button onClick={() => go(district ? { stateId: state.id, raceId: race?.id } : race ? { stateId: state.id } : {})}><Chevron direction="back" />Back</button>}</div>
            <button onClick={close}>Close<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
          </div>
          <div className="race-panel-body">
            <div className="race-panel-header">
              {state && (
                <div className="race-trail-reveal"><div>
                  <nav className="race-breadcrumbs race-browser-trail" aria-label="Browse path">
                    <ol>
                      <li><button onClick={() => go({})}>States</button></li>
                      <li><button aria-current={!race ? "step" : undefined} onClick={() => go({ stateId: state.id })}>{state.label}</button></li>
                      {race && <li><button aria-current={!district ? "step" : undefined} onClick={() => go({ stateId: state.id, raceId: race.id })}>{race.label}</button></li>}
                      {race && district && <li><button aria-current="step" onClick={() => go({ stateId: state.id, raceId: race.id, districtId: district.id })}>{district.label}</button></li>}
                    </ol>
                  </nav>
                </div></div>
              )}
              <h2 ref={heading} tabIndex={-1} id="race-browser-title">{title}</h2>
              <p id="race-browser-description">{description}</p>
            </div>
            <div ref={options} className="race-options-scroll">
              <ul key={`${state?.id}/${race?.id}/${district?.id}`} className="race-choices" aria-label={title} onKeyDown={navigateChoices}>
                {choices.map((entry) => {
                  const current = entry.href === pathname;
                  const labelId = `race-choice-${entry.id}`;
                  const detailId = entry.detail ? `${labelId}-detail` : undefined;
                  const content = <>
                    <span className="race-choice-text"><span id={labelId} className="race-choice-label">{entry.label}</span>{entry.detail && <span id={detailId} className="race-choice-detail">{entry.detail}</span>}</span>
                    <span className="race-choice-end" aria-hidden="true">{current ? <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Current</> : <Chevron />}</span>
                  </>;
                  return <li key={entry.id}>{entry.href ? <Link href={entry.href} aria-labelledby={labelId} aria-describedby={detailId} aria-current={current ? "page" : undefined} onClick={selectDestination}>{content}</Link> : <button aria-labelledby={labelId} aria-describedby={detailId} onClick={() => go(entry.next ?? {})}>{content}</button>}</li>;
                })}
              </ul>
              {!choices.length && <p className="race-empty">No races are available here yet. Choose another location using the path above.</p>}
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
}
