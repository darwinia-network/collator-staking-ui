import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface AppCtx {
  isWrongChainPromptOpen: boolean;
  setIsWrongChainPromptOpen: Dispatch<SetStateAction<boolean>>;
}

const defaultValue: AppCtx = {
  isWrongChainPromptOpen: false,
  setIsWrongChainPromptOpen: () => undefined,
};

export const AppContext = createContext<AppCtx>(defaultValue);

export const AppProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [isWrongChainPromptOpen, setIsWrongChainPromptOpen] = useState(defaultValue.isWrongChainPromptOpen);

  return (
    <AppContext.Provider value={{ isWrongChainPromptOpen, setIsWrongChainPromptOpen }}>{children}</AppContext.Provider>
  );
};
