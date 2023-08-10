"use client";

import ErrorCatcher from "@/components/error-catcher";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="error-boundary flex items-center justify-center">
      <ErrorCatcher title="404" message="Page not found." action={() => router.replace("/")} actionText="Go home >" />
    </div>
  );
}
