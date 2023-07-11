import { useContext } from "react";
import { AppContext } from "../providers/app";

export const useApp = () => useContext(AppContext);
