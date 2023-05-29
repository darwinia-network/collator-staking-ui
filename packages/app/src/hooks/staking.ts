import { useContext } from "react";
import { StakingContext } from "../providers";

export const useStaking = () => useContext(StakingContext);
