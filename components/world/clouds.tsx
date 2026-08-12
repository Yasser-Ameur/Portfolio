import { cn } from "@/lib/utils";
import { ParallaxLayer } from "./parallax-layer";

function Cloud({ className, delay }: { className?: string; delay: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute animate-drift mix-blend-screen",
        "will-change-transform",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="h-10 w-40 rounded-full blur-xl sm:h-14 sm:w-64"
        style={{
          background:
            "radial-gradient(closest-side, rgb(219 228 244 / 0.14), transparent 70%)",
        }}
      />
    </div>
  );
}

/**
 * Slow, faint clouds drifting across the sky. Multiple speeds create depth.
 */
export function Clouds({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <ParallaxLayer x={18} y={8}>
        <Cloud delay={0} className="top-[12%] left-[-20%]" />
        <Cloud delay={-10} className="top-[30%] left-[-40%] scale-[1.6]" />
      </ParallaxLayer>
      <ParallaxLayer x={34} y={12}>
        <Cloud delay={-18} className="top-[20%] left-[-60%] scale-[0.8] opacity-80" />
      </ParallaxLayer>
    </div>
  );
}
