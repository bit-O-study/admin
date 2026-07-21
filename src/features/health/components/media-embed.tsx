"use client";

import { useRef } from "react";

import type { MediaKind } from "@/features/health/exercise-media";

type Embed = { provider: "youtube" | "vimeo"; id: string };

const GUIDE_RATE = 0.5;

function parseEmbed(url: string): Embed | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? { provider: "youtube", id } : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? { provider: "youtube", id } : null;
      }
      const v = u.searchParams.get("v");
      return v ? { provider: "youtube", id: v } : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? { provider: "vimeo", id } : null;
    }
    return null;
  } catch {
    return null;
  }
}

function embedSrc(e: Embed, autoPlay: boolean): string {
  if (e.provider === "youtube") {
    const p = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      iv_load_policy: "3",
    });
    if (autoPlay) {
      p.set("autoplay", "1");
      p.set("mute", "1");
      p.set("loop", "1");
      p.set("playlist", e.id);
      p.set("controls", "0");
      p.set("fs", "0");
      p.set("disablekb", "1");
      p.set("enablejsapi", "1");
    }
    return `https://www.youtube-nocookie.com/embed/${e.id}?${p.toString()}`;
  }
  const p = new URLSearchParams({
    playsinline: "1",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  if (autoPlay) {
    p.set("autoplay", "1");
    p.set("muted", "1");
    p.set("loop", "1");
    p.set("controls", "0");
  }
  return `https://player.vimeo.com/video/${e.id}?${p.toString()}`;
}

function tuneIframe(
  iframe: HTMLIFrameElement | null,
  provider: "youtube" | "vimeo",
) {
  const win = iframe?.contentWindow;
  if (!win) return;
  if (provider === "youtube") {
    const cmds: [string, unknown[]][] = [
      ["unMute", []],
      ["setVolume", [100]],
      ["setPlaybackRate", [GUIDE_RATE]],
      ["playVideo", []],
    ];
    for (const [func, args] of cmds) {
      win.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    }
  } else {
    const target = "https://player.vimeo.com";
    win.postMessage(JSON.stringify({ method: "setVolume", value: 1 }), target);
    win.postMessage(
      JSON.stringify({ method: "setPlaybackRate", value: GUIDE_RATE }),
      target,
    );
  }
}

/** 운동 미디어. 유튜브/Vimeo 는 iframe, mp4 는 video, gif/이미지는 img. */
export function MediaEmbed({
  url,
  kind,
  className = "",
  autoPlay = false,
}: {
  url: string;
  kind: MediaKind;
  className?: string;
  autoPlay?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const embed = parseEmbed(url);
  const base = `relative w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-black ${className}`;

  function onIframeLoad() {
    if (!autoPlay || !embed) return;
    [150, 600, 1300, 2500].forEach((t) =>
      setTimeout(() => tuneIframe(iframeRef.current, embed.provider), t),
    );
  }

  if (embed) {
    return (
      <div className={base} style={{ aspectRatio: "16 / 9" }}>
        <iframe
          ref={iframeRef}
          src={embedSrc(embed, autoPlay)}
          title="운동 시범 영상"
          className="h-full w-full"
          onLoad={onIframeLoad}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {autoPlay ? (
          <div className="absolute inset-0" aria-hidden="true" />
        ) : null}
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={base}>
        <video
          src={url}
          controls={!autoPlay}
          playsInline
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={autoPlay}
          onLoadedMetadata={(e) => {
            if (autoPlay) e.currentTarget.playbackRate = GUIDE_RATE;
          }}
          onPlay={(e) => {
            if (autoPlay) e.currentTarget.muted = false;
          }}
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className={base}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="운동 시범 움짤" className="h-auto w-full object-contain" />
    </div>
  );
}