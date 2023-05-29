import { useState } from "react";

export const useSession = () => {
  /* These values are now just static since the chain doesn't store these values */
  const [sessionDuration] = useState<number>(24 * 60 * 60);
  const [unbondingDuration] = useState<number>(14 * 24 * 60 * 60);

  return { sessionDuration, unbondingDuration };
};
