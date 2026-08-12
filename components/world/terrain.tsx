import { cn } from "@/lib/utils";
import { ParallaxLayer } from "./parallax-layer";

function Ridge({
  d,
  className,
}: {
  d: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      className={cn("absolute bottom-0 w-full", className)}
    >
      <path d={d} />
    </svg>
  );
}

/**
 * Three environmental silhouettes: distant mountains, nearer mountains,
 * and the foreground hill the character sits on.
 */
export function Terrain({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <ParallaxLayer x={16} y={6} className="bottom-0">
        <Ridge
          d="M0,400 L0,296 C130,248 230,268 310,214 C372,172 424,198 500,158 C566,124 650,168 726,148 C806,126 862,180 946,202 C1030,224 1104,180 1184,212 C1258,242 1342,232 1440,196 L1440,400 Z"
          className="fill-[#0c1322]"
        />
      </ParallaxLayer>

      <ParallaxLayer x={30} y={10} className="bottom-0">
        <Ridge
          d="M0,400 L0,328 C150,300 246,240 366,272 C464,294 520,242 640,254 C762,266 822,222 942,238 C1062,254 1120,282 1202,300 C1282,318 1360,318 1440,302 L1440,400 Z"
          className="fill-[#070b15]"
        />
      </ParallaxLayer>

      <ParallaxLayer x={52} y={18} className="bottom-0">
        <Ridge
          d="M0,400 L0,358 C240,332 420,302 640,322 C860,342 1000,310 1160,320 C1320,330 1420,350 1440,352 L1440,400 Z"
          className="fill-[#04060d]"
        />
      </ParallaxLayer>
    </div>
  );
}
