import { getRepository } from "../repositories";

export default async function Home() {
  const coverage = await getRepository().list("coverage");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-4">Skip to content</a>
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-ink/20 px-6 py-7">
        <span className="text-xl font-bold tracking-tight">Voter Informer</span>
        <span className="rounded-full border border-accent px-3 py-1 text-sm text-accent">Foundation prototype</span>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-accent">Independent election research</p>
        <h1 className="max-w-3xl text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">More context.<br />Your own conclusions.</h1>
        <p className="mt-7 max-w-2xl text-xl leading-relaxed">A foundation for exploring races, candidate statements, and the evidence behind them. No account required.</p>
        <section aria-labelledby="coverage" className="mt-14 rounded-2xl border border-ink/20 bg-white/60 p-8">
          <h2 id="coverage" className="text-2xl font-semibold">Research coverage is not yet available</h2>
          <p className="mt-4 max-w-3xl leading-relaxed">This release establishes the application and data safeguards. The interactive atlas, candidate profiles, and comparisons are planned for later milestones. An empty collection does not mean there are no elections or candidates.</p>
          <p className="mt-4 text-sm">{coverage.length === 0 ? "No verified coverage records have been published." : `${coverage.length} coverage records available; research navigation is pending.`}</p>
        </section>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed">Planned research scope: Colorado’s applicable 2026 Senate race and House districts overlapping Arapahoe County, subject to authoritative boundary and ballot verification.</p>
      </main>
      <footer className="mx-auto max-w-6xl border-t border-ink/20 px-6 py-6 text-sm">Evidence first. No candidate rankings or inferred positions.</footer>
    </>
  );
}
