import { cn } from "@/lib/utils";

export function Moon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      data-moon
      className={cn("absolute rounded-full", className)}
      style={{
        boxShadow:
          "0 0 60px 18px rgb(247 226 190 / 0.16), 0 0 160px 70px rgb(247 226 190 / 0.07)",
        ...style,
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 34% 32%, #fdf6e4 0%, #f4e3bb 52%, #dfc08e 100%)",
        }}
      />
      <div
        className="absolute rounded-full bg-black/10"
        style={{ left: "18%", top: "30%", width: "14%", height: "14%" }}
      />
      <div
        className="absolute rounded-full bg-black/10"
        style={{ left: "52%", top: "18%", width: "10%", height: "10%" }}
      />
      <div
        className="absolute rounded-full bg-black/10"
        style={{ left: "60%", top: "56%", width: "12%", height: "12%" }}
      />
    </div>
  );
}
