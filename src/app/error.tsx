"use client"; // Error components must be Client Components

import ErrorCatcher from "@/components/error-catcher";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="error-boundary flex items-center justify-center">
      <ErrorCatcher action={reset} actionText="Try again" />
    </div>
  );
}
