"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BackgroundVideoProps {
  /** Video source. Host large files off-repo — see the note below. */
  src: string;
  /**
   * Still frame shown until the video paints, and the frame a reduced-motion
   * visitor keeps. Without it there is a black flash on load.
   */
  poster?: string;
  className?: string;
}

/**
 * Decorative full-bleed background video. Pair it with `<Section backdrop={…}>`.
 *
 * Every attribute here is load-bearing, and none of them are obvious:
 *
 * - `muted` + `playsInline` are what actually PERMIT autoplay. Browsers refuse
 *   to autoplay with sound, and iOS takes a non-inline video fullscreen.
 * - `aria-hidden` and no tab stop, because it carries no information. A
 *   decorative video that screen readers announce is noise.
 * - `prefers-reduced-motion` pauses it to a still frame, and the listener means
 *   it reacts if the visitor changes that preference while the page is open —
 *   a media query evaluated only on mount silently stops honouring it.
 *
 * On file size: keep source media OUT of the repository. A hero background at
 * 1920px wide, CRF 27, no audio track, `+faststart` is a couple of megabytes;
 * the 4K original is tens of megabytes and lives in git history forever. Upload
 * to Vercel Blob or Sanity and pass the URL.
 */
export function BackgroundVideo({
  src,
  poster,
  className,
}: BackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (media.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        // play() rejects if the browser declines autoplay; the poster stays.
        void video.play().catch(() => {});
      }
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
