/**
 * A compact, static pipeline schematic for the project detail pages.
 * Rendered server-side with HTML labels so text is never distorted.
 */
export function PipelineStrip({
  labels,
  accent,
}: {
  labels: string[];
  accent: string;
}) {
  const n = labels.length;
  return (
    <div
      className="relative h-16 w-full sm:h-20"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {labels.slice(0, -1).map((_, i) => {
          const x1 = ((i + 0.5) / n) * 100;
          const x2 = ((i + 1.5) / n) * 100;
          return (
            <line
              key={i}
              x1={x1}
              y1={50}
              x2={x2}
              y2={50}
              stroke={accent}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />
          );
        })}
        {labels.map((_, i) => (
          <circle
            key={i}
            cx={((i + 0.5) / n) * 100}
            cy={50}
            r="1.1"
            fill={accent}
            opacity="0.4"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center">
        {labels.map((label) => (
          <span
            key={label}
            className="flex-1 text-center font-mono text-[0.55rem] uppercase tracking-[0.14em] text-starlight-dim sm:text-[0.62rem] sm:tracking-[0.18em]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
