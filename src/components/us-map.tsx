"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { states } from "./us-map-paths";

const ColoradoDistricts = lazy(() => import("./colorado-districts"));
const colorado = states.find((state) => state.id === "08")!;

type Camera = { x: number; y: number; width: number; height: number };
const overview = { x: -58, y: 13, width: 1016, height: 594 };

export function UsMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const cameraRef = useRef<Camera>({ x: -80, y: -30, width: 1060, height: 690 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [settledState, setSettledState] = useState<string | null>(null);
  const showDistricts = selected === "08" && settledState === "08";
  const active = states.find((state) => state.id === (hovered ?? focused ?? selected));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = (camera: Camera) => {
      cameraRef.current = camera;
      svg.setAttribute("viewBox", `${camera.x} ${camera.y} ${camera.width} ${camera.height}`);
    };
    const fit = () => {
      cancelAnimationFrame(frame);
      const viewport = svg.getBoundingClientRect();
      if (!viewport.width || !viewport.height) return;
      const bounds = selected
        ? svg.querySelector<SVGPathElement>(`[data-state-id="${selected}"]`)?.getBBox()
        : overview;
      if (!bounds || !bounds.width || !bounds.height) return;
      const aspect = viewport.width / viewport.height;
      const width = Math.max(bounds.width, bounds.height * aspect) / 0.75;
      const height = width / aspect;
      const target: Camera = {
        x: bounds.x + bounds.width / 2 - width / 2,
        y: bounds.y + bounds.height / 2 - height / 2,
        width,
        height,
      };
      if (reducedMotion.matches) { paint(target); setSettledState(selected); return; }
      let previous = performance.now();
      const animate = (now: number) => {
        // Time-based exponential lerp stays consistent across refresh rates and
        // continues from the current camera when another state is selected.
        const amount = 1 - Math.exp(-(now - previous) / 95);
        previous = now;
        const current = cameraRef.current;
        const next = {
          x: current.x + (target.x - current.x) * amount,
          y: current.y + (target.y - current.y) * amount,
          width: current.width + (target.width - current.width) * amount,
          height: current.height + (target.height - current.height) * amount,
        };
        const error = Math.max(
          Math.abs(next.x - target.x), Math.abs(next.y - target.y),
          Math.abs(next.width - target.width), Math.abs(next.height - target.height),
        );
        if (error < target.width * 0.0001) { paint(target); setSettledState(selected); return; }
        paint(next);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(svg);
    reducedMotion.addEventListener("change", fit);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener("change", fit);
    };
  }, [selected]);

  const reset = () => {
    if (svgRef.current?.querySelector("[data-district-id]:focus")) {
      svgRef.current.querySelector<SVGPathElement>('[data-state-id="08"]')?.focus();
    }
    setSettledState(null);
    setSelected(null);
  };

  return (
    <svg
      ref={svgRef}
      className="us-map"
      viewBox="-80 -30 1060 690"
      role="group"
      aria-labelledby="map-title"
      aria-describedby="map-description"
      onClick={(event) => {
        if (event.target === event.currentTarget) reset();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); reset(); }
      }}
    >
      <title id="map-title">United States map</title>
      <desc id="map-description">{showDistricts ? "Colorado congressional districts. Select a district to see candidates." : "Select a state to zoom in."} Press Escape or click the background to return. Candidate lists are currently available for Colorado’s 2026 general election.</desc>
      {states.map((state) => (
        <path
          key={state.id}
          data-state-id={state.id}
          d={state.d}
          className="map-state"
          vectorEffect="non-scaling-stroke"
          role="button"
          tabIndex={showDistricts ? -1 : 0}
          aria-label={state.name}
          aria-pressed={selected === state.id}
          onPointerEnter={() => setHovered(state.id)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => { setHovered(null); setFocused(state.id); }}
          onBlur={() => setFocused(null)}
          onClick={() => { setHovered(null); if (selected !== state.id) setSettledState(null); setSelected(state.id); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setHovered(null);
              if (selected !== state.id) setSettledState(null);
              setSelected(state.id);
            }
          }}
        />
      ))}
      {active && !(showDistricts && active.id === "08") && (
        <path
          key={active.id}
          d={active.d}
          className={`map-highlight${selected === active.id ? " map-highlight-selected" : ""}${focused === active.id ? " map-highlight-focused" : ""}`}
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
      )}
      {showDistricts && (
        <Suspense fallback={null}>
          <ColoradoDistricts outline={colorado.d} />
        </Suspense>
      )}
    </svg>
  );
}
