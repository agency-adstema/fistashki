"use client";

import { io, Socket } from "socket.io-client";

const WS_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4100";

let adminSocket: Socket | null = null;
let trackSocket: Socket | null = null;
let trackSocketToken: string | null = null;

let orderAudioCtx: AudioContext | null = null;
let orderAudioUnlocked = false;
let orderAudioUnlockListenersAttached = false;

export function isOrderAudioUnlocked() {
  return orderAudioUnlocked;
}

/** Call once in admin shell — unlocks Web Audio after first user gesture (browser policy). */
export function initOrderAudio() {
  if (typeof window === "undefined" || orderAudioUnlockListenersAttached) return;
  orderAudioUnlockListenersAttached = true;

  const unlock = async () => {
    try {
      if (!orderAudioCtx) orderAudioCtx = new AudioContext();
      if (orderAudioCtx.state === "suspended") await orderAudioCtx.resume();
      orderAudioUnlocked = true;
    } catch {
      // ignore
    }
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("pointerdown", unlock);
  document.addEventListener("keydown", unlock);
}

export function getOrdersSocket(token?: string, trackToken?: string) {
  if (trackToken) {
    if (trackSocket?.connected && trackSocketToken === trackToken) {
      return trackSocket;
    }
    trackSocket?.disconnect();
    trackSocket = io(`${WS_BASE}/orders`, {
      auth: { trackToken },
      transports: ["websocket", "polling"],
    });
    trackSocketToken = trackToken;
    return trackSocket;
  }

  if (adminSocket?.connected) return adminSocket;
  adminSocket?.disconnect();
  adminSocket = io(`${WS_BASE}/orders`, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return adminSocket;
}

export function disconnectOrdersSocket() {
  adminSocket?.disconnect();
  trackSocket?.disconnect();
  adminSocket = null;
  trackSocket = null;
  trackSocketToken = null;
}

export async function playNewOrderSound() {
  try {
    if (typeof window === "undefined") return;
    if (!orderAudioCtx) orderAudioCtx = new AudioContext();
    if (orderAudioCtx.state === "suspended") {
      await orderAudioCtx.resume();
    }
    orderAudioUnlocked = true;

    const ctx = orderAudioCtx;
    const melody = [
      { freq: 880, at: 0, dur: 0.22 },
      { freq: 1108.73, at: 0.12, dur: 0.22 },
      { freq: 1318.51, at: 0.24, dur: 0.35 },
      { freq: 880, at: 0.55, dur: 0.22 },
      { freq: 1108.73, at: 0.67, dur: 0.22 },
      { freq: 1318.51, at: 0.79, dur: 0.45 },
    ];

    melody.forEach(({ freq, at, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = ctx.currentTime + at;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  } catch {
    // ignore if audio blocked
  }
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon.png" });
  }
}
