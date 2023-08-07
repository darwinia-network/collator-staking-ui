import { ApiContext } from "@/providers";
import { useContext } from "react";

export const useApi = () => useContext(ApiContext);
