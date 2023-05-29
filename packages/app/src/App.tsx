import { Outlet } from "react-router-dom";
import { Spinner } from "@darwinia/ui";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <Spinner isLoading={false} maskClassName={"!fixed !z-[99]"}>
      <div className={"w-full"}>
        <Header />
        <div className={"flex flex-col min-h-screen justify-center flex-1 pt-[80px] lg:pt-[90px]"}>
          {/*apply padding*/}
          <div className={"flex flex-1 flex-col wrapper-padding items-center"}>
            {/*apply max-width*/}
            <div className={"flex flex-col flex-1 app-container w-full"}>
              <Outlet />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </Spinner>
  );
}
