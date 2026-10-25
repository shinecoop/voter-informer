"use client";

import { useEffect, useId, useRef, useState } from "react";
import { districts } from "./colorado-district-paths";

export default function ColoradoDistricts({ outline }: { outline: string }) {
  const clipId = useId();
  const groupRef = useRef<SVGGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = districts.find((district) => district.id === (hovered ?? focused ?? selected));

  useEffect(() => {
    const current = document.activeElement;
    if (current?.getAttribute("data-state-id") === "08" && current.matches(":focus-visible")) {
      groupRef.current?.querySelector<SVGPathElement>("[data-district-id]")?.focus();
    }
  }, []);

  return (
    <g ref={groupRef} role="group" aria-label="Colorado congressional districts">
      <defs><clipPath id={clipId}><path d={outline} /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        {districts.map((district) => (
          <path
            key={district.id}
            data-district-id={district.id}
            d={district.d}
            className="map-state map-district"
            fillRule="evenodd"
            vectorEffect="non-scaling-stroke"
            role="button"
            tabIndex={0}
            aria-label={district.name}
            aria-pressed={selected === district.id}
            onPointerEnter={() => setHovered(district.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => { setHovered(null); setFocused(district.id); }}
            onBlur={() => setFocused(null)}
            onClick={() => setSelected(district.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelected(district.id);
              }
            }}
          />
        ))}
      </g>
      {active && (
        <path
          d={active.d}
          className={`map-highlight${focused === active.id ? " map-highlight-focused" : ""}`}
          fillRule="evenodd"
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
      )}
    </g>
  );
}
