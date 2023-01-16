import { useState } from "react";

const useSession = () => {
  const [sessionDuration, setSessionDuration] = useState<number>(24 * 60 * 60);
  const [unbondingDuration, setUnbondingDuration] = useState<number>(14 * 24 * 60 * 60);
  return {
    sessionDuration,
    unbondingDuration,
  };
};

export default useSession;
