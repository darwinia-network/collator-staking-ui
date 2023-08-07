import dynamic from "next/dynamic";
import NetworkSelector from "./network-selector";
import Image from "next/image";
import CustomRpc from "../custom-rpc";

const User = dynamic(() => import("./user"), { ssr: false });

export default function Header({ className }: { className: string }) {
  return (
    <div className={`${className} z-20 flex items-center bg-app-black px-large`}>
      <div className="container mx-auto flex items-center justify-between">
        <Image width={156} height={18} alt="Logo" src="/images/logo.png" className="hidden lg:block" />
        <div className="lg:hidden">
          <User />
        </div>
        <div className="lg:hidden">
          <NetworkSelector />
        </div>

        <div className="hidden items-center gap-10 lg:flex">
          <NetworkSelector />
          <div className="flex items-center gap-middle">
            <User />
            <CustomRpc />
          </div>
        </div>
      </div>
    </div>
  );
}
