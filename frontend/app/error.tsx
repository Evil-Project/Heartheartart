"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons/faArrowRotateRight";
import { usePreferences } from "@/components/preferences-provider";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { messages } = usePreferences();

  return (
    <main className="error-state">
      <h1>{messages.errorTitle}</h1>
      <button type="button" onClick={reset}>
        <FontAwesomeIcon icon={faArrowRotateRight} aria-hidden="true" />
        {messages.tryAgain}
      </button>
    </main>
  );
}
