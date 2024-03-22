import dynamic from "next/dynamic";
import Image from "next/image";

const ChainSwitch = dynamic(() => import("./chain-switch"), { ssr: false });
const User = dynamic(() => import("./user"), { ssr: false });

export default function Header({ className }: { className: string }) {
  return (
    <div className={`${className} z-20 flex items-center bg-app-black px-large`}>
      <div className="container mx-auto flex items-center justify-between">
        <Image width={156} height={18} alt="Logo" src="/images/logo.png" className="hidden lg:block" />

        <div className="flex w-full items-center justify-between gap-1 lg:w-fit lg:gap-middle">
          <ChainSwitch />
          <User />
        </div>
      </div>
    </div>
  );
}
