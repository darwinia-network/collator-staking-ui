import { StakingContext } from "@/providers";
import { useContext } from "react";

export const useStaking = () => useContext(StakingContext);
