import { useState, useEffect } from "react";

/**
 * Spinner shown while data is being fetched.
 *
 * The API runs on a free tier that sleeps after 15 minutes idle, so the first
 * request after a quiet spell can take up to a minute. Vercel serves this UI
 * instantly, which means a cold start looks like a working page stuck on
 * "Loading..." — i.e. broken.
 *
 * Pass `explain` to reveal a short note about the delay, but only after the
 * request has already taken longer than a warm response would. A fast load
 * never shows it; a slow one explains itself.
 */
export default function LoadingNotice({ explain = false, delayMs = 4000 }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), delayMs);
    // Cleanup matters: if the data arrives before the timer fires, this
    // component unmounts and the pending setState would be a memory leak.
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 text-gray-600"
    >
      <span
        aria-hidden="true"
        className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-blue-700"
      />
      <div>
        <p>Loading…</p>
        {explain && isSlow && (
          <p className="mt-1 max-w-prose text-sm text-gray-500">
            Waking up the API — it&rsquo;s on a free tier that sleeps after
            inactivity, so the first request can take up to a minute. Everything
            is quick once it&rsquo;s awake.
          </p>
        )}
      </div>
    </div>
  );
}
