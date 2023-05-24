import { Storage } from "../types";

const STORAGE_KEY = "darwinia:staking";

export const setStore = (key: keyof Storage, value: unknown) => {
  try {
    const oldValue = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const newValue = {
      ...oldValue,
      [key]: value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
  } catch (e) {
    //ignore
  }
};

export const getStore = <T = unknown>(key: keyof Storage): T | undefined | null => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Storage;
    return value[key] as T | undefined | null;
  } catch (e) {
    return undefined;
  }
};
