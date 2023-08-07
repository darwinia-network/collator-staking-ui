import { AppProvider, RainbowProvider } from "@/providers";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import Footer from "@/components/footer";
import Header from "@/components/header";
import WrongChainAlert from "@/components/wrong-chain-alert";

const fontJetBrainsMono = JetBrains_Mono({ subsets: ["latin", "latin-ext"] });

export const metadata = {
  title: "Darwinia Staking",
  description: "Darwinia and Crab network staking app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-app-black text-white">
      <body className={fontJetBrainsMono.className}>
        <AppProvider>
          <RainbowProvider>
            <Header className="app-header" />
            <main className="app-main">{children}</main>
            <Footer className="app-footer" />

            <WrongChainAlert />
          </RainbowProvider>
        </AppProvider>
      </body>
    </html>
  );
}
