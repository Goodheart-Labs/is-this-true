import "posthog-js/dist/array.no-external.js";
import type { PostHog } from "posthog-js";

let ctx: {
  posthog: any;
} = {
  posthog: null,
};

export function initPostHog() {
  // @ts-ignore
  ctx.posthog = (posthog as PostHog).init(
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
    {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      persistence: "localStorage",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
    }
  );
}

export function getPostHog() {
  return ctx.posthog;
}
