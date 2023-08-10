import dynamic from "next/dynamic";

const Login = dynamic(() => import("@/components/login"), { ssr: false });

export default function Home() {
  return (
    <div className="home-page p-large pt-0 lg:pt-large">
      <div className="container mx-auto flex h-full flex-col items-center justify-center gap-6 bg-component">
        <Login />
      </div>
    </div>
  );
}
