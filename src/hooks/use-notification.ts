import { NotificationContext } from "@/providers";
import { useContext } from "react";

export const useNotification = () => useContext(NotificationContext);
