import { useState } from "react";

const useSession = () => {
  /* These values are now just static since the chain doesn't store these values */
  const [sessionDuration, setSessionDuration] = useState<number>(24 * 60 * 60);
  const [unbondingDuration, setUnbondingDuration] = useState<number>(14 * 24 * 60 * 60);
  return {
    sessionDuration,
    unbondingDuration,
  };
};

export default useSession;
