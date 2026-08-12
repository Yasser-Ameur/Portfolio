import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ParallaxLayerProps = {
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * A layer that translates by `--px` / `--py` (set on the scene root by the
 * pointer-parallax controller) multiplied by its depth. Reduced motion leaves
 * the vars at 0, so layers stay still.
 */
export function ParallaxLayer({
  x = 0,
  y = 0,
  className,
  style,
  children,
}: ParallaxLayerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 will-change-transform", className)}
      style={{
        transform: `translate3d(calc(var(--px, 0px) * ${x}), calc(var(--py, 0px) * ${y}), 0)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
