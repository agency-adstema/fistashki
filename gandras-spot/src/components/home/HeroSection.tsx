"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const VIDEO_SRC = "/videos/burger-scroll.mp4?v=2207";

export function HeroSection() {
  const reduce = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduce) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.currentTime = 0;
    void video.play().catch(() => {
      /* autoplay blocked until interaction */
    });
  }, [reduce]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      // korisnik je uključio zvuk — pusti video još jednom od početka
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
  };

  return (
    <section className="w-full bg-white px-0 pt-0 md:px-10 md:pt-5 lg:px-16 lg:pt-6 xl:px-20">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full md:max-w-6xl"
      >
        <div className="relative overflow-hidden bg-black md:rounded-lg md:border md:border-gray-200 md:shadow-sm">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay={!reduce}
            muted={muted}
            playsInline
            preload="auto"
            aria-label="Gandras Spot — burger animation"
            className="block h-auto w-full"
          />

          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Uključi zvuk" : "Isključi zvuk"}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
