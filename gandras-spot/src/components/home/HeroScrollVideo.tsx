"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";

const VIDEO_SRC = "/videos/burger-scroll.mp4";

export function HeroScrollVideo() {
  const reduce = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0.85]);
  const copyY = useTransform(scrollYProgress, [0, 0.12], [16, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      setDuration(video.duration);
      setReady(true);
      video.pause();
      video.currentTime = reduce ? video.duration - 0.05 : 0;
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
    };
  }, [reduce]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reduce) return;
    const video = videoRef.current;
    if (!video || !ready || duration <= 0) return;
    const t = Math.min(Math.max(progress * duration, 0), duration - 0.04);
    if (Math.abs(video.currentTime - t) > 0.03) {
      video.currentTime = t;
    }
  });

  return (
    <section
      ref={containerRef}
      className={reduce ? "relative bg-black" : "relative h-[420vh] bg-black sm:h-[480vh]"}
    >
      <div className={reduce ? "relative" : "sticky top-0 h-[100dvh] overflow-hidden"}>
        <div className="relative flex h-[100dvh] flex-col items-center justify-center px-4 sm:px-8">
          <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              muted
              playsInline
              preload="auto"
              aria-label="Gandras Spot burger assembly animation"
              className="max-h-[78dvh] w-full object-contain"
              poster="/images/hero-scroll/bun-base.png"
            />

            {!ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-pulse rounded-full border-2 border-[#F6A300]/40 border-t-[#F6A300]" />
              </div>
            )}
          </div>

          <motion.div
            style={{ opacity: copyOpacity, y: copyY }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-10 pt-24 sm:px-10 lg:pb-14"
          >
            <div className="pointer-events-auto mx-auto flex max-w-7xl flex-col items-center gap-4 text-center lg:items-start lg:text-left">
              <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl lg:text-5xl">
                <span className="block">Gandras</span>
                <span className="block text-[#F6A300]">Burgers</span>
              </h1>
              <p className="text-sm text-zinc-400">{`The taste that's hard to find`}</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild variant="hero" size="hero" className="w-full sm:w-auto">
                  <Link href="/order">
                    PORUČI ODMAH
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="hero"
                  className="w-full rounded-lg border border-white/20 bg-transparent font-bold uppercase tracking-wide text-white hover:bg-white/10 sm:w-auto"
                >
                  <a href="#meni">POGLEDAJ MENI</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
