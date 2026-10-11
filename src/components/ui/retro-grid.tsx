import { cn } from "@/lib/utils";

export function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-full w-full overflow-hidden opacity-40 [perspective:200px]",
        className
      )}
      style={{ zIndex: 0 }}
    >
      {/* Grid surface */}
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div
          className="animate-retro-grid absolute [background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw] [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_0)]"
        />
      </div>

      {/* Fade mask for top and bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
    </div>
  );
}
