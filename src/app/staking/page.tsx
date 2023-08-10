import { ApiProvider, GraphQLProvider, StakingProvider } from "@/providers";
import dynamic from "next/dynamic";

const StakingDashboard = dynamic(() => import("@/components/staking-dashboard"), { ssr: false });

export default function Staking() {
  return (
    <div className="flex flex-col gap-10 p-large lg:container lg:mx-auto lg:px-0 lg:pb-5 lg:pt-8">
      <ApiProvider>
        <StakingProvider>
          <GraphQLProvider>
            <StakingDashboard />
          </GraphQLProvider>
        </StakingProvider>
      </ApiProvider>
    </div>
  );
}
