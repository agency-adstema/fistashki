"use client";

import { Navigation } from "lucide-react";
import {
  buildGoogleMapsDirectionsEmbedUrl,
  buildGoogleMapsNavigationUrl,
} from "@/lib/countdown";
import { RESTAURANT } from "@/lib/data/menu";

export function DeliveryRouteMap({
  destinationAddress,
  destinationCity,
}: {
  destinationAddress?: string | null;
  destinationCity?: string | null;
}) {
  const destination = [destinationAddress, destinationCity].filter(Boolean).join(", ");
  if (!destination.trim()) return null;

  const origin = RESTAURANT.address;
  const embedUrl = buildGoogleMapsDirectionsEmbedUrl(origin, destination);
  const navUrl = buildGoogleMapsNavigationUrl(origin, destination);

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-700 bg-black/30">
      <div className="border-b border-gray-800 px-3 py-2 text-xs text-gray-400">
        <span className="text-[#FFB800]">Polazak:</span> {origin}
        <span className="mx-2">→</span>
        <span className="text-white">{destination}</span>
      </div>
      <iframe
        title={`Ruta do ${destination}`}
        src={embedUrl}
        className="h-56 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="border-t border-gray-800 p-3">
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB800] px-4 py-3.5 text-base font-black text-black active:scale-[0.98]"
        >
          <Navigation className="h-5 w-5" />
          Navigacija — Google Maps
        </a>
        <p className="mt-2 text-center text-xs text-gray-500">
          Otvara Maps sa rutom do kupca (vožnja)
        </p>
      </div>
    </div>
  );
}
