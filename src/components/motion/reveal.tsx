"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface RevealProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Seconds to delay the animation. */
  delay?: number;
  /** Pixels to translate up from. */
  y?: number;
}

/**
 * Scroll-triggered fade + rise. A reference GSAP pattern wired to the
 * `useGSAP` hook (auto-cleanup, SSR-safe). Respects prefers-reduced-motion.
 * Copy and adapt per project — this is a starting point, not a design system.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration: 0.8,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
