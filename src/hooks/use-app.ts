import { AppContext } from "@/providers";
import { useContext } from "react";

export const useApp = () => useContext(AppContext);
