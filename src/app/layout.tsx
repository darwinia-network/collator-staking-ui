import { ApiProvider, AppProvider, RainbowProvider, StakingProvider } from "@/providers";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import Footer from "@/components/footer";
import Header from "@/components/header";

const fontJetBrainsMono = JetBrains_Mono({ subsets: ["latin", "latin-ext"] });

export const metadata = {
  title: "Collator Staking - Darwinia",
  description: "Collator staking of Darwinia and Crab network",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="text-white bg-app-black">
      <body className={fontJetBrainsMono.className}>
        <AppProvider>
          <RainbowProvider>
            <ApiProvider>
              <StakingProvider>
                <Header className="app-header" />
                <main className="app-main">{children}</main>
                <Footer className="app-footer" />
              </StakingProvider>
            </ApiProvider>
          </RainbowProvider>
        </AppProvider>
      </body>
    </html>
  );
}
