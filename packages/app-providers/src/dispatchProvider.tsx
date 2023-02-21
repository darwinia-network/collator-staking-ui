import { DispatchCtx, StakeAndNominateParams } from "@darwinia/app-types";
import { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { clientBuilder } from "darwinia-js-sdk";
import { Web3Provider } from "@ethersproject/providers";
import { HexString } from "@polkadot/util/types";
import { ethers } from "ethers";

const initialState: DispatchCtx = {
  setCollatorSessionKey: (sessionKey: string, provider: Web3Provider | undefined) => {
    //do nothing
    return Promise.resolve(true);
  },
  stakeAndNominate: (params: StakeAndNominateParams) => {
    //do nothing
    return Promise.resolve(true);
  },
};

const DispatchContext = createContext(initialState);

export const DispatchProvider = ({ children }: PropsWithChildren) => {
  const getClient = (provider: Web3Provider) => {
    return clientBuilder.buildPangolin2Client(provider);
  };
  const setCollatorSessionKey = useCallback(
    async (sessionKey: string, provider: Web3Provider | undefined): Promise<boolean> => {
      try {
        if (!provider) {
          return Promise.resolve(false);
        }

        /* We appended 00 to the session key to represent that we don't need any proof. Originally the setKeys method
         * required two params which are session key and proof but here we append both values into one param */
        const sessionKeyWithProof = `${sessionKey}00`;
        const res = await getClient(provider).calls.session.setKeysH(
          provider.getSigner(),
          sessionKeyWithProof as HexString
        );

        return Promise.resolve(true);
      } catch (e) {
        console.log(e);
        return Promise.resolve(false);
      }
    },
    []
  );

  const stakeAndNominate = useCallback(
    async ({ provider, collatorAddress, ringAmount, ktonAmount, depositIds }: StakeAndNominateParams) => {
      try {
        if (!provider) {
          return Promise.resolve(false);
        }
        const signer = provider.getSigner();
        // prepare calls
        const nominateCall = getClient(provider).calls.staking.buildNominateCall(collatorAddress);
        const ids = depositIds.map((item) => item.toString());
        console.log("ids staked====", ids);
        /*The ring and kton values should simply be in wei then converted to string NOT BigNumber */
        const stakeCall = getClient(provider).calls.staking.buildStakeCall(
          ringAmount.toString(),
          ktonAmount.toString(),
          ids
        );

        // dispatch
        const res = await getClient(provider).calls.utility.batchAll(signer, [stakeCall, nominateCall]);
        console.log(res);
        return true;
      } catch (e) {
        console.log(e);
        return Promise.resolve(false);
      }
    },
    []
  );

  return (
    <DispatchContext.Provider
      value={{
        setCollatorSessionKey,
        stakeAndNominate,
      }}
    >
      {children}
    </DispatchContext.Provider>
  );
};

export const useDispatch = () => useContext(DispatchContext);
