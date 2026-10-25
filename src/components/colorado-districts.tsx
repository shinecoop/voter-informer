"use client";

import { useEffect, useId, useRef, useState } from "react";
import { districts } from "./colorado-district-paths";
import { useRouter } from "next/navigation";
import { candidatePath } from "../domain/elections";

export default function ColoradoDistricts({ outline }: { outline: string }) {
  const clipId = useId();
  const groupRef = useRef<SVGGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const active = districts.find((district) => district.id === (hovered ?? focused));

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
            onPointerEnter={() => setHovered(district.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => { setHovered(null); setFocused(district.id); }}
            onBlur={() => setFocused(null)}
            onClick={() => router.push(candidatePath(Number(district.id.slice(2))))}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(candidatePath(Number(district.id.slice(2))));
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
